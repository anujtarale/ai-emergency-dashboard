import mongoose, { Schema, Document } from 'mongoose';
import { IAuditLog, AuditAction } from '../types';

interface IAuditLogDocument extends IAuditLog, Document {}

const AuditLogSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    details: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
