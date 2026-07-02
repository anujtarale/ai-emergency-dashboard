import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User from '../models/User';
import ApiError from '../utils/apiError';
import { JwtPayload, UserRole } from '../types';
import logger from '../utils/logger';
import { getMaintenanceStatus } from './featureGuard';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    logger.warn('[AUTH] No token found');
    return next(new ApiError('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    logger.debug('[AUTH] Token verified', { userId: decoded.userId });
    
    // Maintenance Mode Check - Block non-admins even if token is valid
    const isMaintenance = await getMaintenanceStatus();
    if (isMaintenance && decoded.role !== UserRole.ADMIN) {
      logger.warn('[AUTH] Blocking authenticated non-admin user due to maintenance mode', { userId: decoded.userId });
      return next(new ApiError('System is currently under maintenance. Please try again later.', 503));
    }

    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    
    if (!user) {
      logger.warn('[AUTH] User not found', { userId: decoded.userId });
      return next(new ApiError('User not found', 404));
    }
    
    req.user = user;
    next();
  } catch (error: any) {
    logger.warn('[AUTH] Token verification failed', { error: error.message });
    return next(new ApiError('Not authorized to access this route', 401));
  }
};

export const authenticate = protect;

export const authorize = (...roles: (UserRole | string)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Not authorized', 401));
    }

    // Allow comparison with string values or UserRole enum values
    const hasRole = roles.some(role => req.user.role === role);

    if (!hasRole) {
      return next(
        new ApiError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

