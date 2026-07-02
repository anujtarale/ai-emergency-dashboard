import User from '../models/User';
import { IUser } from '../types';

export const getProfile = async (userId: string): Promise<any> => {
  return User.findById(userId).select('-password -refreshToken');
};

export const updateProfile = async (
  userId: string,
  updateData: Partial<IUser>
): Promise<any> => {
  return User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true
  }).select('-password -refreshToken');
};

export const deleteAccount = async (userId: string): Promise<void> => {
  await User.findByIdAndDelete(userId);
};

export const getAllUsers = async (): Promise<any[]> => {
  return User.find().select('-password -refreshToken');
};
