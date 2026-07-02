import mongoose, { Schema, Document } from 'mongoose';

export interface IFeature {
  name: string;
  displayName: string;
  isEnabled: boolean;
}

export interface IFeatureDocument extends IFeature, Document {
  createdAt: Date;
  updatedAt: Date;
}

const FeatureSchema = new Schema<IFeatureDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    isEnabled: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IFeatureDocument>('Feature', FeatureSchema);
