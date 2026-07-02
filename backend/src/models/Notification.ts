import mongoose, { Schema, Document } from 'mongoose';
import { INotification, NotificationType } from '../types';

interface INotificationDocument extends INotification, Document {}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    data: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<INotificationDocument>('Notification', NotificationSchema);
