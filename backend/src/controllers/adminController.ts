import { Request, Response, NextFunction } from 'express';
import os from 'os';
import User from '../models/User';
import SOSRequest from '../models/SOSRequest';
import EmergencyReport from '../models/EmergencyReport';
import AuditLog from '../models/AuditLog';
import Session from '../models/Session';
import Feature from '../models/Feature';
import SystemSetting from '../models/SystemSetting';
import { getAuditLogs, logAuditFromRequest } from '../services/auditService';
import { AuditAction } from '../types';
import ApiError from '../utils/apiError';
import { refreshFeatureCache } from '../middleware/featureGuard';
import logger from '../utils/logger';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`[Admin] Fetching stats for admin: ${req.user._id}`);
    
    // 1. User Stats
    const totalUsers = await User.countDocuments();
    const activeSessionUserIds = await Session.distinct('userId', {
      isValid: true,
      expiresAt: { $gt: new Date() }
    });
    const activeUsersCount = activeSessionUserIds.length;

    // 2. SOS Stats
    const totalSOS = await SOSRequest.countDocuments();
    const pendingSOS = await SOSRequest.countDocuments({ status: 'pending' });
    const activeSOS = await SOSRequest.countDocuments({ status: 'active' });
    const resolvedSOS = await SOSRequest.countDocuments({ status: 'resolved' });
    const cancelledSOS = await SOSRequest.countDocuments({ status: 'cancelled' });
  
    // 3. Emergency Reports Stats
    const totalReports = await EmergencyReport.countDocuments();
    const submittedReports = await EmergencyReport.countDocuments({ status: 'submitted' });
    const reviewingReports = await EmergencyReport.countDocuments({ status: 'reviewing' });
    const resolvedReports = await EmergencyReport.countDocuments({ status: 'resolved' });
    const rejectedReports = await EmergencyReport.countDocuments({ status: 'rejected' });

    logger.info(`[Admin] Fetched stats:`, {
      totalUsers,
      activeUsers: activeUsersCount,
      totalSOS,
      totalReports,
      pendingSOS,
      activeSOS,
      submittedReports,
      reviewingReports
    });

    // 4. System Health
    const memUsage = process.memoryUsage();
    const freeMemBytes = os.freemem();
    const totalMemBytes = os.totalmem();
    
    const systemHealth = {
      uptime: process.uptime(),
      dbConnected: req.app.get('db_status') !== 'disconnected', // Fallback or readyState check
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        freeMemPercent: Math.round((freeMemBytes / totalMemBytes) * 100)
      },
      cpu: {
        loadAvg: os.loadavg(),
        cores: os.cpus().length
      }
    };

    // 5. Recent Activity Logs
    const recentLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(15)
      .populate('userId', 'name email role');

    // 6. Analytics Trend (Reports in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const reportsTrend = await EmergencyReport.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsersCount || 1 // fallback to 1 if empty
        },
        sos: {
          total: totalSOS,
          pending: pendingSOS,
          active: activeSOS,
          resolved: resolvedSOS,
          cancelled: cancelledSOS
        },
        reports: {
          total: totalReports,
          submitted: submittedReports,
          reviewing: reviewingReports,
          resolved: resolvedReports,
          rejected: rejectedReports
        },
        health: systemHealth,
        recentLogs,
        reportsTrend
      }
    });
  } catch (error) {
    logger.error('Error fetching admin stats:', error);
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({}, '-password -refreshToken').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return next(new ApiError('User ID and role are required', 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    user.role = role;
    await user.save();

    // Log audit event
    await logAuditFromRequest(req, AuditAction.ROLE_CHANGE, {
      targetUserId: userId,
      newRole: role
    });

    logger.info(`User ${user.email} role updated to ${role} by Admin`);

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getFeatures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const features = await Feature.find({}).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: features
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFeature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params;
    const { isEnabled } = req.body;

    if (isEnabled === undefined) {
      return next(new ApiError('isEnabled parameter is required', 400));
    }

    const feature = await Feature.findOneAndUpdate(
      { name },
      { isEnabled },
      { new: true, upsert: true }
    );

    // Log audit event
    await logAuditFromRequest(req, AuditAction.ADMIN_ACTION, {
      action: 'toggleFeature',
      featureName: name,
      isEnabled
    });

    // Update backend cache immediately
    await refreshFeatureCache();

    // Notify all connected clients via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('feature-updated', { name, isEnabled });
      logger.info(`Real-time feature broadcast emitted: ${name} = ${isEnabled}`);
    }

    logger.info(`Feature flag '${name}' toggled to ${isEnabled} by Admin`);

    res.status(200).json({
      success: true,
      data: feature
    });
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({
        maintenanceMode: false,
        enableNotifications: true,
        systemLogLevel: 'info',
        backupInterval: 'weekly'
      });
    }
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await SystemSetting.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );

    // Log audit event
    await logAuditFromRequest(req, AuditAction.ADMIN_ACTION, {
      action: 'updateSettings',
      updatedFields: Object.keys(req.body)
    });

    // Broadcast maintenance mode changes in real-time via Socket.IO
    if (req.body.maintenanceMode !== undefined) {
      // Refresh cache so middleware sees the change immediately
      await refreshFeatureCache();
      
      const io = req.app.get('io');
      if (io) {
        io.emit('maintenance-updated', { maintenanceMode: settings.maintenanceMode });
        logger.info(`Maintenance mode broadcast: ${settings.maintenanceMode}`);
      }
    }

    logger.info('System settings updated by Admin');

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceStatus = async (req: Request, res: Response) => {
  try {
    const settings = await SystemSetting.findOne();
    res.status(200).json({
      success: true,
      maintenanceMode: settings?.maintenanceMode ?? false
    });
  } catch {
    res.status(200).json({ success: true, maintenanceMode: false });
  }
};

export const getActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, action, limit = 50, skip = 0 } = req.query;
    const logs = await getAuditLogs(
      userId ? String(userId) : undefined,
      action ? (action as AuditAction) : undefined,
      Number(limit),
      Number(skip)
    );
    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
