import mongoose, { Schema, Document } from 'mongoose';
import { ISession } from '../types';

interface ISessionDocument extends ISession, Document {}

const SessionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true
    },
    userAgent: {
      type: String
    },
    ipAddress: {
      type: String
    },
    deviceInfo: {
      type: Map,
      of: Schema.Types.Mixed
    },
    isValid: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

SessionSchema.index({ userId: 1, isValid: 1 });
SessionSchema.index({ refreshToken: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ISessionDocument>('Session', SessionSchema);
