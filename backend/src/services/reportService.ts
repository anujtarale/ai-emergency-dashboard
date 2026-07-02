import EmergencyReport from '../models/EmergencyReport';
import { IEmergencyReport, ReportStatus } from '../types';

export const createReport = async (
  userId: string,
  reportData: any
): Promise<IEmergencyReport> => {
  const { type, title, description, latitude, longitude, address, severity, images = [] } = reportData;
  
  return EmergencyReport.create({
    userId,
    type,
    title,
    description,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    address,
    severity,
    images,
    status: ReportStatus.SUBMITTED
  });
};

export const getReportById = async (reportId: string): Promise<IEmergencyReport | null> => {
  return EmergencyReport.findById(reportId).populate('userId', 'name email');
};

export const getUserReports = async (userId: string): Promise<IEmergencyReport[]> => {
  return EmergencyReport.find({ userId }).sort({ createdAt: -1 });
};

export const updateReport = async (
  userId: string,
  reportId: string,
  updateData: Partial<IEmergencyReport>
): Promise<IEmergencyReport | null> => {
  return EmergencyReport.findOneAndUpdate(
    { _id: reportId, userId },
    updateData,
    { new: true, runValidators: true }
  );
};

export const adminUpdateReport = async (
  reportId: string,
  updateData: Partial<IEmergencyReport>
): Promise<IEmergencyReport | null> => {
  return EmergencyReport.findByIdAndUpdate(
    reportId,
    updateData,
    { new: true, runValidators: true }
  ).populate('userId', 'name email');
};

export const deleteReport = async (
  userId: string,
  reportId: string
): Promise<void> => {
  await EmergencyReport.findOneAndDelete({ _id: reportId, userId });
};

export const getAllReports = async (): Promise<IEmergencyReport[]> => {
  return EmergencyReport.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
};

export const getNearbyReports = async (
  latitude: number,
  longitude: number,
  maxDistance: number = 10000
): Promise<IEmergencyReport[]> => {
  return EmergencyReport.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  }).populate('userId', 'name email').sort({ createdAt: -1 });
};
