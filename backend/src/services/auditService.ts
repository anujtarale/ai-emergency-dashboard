import AuditLog from '../models/AuditLog';
import { AuditAction } from '../types';
import { Request } from 'express';
import logger from '../utils/logger';

interface AuditLogData {
  userId?: string;
  action: AuditAction;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export const logAudit = async (data: AuditLogData): Promise<void> => {
  try {
    await AuditLog.create({
      userId: data.userId,
      action: data.action,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      details: data.details
    });
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
};

export const logAuditFromRequest = async (
  req: Request,
  action: AuditAction,
  details?: Record<string, any>
): Promise<void> => {
  await logAudit({
    userId: req.user?._id?.toString(),
    action,
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    details
  });
};

export const getAuditLogs = async (
  userId?: string,
  action?: AuditAction,
  limit: number = 100,
  skip: number = 0
) => {
  const query: any = {};
  if (userId) query.userId = userId;
  if (action) query.action = action;

  return await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email role');
};
