import mongoose, { Schema, Document } from 'mongoose';
import { IActivityLog } from '../types';

interface IActivityLogDocument extends IActivityLog, Document {}

const ActivityLogSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {
      type: String
    },
    actionType: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning', 'info'],
      default: 'success'
    },
    ipAddress: {
      type: String
    },
    deviceBrowser: {
      type: String
    },
    routePage: {
      type: String
    },
    details: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ actionType: 1, createdAt: -1 });
ActivityLogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IActivityLogDocument>('ActivityLog', ActivityLogSchema);
