import mongoose, { Schema, Document } from 'mongoose';
import { ISOSRequest, SOSStatus } from '../types';

interface ISOSRequestDocument extends ISOSRequest, Document {}

const SOSRequestSchema: Schema = new Schema(
  {
    sosId: {
      type: String,
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    address: {
      type: String
    },
    status: {
      type: String,
      enum: Object.values(SOSStatus),
      default: SOSStatus.PENDING
    },
    emergencyType: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'high'
    },
    notes: {
      type: String
    },
    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    responseTimeMs: {
      type: Number
    },
    acknowledgedAt: {
      type: Date
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

SOSRequestSchema.index({ location: '2dsphere' });
SOSRequestSchema.index({ sosId: 1 });
SOSRequestSchema.index({ status: 1 });
SOSRequestSchema.index({ priority: 1 });

export default mongoose.model<ISOSRequestDocument>('SOSRequest', SOSRequestSchema);
