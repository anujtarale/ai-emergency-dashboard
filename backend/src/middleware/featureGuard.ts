import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Feature from '../models/Feature';
import SystemSetting from '../models/SystemSetting';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';
import config from '../config';
import { JwtPayload, UserRole } from '../types';

// In-memory cache for features and settings
let featureCache: Record<string, boolean> = {};
let maintenanceModeCache = false;
let lastFetched = 0;
const CACHE_TTL = 5000; // 5 seconds cache TTL

export const refreshFeatureCache = async () => {
  try {
    const [features, settings] = await Promise.all([
      Feature.find({}),
      SystemSetting.findOne({}).lean()
    ]);

    const newCache: Record<string, boolean> = {};
    for (const f of features) {
      newCache[f.name] = f.isEnabled;
    }
    featureCache = newCache;
    
    // Explicitly set maintenance mode, defaulting to false if no settings found
    maintenanceModeCache = !!settings && settings.maintenanceMode === true;
    
    lastFetched = Date.now();
    logger.info(`[FeatureGuard] Cache refreshed. Maintenance: ${maintenanceModeCache}, Features: ${Object.keys(featureCache).length}`);
  } catch (error) {
    logger.error('[FeatureGuard] Error refreshing cache:', error);
  }
};

export const getFeatureStatus = async (name: string): Promise<boolean> => {
  if (Date.now() - lastFetched > CACHE_TTL || Object.keys(featureCache).length === 0) {
    await refreshFeatureCache();
  }
  return featureCache[name] !== false; // Defaults to true
};

export const getMaintenanceStatus = async (): Promise<boolean> => {
  if (Date.now() - lastFetched > CACHE_TTL) {
    await refreshFeatureCache();
  }
  return maintenanceModeCache;
};

/**
 * Middleware to block requests when system is in maintenance mode.
 * Admins are bypassed.
 */
export const maintenanceGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isMaintenance = await getMaintenanceStatus();
    
    if (!isMaintenance) {
      return next();
    }

    // 1. Allow critical system endpoints
    if (
      req.path.includes('/settings/maintenance') || 
      req.path.includes('/health') ||
      req.path.includes('/api-docs') ||
      req.path.startsWith('/api-docs')
    ) {
      return next();
    }

    // 2. Allow Admin Panel endpoints
    // Check for '/admin/' in path. adminRoutes is mounted at '/api/v1/admin'
    if (req.path.includes('/admin/')) {
      return next();
    }

    // 3. Allow login/register so they can be handled at the controller level
    // (This allows admin login while blocking user login)
    if (
      req.path.includes('/auth/login') ||
      req.path.includes('/auth/register')
    ) {
      return next();
    }

    logger.info(`[MaintenanceGuard] Checking maintenance block for path: ${req.originalUrl}`);

    // Bypass if user is an admin
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        if (decoded && decoded.role === UserRole.ADMIN) {
          logger.info(`[MaintenanceGuard] Admin bypass granted for user: ${decoded.userId}`);
          return next();
        }
        logger.warn(`[MaintenanceGuard] Non-admin attempt blocked. User: ${decoded.userId}, Role: ${decoded.role}`);
      } catch (err) {
        logger.warn(`[MaintenanceGuard] Token verification failed during maintenance check: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } else {
      logger.warn(`[MaintenanceGuard] Unauthenticated attempt blocked for path: ${req.originalUrl}`);
    }

    // If we reached here, it means maintenance is active and user is not an admin
    const error = new ApiError('The system is currently undergoing maintenance. Please try again later.', 503);
    return next(error);
  } catch (error) {
    logger.error(`[MaintenanceGuard] Error in middleware:`, error);
    next(); // Fallback to allow if middleware itself crashes, or you might prefer next(error)
  }
};

export const checkFeature = (featureName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Bypass feature check if user is an admin
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        if (decoded && decoded.role === UserRole.ADMIN) {
          return next();
        }
      } catch (err) {
        // Ignore JWT verification errors and fall back to feature check
      }
    }

    const isEnabled = await getFeatureStatus(featureName);
    if (!isEnabled) {
      return next(
        new ApiError(
          `The '${featureName}' feature is currently disabled by administrators.`,
          403
        )
      );
    }
    next();
  };
};
