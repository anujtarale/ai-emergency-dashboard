import { z } from 'zod';
import { UserRole } from '../types';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const updateProfileValidator = updateProfileSchema;

export const updateRoleSchema = z.object({
  role: z.nativeEnum(UserRole)
});
