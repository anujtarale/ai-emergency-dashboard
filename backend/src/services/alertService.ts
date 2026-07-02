import Alert from '../models/Alert';
import { IAlert } from '../types';

interface CreateAlertData extends Partial<IAlert> {
  latitude?: number;
  longitude?: number;
}

export const createAlert = async (alertData: CreateAlertData): Promise<IAlert> => {
  const { latitude, longitude, ...rest } = alertData;
  if (latitude !== undefined && longitude !== undefined) {
    (rest as any).location = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
  }
  
  return Alert.create(rest);
};

export const getActiveAlerts = async (): Promise<IAlert[]> => {
  const now = new Date();
  return Alert.find({
    active: true,
    $or: [
      { expiresAt: { $gt: now } },
      { expiresAt: { $exists: false } },
      { expiresAt: null }
    ]
  }).sort({ createdAt: -1 }).lean();
};

export const getAllAlerts = async (): Promise<IAlert[]> => {
  return Alert.find().sort({ createdAt: -1 }).lean();
};

export const updateAlert = async (alertId: string, updateData: Partial<IAlert>): Promise<IAlert | null> => {
  return Alert.findByIdAndUpdate(alertId, updateData, {
    new: true,
    runValidators: true
  });
};

export const deleteAlert = async (alertId: string): Promise<void> => {
  await Alert.findByIdAndDelete(alertId);
};
