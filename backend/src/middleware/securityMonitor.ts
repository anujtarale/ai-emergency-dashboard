import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const securityMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      duration: `${duration}ms`,
      userId: req.user?._id
    };

    if (res.statusCode >= 400) {
      logger.warn('Security event detected', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};
