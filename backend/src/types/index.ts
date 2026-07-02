export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  TRAVELER = 'traveler'
}

export enum SOSStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled'
}

export enum ReportStatus {
  SUBMITTED = 'submitted',
  REVIEWING = 'reviewing',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

export enum AlertType {
  WEATHER = 'weather',
  FLOOD = 'flood',
  FIRE = 'fire',
  TRAFFIC = 'traffic',
  OTHER = 'other'
}

export enum NotificationType {
  SOS = 'sos',
  REPORT = 'report',
  ALERT = 'alert',
  SYSTEM = 'system'
}

export enum AuditAction {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFY = 'email_verify',
  ACCOUNT_LOCK = 'account_lock',
  ACCOUNT_UNLOCK = 'account_unlock',
  SESSION_CREATE = 'session_create',
  SESSION_REVOKE = 'session_revoke',
  TOKEN_REFRESH = 'token_refresh',
  PROFILE_UPDATE = 'profile_update',
  ROLE_CHANGE = 'role_change',
  SOS_CLICKED = 'sos_clicked',
  SOS_CONFIRMED = 'sos_confirmed',
  SOS_CANCELLED = 'sos_cancelled',
  SOS_RESOLVED = 'sos_resolved',
  SOS_UPDATED = 'sos_updated',
  AI_ASSISTANT_USED = 'ai_assistant_used',
  EMERGENCY_TIPS_VIEWED = 'emergency_tips_viewed',
  SETTINGS_CHANGED = 'settings_changed',
  LOCATION_UPDATED = 'location_updated',
  EMERGENCY_REPORT_CREATED = 'emergency_report_created',
  EMERGENCY_REPORT_UPDATED = 'emergency_report_updated',
  ADMIN_ACTION = 'admin_action'
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  address?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEmergencyContact {
  userId: string;
  name: string;
  phone: string;
  relation?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISOSRequest {
  sosId?: string;
  userId: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address?: string;
  status: SOSStatus;
  emergencyType: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  responderId?: string;
  responseTimeMs?: number;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IActivityLog {
  userId?: string;
  username?: string;
  actionType: string;
  description: string;
  status: 'success' | 'failure' | 'warning' | 'info';
  ipAddress?: string;
  deviceBrowser?: string;
  routePage?: string;
  details?: any;
  createdAt?: Date;
}

export interface IEmergencyReport {
  userId: string;
  type: string;
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address?: string;
  images?: string[];
  status: ReportStatus;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAlert {
  _id?: any;
  type: AlertType;
  title: string;
  description: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotification {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt?: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface ISession {
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  deviceInfo?: Record<string, any>;
  isValid: boolean;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuditLog {
  userId?: string;
  action: AuditAction;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt?: Date;
}

export interface ILoginAttempt {
  email: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  createdAt?: Date;
}
