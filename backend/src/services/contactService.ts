import EmergencyContact from '../models/EmergencyContact';
import { IEmergencyContact } from '../types';

export const getContacts = async (userId: string): Promise<IEmergencyContact[]> => {
  return EmergencyContact.find({ userId });
};

export const addContact = async (
  userId: string,
  contactData: Partial<IEmergencyContact>
): Promise<IEmergencyContact> => {
  return EmergencyContact.create({ ...contactData, userId });
};

export const updateContact = async (
  userId: string,
  contactId: string,
  updateData: Partial<IEmergencyContact>
): Promise<IEmergencyContact | null> => {
  return EmergencyContact.findOneAndUpdate(
    { _id: contactId, userId },
    updateData,
    { new: true, runValidators: true }
  );
};

export const deleteContact = async (
  userId: string,
  contactId: string
): Promise<void> => {
  await EmergencyContact.findOneAndDelete({ _id: contactId, userId });
};
