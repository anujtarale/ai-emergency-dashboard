import { Request, Response, NextFunction } from 'express';
import { logActivityFromRequest } from '../services/activityService';

const activityWhitelist = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/logout',
  '/api/v1/users',
  '/api/v1/sos',
  '/api/v1/reports',
  '/api/v1/admin',
  '/api/v1/features',
  '/api/v1/contacts'
];

const shouldLogActivity = (req: Request): boolean => {
  return activityWhitelist.some(path => req.originalUrl.startsWith(path));
};

export const activityLogger = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') return next();

  const startTime = Date.now();

  res.on('finish', async () => {
    if (!req.user || !shouldLogActivity(req)) return;

    const durationMs = Date.now() - startTime;
    const description = `${req.user?.name || 'Unknown user'} performed ${req.method} on ${req.originalUrl}`;
    const statusType = res.statusCode >= 400 ? 'failure' : 'success';

    await logActivityFromRequest(req, req.originalUrl, description, statusType as any, {
      statusCode: res.statusCode,
      durationMs,
      body: req.body
    });
  });

  next();
};
