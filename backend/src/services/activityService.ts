import ActivityLog from '../models/ActivityLog';
import { Request } from 'express';
import logger from '../utils/logger';

interface ActivityData {
  userId?: string;
  username?: string;
  actionType: string;
  description: string;
  status?: 'success' | 'failure' | 'warning' | 'info';
  ipAddress?: string;
  deviceBrowser?: string;
  routePage?: string;
  details?: Record<string, any>;
}

export const logActivity = async (data: ActivityData): Promise<void> => {
  try {
    await ActivityLog.create({
      userId: data.userId,
      username: data.username,
      actionType: data.actionType,
      description: data.description,
      status: data.status || 'success',
      ipAddress: data.ipAddress,
      deviceBrowser: data.deviceBrowser,
      routePage: data.routePage,
      details: data.details
    });
  } catch (error) {
    logger.error('Failed to create activity log:', error);
  }
};

export const logActivityFromRequest = async (
  req: Request,
  actionType: string,
  description: string,
  status: 'success' | 'failure' | 'warning' | 'info' = 'success',
  details?: Record<string, any>
): Promise<void> => {
  const userAgent = req.get('user-agent') || '';
  const routePage = `${req.method} ${req.originalUrl}`;

  await logActivity({
    userId: req.user?._id?.toString(),
    username: req.user?.name,
    actionType,
    description,
    status,
    ipAddress: req.ip || req.socket.remoteAddress,
    deviceBrowser: userAgent,
    routePage,
    details
  });
};

export const getActivityLogs = async (
  userId?: string,
  actionType?: string,
  limit: number = 100,
  skip: number = 0
) => {
  const query: any = {};
  if (userId) query.userId = userId;
  if (actionType) query.actionType = actionType;

  return await ActivityLog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email role');
};
