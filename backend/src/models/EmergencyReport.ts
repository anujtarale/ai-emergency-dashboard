import mongoose, { Schema, Document } from 'mongoose';
import { IEmergencyReport, ReportStatus } from '../types';

interface IEmergencyReportDocument extends IEmergencyReport, Document {}

const EmergencyReportSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      required: [true, 'Please add a type']
    },
    title: {
      type: String,
      required: [true, 'Please add a title']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
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
    images: [{
      type: String
    }],
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.SUBMITTED
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  {
    timestamps: true
  }
);

EmergencyReportSchema.index({ location: '2dsphere' });

export default mongoose.model<IEmergencyReportDocument>('EmergencyReport', EmergencyReportSchema);
