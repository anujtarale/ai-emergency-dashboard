import SOSRequest from '../models/SOSRequest';
import { ISOSRequest, SOSStatus } from '../types';
import crypto from 'crypto';
import logger from '../utils/logger';

export const createSOS = async (
  userId: string,
  sosData: any
): Promise<ISOSRequest> => {
  const {
    latitude,
    longitude,
    address,
    emergencyType,
    description,
    priority = 'high',
    notes
  } = sosData;
  
  const sosId = `SOS-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  
  logger.debug('[SOS] Service: creating SOS document', { sosId, userId, emergencyType, priority });
  
  const saved = await SOSRequest.create({
    sosId,
    userId,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    address,
    emergencyType,
    description,
    priority,
    notes,
    status: SOSStatus.PENDING
  });
  
  logger.info(`[SOS] MongoDB save completed: ${saved.sosId}`, {
    sosId: saved.sosId,
    status: saved.status,
    emergencyType: saved.emergencyType
  });
  
  return saved;
};

export const getSOSById = async (sosId: string): Promise<ISOSRequest | null> => {
  return SOSRequest.findById(sosId).populate('userId', 'name email phone');
};

export const getUserSOS = async (userId: string): Promise<ISOSRequest[]> => {
  return SOSRequest.find({ userId }).sort({ createdAt: -1 });
};

export const resolveSOS = async (
  sosId: string,
  userId: string
): Promise<ISOSRequest | null> => {
  return SOSRequest.findOneAndUpdate(
    { _id: sosId, userId },
    { status: SOSStatus.RESOLVED, resolvedAt: new Date() },
    { new: true }
  );
};

export const getAllActiveSOS = async (): Promise<ISOSRequest[]> => {
  return SOSRequest.find({ status: { $in: [SOSStatus.PENDING, SOSStatus.ACKNOWLEDGED, SOSStatus.IN_PROGRESS] } }).populate('userId', 'name email phone');
};

export const adminGetAllSOS = async (): Promise<ISOSRequest[]> => {
  return SOSRequest.find({})
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });
};

export const adminUpdateSOS = async (
  sosId: string,
  updateData: { status?: string; responderId?: string; acknowledgedAt?: Date; resolvedAt?: Date }
): Promise<ISOSRequest | null> => {
  if (updateData.status === SOSStatus.ACKNOWLEDGED) {
    updateData.acknowledgedAt = new Date();
  }
  if (updateData.status === SOSStatus.RESOLVED) {
    updateData.resolvedAt = new Date();
  }
  
  return SOSRequest.findByIdAndUpdate(
    sosId,
    updateData,
    { new: true }
  ).populate('userId', 'name email phone');
};

export const getNearbySOS = async (
  latitude: number,
  longitude: number,
  maxDistance: number = 10000
): Promise<ISOSRequest[]> => {
  return SOSRequest.find({
    status: { $in: [SOSStatus.ACKNOWLEDGED, SOSStatus.IN_PROGRESS] },
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  }).populate('userId', 'name email phone');
};
