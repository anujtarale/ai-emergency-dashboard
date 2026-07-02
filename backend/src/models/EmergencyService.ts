import mongoose, { Schema } from 'mongoose';

const EmergencyServiceSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['hospital', 'police', 'fire', 'pharmacy', 'shelter'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  { timestamps: true }
);

EmergencyServiceSchema.index({ location: '2dsphere' });

export default mongoose.model('EmergencyService', EmergencyServiceSchema);
