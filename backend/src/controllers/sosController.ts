import { Request, Response, NextFunction } from 'express';
import * as sosService from '../services/sosService';
import { logAuditFromRequest } from '../services/auditService';
import { logActivityFromRequest } from '../services/activityService';
import { AuditAction } from '../types';
import logger from '../utils/logger';
import ApiError from '../utils/apiError';
import { UserRole } from '../types';

export const createSOS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`[SOS] Creating SOS request for user: ${req.user._id}`);
    logger.debug('[SOS] Request body:', req.body);
    
    const sos = await sosService.createSOS(req.user._id, req.body);
    const sosId = (sos as any)?.sosId || (sos as any)?.id || 'unknown';
    logger.info(`[SOS] ✅ SOS created successfully: ${sosId}`, {
      userId: req.user._id,
      sosId,
      location: (sos as any)?.location || sos.location,
      emergencyType: sos.emergencyType,
      status: sos.status
    });

    // Log audit event
    await logAuditFromRequest(req, AuditAction.SOS_CONFIRMED, {
      sosId,
      emergencyType: sos.emergencyType,
      location: sos.location,
      address: sos.address
    });
    
    // Log activity event
    await logActivityFromRequest(
      req,
      'SOS_CONFIRMED',
      `User confirmed SOS ${sosId} (${sos.emergencyType})`,
      'success',
      {
        sosId,
        priority: sos.priority,
        address: sos.address,
        notes: sos.notes
      }
    );
    
    const io = req.app.get('io');
    if (io) {
      logger.info(`[SOS] 📡 Broadcasting sos-alert to admin-dashboard room`, {
        sosId,
        timestamp: new Date().toISOString()
      });
      io.to('admin-dashboard').emit('sos-alert', sos);
      io.to('admin-dashboard').emit('activity-log', {
        userId: req.user._id,
        sosId,
        actionType: 'SOS_CONFIRMED',
        description: `SOS report created by ${req.user.name}`,
        priority: sos.priority,
        status: sos.status,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.warn('[SOS] ⚠️ Socket.IO not available, skipping broadcast');
    }
    
    res.status(201).json({
      success: true,
      data: sos
    });
  } catch (error: any) {
    logger.error(`[SOS] ❌ Error creating SOS:`, {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      details: error?.errors || error?.details,
      stack: error?.stack
    });
    
    // Return more detailed error to frontend
    if (error?.errors) {
      // Validation error from Mongoose
      const validationErrors = Object.values(error.errors)
        .map((e: any) => e.message)
        .join(', ');
      return next(new Error(`Validation failed: ${validationErrors}`));
    }
    
    next(error);
  }
};

export const getSOSById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sos = await sosService.getSOSById(req.params.id);
    
    if (!sos) {
      return next(new ApiError('SOS not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: sos
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const getUserSOS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sosList = await sosService.getUserSOS(req.user._id);
    
    res.status(200).json({
      success: true,
      data: sosList
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const resolveSOS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let sos;
    
    if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.MODERATOR) {
      const { status, responderId } = req.body;
      const updateData: any = {};
      if (status) updateData.status = status;
      if (responderId) updateData.responderId = responderId;
      
      if (Object.keys(updateData).length === 0) {
        updateData.status = 'resolved';
      }
      
      sos = await sosService.adminUpdateSOS(req.params.id, updateData);

      // Log admin audit event
      await logAuditFromRequest(req, AuditAction.SOS_UPDATED, {
        sosId: req.params.id,
        updateData
      });
      
      // Log admin activity
      await logActivityFromRequest(
        req,
        'SOS_STATUS_UPDATED',
        `Admin updated SOS ${req.params.id} status to ${updateData.status || 'resolved'}`,
        'info',
        { updateData }
      );

      const io = req.app.get('io');
      if (io && sos) {
        io.to('admin-dashboard').emit('sos-updated', sos);
        io.to('admin-dashboard').emit('activity-log', {
          userId: req.user._id,
          sosId: req.params.id,
          actionType: 'SOS_STATUS_UPDATED',
          description: `Admin changed SOS status to ${sos.status}`,
          status: sos.status,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      sos = await sosService.resolveSOS(req.params.id, req.user._id);

      // Log user audit event
      await logAuditFromRequest(req, AuditAction.SOS_RESOLVED, {
        sosId: req.params.id
      });
      
      // Log user activity
      await logActivityFromRequest(
        req,
        'SOS_RESOLVED',
        `User resolved SOS ${req.params.id}`,
        'success',
        {}
      );
    }
    
    if (!sos) {
      return next(new ApiError('SOS not found or unauthorized to update', 404));
    }
    
    res.status(200).json({
      success: true,
      data: sos
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const getAllActiveSOS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sosList = await sosService.getAllActiveSOS();
    
    res.status(200).json({
      success: true,
      data: sosList
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const adminGetAllSOS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sosList = await sosService.adminGetAllSOS();
    logger.info(`Admin fetched all SOS records: ${sosList.length} records found`);
    
    res.status(200).json({
      success: true,
      count: sosList.length,
      data: sosList
    });
  } catch (error: any) {
    logger.error('Error fetching all SOS for admin:', error);
    next(error);
  }
};

export const getNearbySOS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, maxDistance } = req.query;
    
    if (!lat || !lng) {
      return next(new ApiError('Latitude and longitude are required', 400));
    }

    const sosList = await sosService.getNearbySOS(
      parseFloat(lat as string),
      parseFloat(lng as string),
      maxDistance ? parseFloat(maxDistance as string) : 10000
    );
    
    res.status(200).json({
      success: true,
      count: sosList.length,
      data: sosList
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};
