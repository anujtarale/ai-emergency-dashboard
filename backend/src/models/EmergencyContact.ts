import mongoose, { Schema, Document } from 'mongoose';
import { IEmergencyContact } from '../types';

interface IEmergencyContactDocument extends IEmergencyContact, Document {}

const EmergencyContactSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please add a name']
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number']
    },
    relation: {
      type: String
    },
    email: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IEmergencyContactDocument>('EmergencyContact', EmergencyContactSchema);
