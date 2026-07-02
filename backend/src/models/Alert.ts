import mongoose, { Schema, Document } from 'mongoose';
import { IAlert, AlertType } from '../types';

interface IAlertDocument extends IAlert, Document {}

const AlertSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(AlertType),
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
      }
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    active: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

AlertSchema.index({ location: '2dsphere' });

export default mongoose.model<IAlertDocument>('Alert', AlertSchema);
