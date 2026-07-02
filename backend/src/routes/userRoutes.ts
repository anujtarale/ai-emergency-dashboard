import express from 'express';
import {
  getProfile,
  updateProfile,
  deleteAccount,
  getAllUsers
} from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';
import { updateProfileValidator } from '../validators/userValidator';
import { validateBody } from '../middleware/validator';
import { UserRole } from '../types';

const router = express.Router();

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, validateBody(updateProfileValidator), updateProfile)
  .delete(protect, deleteAccount);

router.route('/')
  .get(protect, authorize(UserRole.ADMIN), getAllUsers);

export default router;
