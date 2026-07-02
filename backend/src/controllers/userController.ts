import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import { logAuditFromRequest } from '../services/auditService';
import { AuditAction } from '../types';
import logger from '../utils/logger';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getProfile(req.user._id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.updateProfile(req.user._id, req.body);

    // Log audit event
    await logAuditFromRequest(req, AuditAction.PROFILE_UPDATE, {
      updatedFields: Object.keys(req.body)
    });
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.deleteAccount(req.user._id);
    
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};
