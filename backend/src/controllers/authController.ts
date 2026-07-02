import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { getUserSessions, revokeSession } from '../services/authService';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';
import config from '../config';
import { getMaintenanceStatus } from '../middleware/featureGuard';
import { UserRole } from '../types';

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProduction = config.nodeEnv === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Block registration during maintenance unless requester is somehow already an admin (rare)
    const isMaintenance = await getMaintenanceStatus();
    if (isMaintenance) {
      return next(new ApiError('Registration is temporarily disabled for maintenance.', 503));
    }

    const { name, email, password, role } = req.body;

    const result = await authService.register(
      { name, email, password, role },
      req.ip,
      req.get('user-agent')
    );

    if (result.accessToken && result.refreshToken) {
      setAuthCookies(res, result.accessToken, result.refreshToken);
    }

    res.status(201).json({
      success: true,
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(
      email,
      password,
      req.ip,
      req.get('user-agent')
    );

    if (!result) {
      return next(new ApiError('Invalid email or password', 401));
    }

    if ('error' in result && result.error === 'ACCOUNT_LOCKED') {
      return next(new ApiError('Account locked due to too many failed attempts', 423, true, [{
        lockUntil: (result as any).lockUntil
      }]));
    }

    const authResult = result as {
      user: any;
      accessToken: string;
      refreshToken: string;
    };

    // Maintenance Mode Check - Block non-admins from logging in
    const isMaintenance = await getMaintenanceStatus();
    if (isMaintenance && authResult.user && authResult.user.role !== UserRole.ADMIN) {
      logger.warn(`[Login] Blocking non-admin login during maintenance: ${email}`);
      return next(new ApiError('The system is under maintenance. Only administrators can log in at this time.', 503));
    }

    if (authResult.accessToken && authResult.refreshToken) {
      setAuthCookies(res, authResult.accessToken, authResult.refreshToken);
    }

    res.status(200).json({
      success: true,
      user: authResult.user,
      accessToken: authResult.accessToken
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(new ApiError('No refresh token provided', 401));
    }

    const result = await authService.refreshAccessToken(
      refreshToken,
      req.ip,
      req.get('user-agent')
    );

    if (!result) {
      clearAuthCookies(res);
      return next(new ApiError('Invalid refresh token', 401));
    }

    if (result.accessToken && result.refreshToken) {
      setAuthCookies(res, result.accessToken, result.refreshToken);
    }

    res.status(200).json({
      success: true
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.user._id, req.cookies.refreshToken);

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const logoutAllDevices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.user._id);

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const resetToken = await authService.forgotPassword(email);

    if (resetToken) {
      logger.info(`Password reset token for ${email}: ${resetToken}`);
    }

    res.status(200).json({
      success: true,
      message: 'If that email exists, we have sent password reset instructions'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    const success = await authService.resetPassword(
      token,
      password,
      req.ip,
      req.get('user-agent')
    );

    if (!success) {
      return next(new ApiError('Invalid or expired token', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const success = await authService.changePassword(
      req.user._id,
      currentPassword,
      newPassword,
      req.ip,
      req.get('user-agent')
    );

    if (!success) {
      return next(new ApiError('Current password is incorrect', 401));
    }

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    const user = await authService.verifyEmail(
      token,
      req.ip,
      req.get('user-agent')
    );

    if (!user) {
      return next(new ApiError('Invalid or expired verification token', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const verificationToken = await authService.resendVerificationEmail(
      email,
      req.ip,
      req.get('user-agent')
    );

    if (verificationToken) {
      logger.info(`Email verification token for ${email}: ${verificationToken}`);
    }

    res.status(200).json({
      success: true,
      message: 'If that email exists and is not verified, we have sent verification instructions'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const getSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await getUserSessions(req.user._id);

    res.status(200).json({
      success: true,
      sessions
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const revokeSessionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    const session = await revokeSession(sessionId, req.user._id);

    if (!session) {
      return next(new ApiError('Session not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error: any) {
    logger.error(error);
    next(error);
  }
};
