import express from 'express';
import {
  createSOS,
  getSOSById,
  getUserSOS,
  resolveSOS,
  getAllActiveSOS,
  adminGetAllSOS,
  getNearbySOS
} from '../controllers/sosController';
import { protect, authorize } from '../middleware/auth';
import { createSOSValidator } from '../validators/sosValidator';
import { handleValidationErrors } from '../middleware/validator';
import { UserRole } from '../types';

const router = express.Router();

router.route('/')
  .post(
    protect,
    createSOSValidator,
    handleValidationErrors,
    createSOS
  )
  .get(protect, getUserSOS);

router.route('/nearby')
  .get(protect, getNearbySOS);

router.route('/active')
  .get(protect, authorize(UserRole.ADMIN, UserRole.MODERATOR), getAllActiveSOS);

router.route('/admin/all')
  .get(protect, authorize(UserRole.ADMIN, UserRole.MODERATOR), adminGetAllSOS);

router.route('/:id')
  .get(protect, getSOSById)
  .put(protect, resolveSOS);

export default router;
