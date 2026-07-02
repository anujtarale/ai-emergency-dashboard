import rateLimit from 'express-rate-limit';

const jsonMessage = { success: false, message: 'Too many requests from this IP, please try again later' };

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: jsonMessage
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: jsonMessage
});
