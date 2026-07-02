import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import ms from 'ms';
import User from '../models/User';
import Session from '../models/Session';
import LoginAttempt from '../models/LoginAttempt';
import config from '../config';
import { JwtPayload, IUser, AuditAction } from '../types';
import { logAudit } from './auditService';

const generateTokens = (userId: string, role: string) => {
  const accessTokenOptions: SignOptions = {
    expiresIn: config.jwt.accessExpire as any
  };

  const refreshTokenOptions: SignOptions = {
    expiresIn: config.jwt.refreshExpire as any
  };

  const accessToken = jwt.sign(
    { userId, role },
    config.jwt.secret,
    accessTokenOptions
  );

  const refreshToken = jwt.sign(
    { userId, role },
    config.jwt.secret,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
};

const getDeviceInfo = (userAgent?: string) => {
  return {
    userAgent,
    parsedAt: new Date()
  };
};

const getRefreshTokenExpiry = () => {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
};

export const register = async (
  userData: Partial<IUser>,
  ipAddress?: string,
  userAgent?: string
) => {
  const user = await User.create(userData);

  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

  await Session.create({
    userId: user._id,
    refreshToken,
    userAgent,
    ipAddress,
    deviceInfo: getDeviceInfo(userAgent),
    expiresAt: getRefreshTokenExpiry()
  });

  await logAudit({
    userId: user._id.toString(),
    action: AuditAction.REGISTER,
    ipAddress,
    userAgent,
    details: { email: user.email }
  });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    },
    accessToken,
    refreshToken,
    verificationToken
  };
};

export const login = async (
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const user = await User.findOne({ email }).select('+password');

  await LoginAttempt.create({
    email,
    ipAddress,
    userAgent,
    success: false
  });

  if (!user) {
    await logAudit({
      action: AuditAction.LOGIN_FAILED,
      ipAddress,
      userAgent,
      details: { email, reason: 'User not found' }
    });
    return null;
  }

  if (user.isLocked()) {
    await logAudit({
      userId: user._id.toString(),
      action: AuditAction.LOGIN_FAILED,
      ipAddress,
      userAgent,
      details: { email, reason: 'Account locked' }
    });
    return { error: 'ACCOUNT_LOCKED', lockUntil: user.lockUntil };
  }

  if (!(await user.matchPassword(password))) {
    await user.incrementLoginAttempts();
    await logAudit({
      userId: user._id.toString(),
      action: AuditAction.LOGIN_FAILED,
      ipAddress,
      userAgent,
      details: { email, reason: 'Invalid password' }
    });
    return null;
  }

  await user.resetLoginAttempts();

  await LoginAttempt.create({
    email,
    ipAddress,
    userAgent,
    success: true
  });

  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

  await Session.create({
    userId: user._id,
    refreshToken,
    userAgent,
    ipAddress,
    deviceInfo: getDeviceInfo(userAgent),
    expiresAt: getRefreshTokenExpiry()
  });

  await logAudit({
    userId: user._id.toString(),
    action: AuditAction.LOGIN_SUCCESS,
    ipAddress,
    userAgent,
    details: { email }
  });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    },
    accessToken,
    refreshToken
  };
};

export const refreshAccessToken = async (
  refreshToken: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const session = await Session.findOne({ refreshToken, isValid: true });

  if (!session) {
    return null;
  }

  const decoded = jwt.verify(refreshToken, config.jwt.secret) as JwtPayload;
  const user = await User.findById(decoded.userId);

  if (!user) {
    return null;
  }

  session.isValid = false;
  await session.save();

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(
    user._id.toString(),
    user.role
  );

  await Session.create({
    userId: user._id,
    refreshToken: newRefreshToken,
    userAgent,
    ipAddress,
    deviceInfo: getDeviceInfo(userAgent),
    expiresAt: getRefreshTokenExpiry()
  });

  await logAudit({
    userId: user._id.toString(),
    action: AuditAction.TOKEN_REFRESH,
    ipAddress,
    userAgent
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (userId: string, refreshToken?: string) => {
  if (refreshToken) {
    await Session.findOneAndUpdate(
      { refreshToken, userId },
      { isValid: false }
    );
  } else {
    await Session.updateMany(
      { userId, isValid: true },
      { isValid: false }
    );
  }

  await logAudit({
    userId,
    action: AuditAction.LOGOUT
  });
};

export const revokeSession = async (sessionId: string, userId: string) => {
  const session = await Session.findOneAndUpdate(
    { _id: sessionId, userId },
    { isValid: false },
    { new: true }
  );

  if (session) {
    await logAudit({
      userId,
      action: AuditAction.SESSION_REVOKE,
      details: { sessionId }
    });
  }

  return session;
};

export const getUserSessions = async (userId: string) => {
  return await Session.find({ userId, isValid: true })
    .sort({ createdAt: -1 })
    .select('-refreshToken');
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    return null;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordExpire = new Date(Date.now() + config.security.passwordResetExpiry);

  await user.save();

  return resetToken;
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return false;
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  await Session.updateMany({ userId: user._id, isValid: true }, { isValid: false });

  await logAudit({
    userId: user._id.toString(),
    action: AuditAction.PASSWORD_RESET,
    ipAddress,
    userAgent
  });

  return true;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const user = await User.findById(userId).select('+password');

  if (!user || !(await user.matchPassword(currentPassword))) {
    return false;
  }

  user.password = newPassword;
  await user.save();

  await Session.updateMany({ userId: user._id, isValid: true }, { isValid: false });

  await logAudit({
    userId: user._id.toString(),
    action: AuditAction.PASSWORD_CHANGE,
    ipAddress,
    userAgent
  });

  return true;
};

export const verifyEmail = async (
  token: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return null;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save();

  await logAudit({
    userId: user._id.toString(),
    action: AuditAction.EMAIL_VERIFY,
    ipAddress,
    userAgent
  });

  return user;
};

export const resendVerificationEmail = async (
  email: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const user = await User.findOne({ email });

  if (!user || user.isEmailVerified) {
    return null;
  }

  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  return verificationToken;
};
