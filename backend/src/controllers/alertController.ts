import { Request, Response, NextFunction } from 'express';
import * as alertService from '../services/alertService';
import logger from '../utils/logger';
import ApiError from '../utils/apiError';

export const getActiveAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await alertService.getActiveAlerts();
    
    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const createAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alert = await alertService.createAlert(req.body);
    
    // Broadcast to all users in real-time
    const io = req.app.get('io');
    if (io) {
      io.emit('new-alert', alert);
      logger.info(`[Alert] Real-time broadcast: new-alert ${(alert as any)._id}`);
    }

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const getAllAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await alertService.getAllAlerts();
    
    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const updateAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alert = await alertService.updateAlert(req.params.id, req.body);
    
    if (!alert) {
      return next(new ApiError('Alert not found', 404));
    }
    
    // Broadcast update to all users
    const io = req.app.get('io');
    if (io) {
      io.emit('update-alert', alert);
      logger.info(`[Alert] Real-time broadcast: update-alert ${(alert as any)._id}`);
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const deleteAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await alertService.deleteAlert(req.params.id);
    
    // Broadcast deletion to all users
    const io = req.app.get('io');
    if (io) {
      io.emit('delete-alert', { id: req.params.id });
      logger.info(`[Alert] Real-time broadcast: delete-alert ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};
