import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSetting {
  maintenanceMode: boolean;
  enableNotifications: boolean;
  systemLogLevel: 'debug' | 'info' | 'warn' | 'error';
  backupInterval: 'daily' | 'weekly' | 'monthly' | 'none';
}

export interface ISystemSettingDocument extends ISystemSetting, Document {
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSettingDocument>(
  {
    maintenanceMode: {
      type: Boolean,
      required: true,
      default: false
    },
    enableNotifications: {
      type: Boolean,
      required: true,
      default: true
    },
    systemLogLevel: {
      type: String,
      enum: ['debug', 'info', 'warn', 'error'],
      default: 'info'
    },
    backupInterval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'none'],
      default: 'weekly'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ISystemSettingDocument>('SystemSetting', SystemSettingSchema);
