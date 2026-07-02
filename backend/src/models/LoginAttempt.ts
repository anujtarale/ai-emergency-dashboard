import mongoose, { Schema, Document } from 'mongoose';
import { ILoginAttempt } from '../types';

interface ILoginAttemptDocument extends ILoginAttempt, Document {}

const LoginAttemptSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true
    },
    ipAddress: {
      type: String,
      index: true
    },
    userAgent: {
      type: String
    },
    success: {
      type: Boolean,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

LoginAttemptSchema.index({ email: 1, createdAt: -1 });
LoginAttemptSchema.index({ ipAddress: 1, createdAt: -1 });

export default mongoose.model<ILoginAttemptDocument>('LoginAttempt', LoginAttemptSchema);
