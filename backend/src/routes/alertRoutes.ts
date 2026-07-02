import express from 'express';
import {
  getActiveAlerts,
  createAlert,
  getAllAlerts,
  updateAlert,
  deleteAlert
} from '../controllers/alertController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

router.route('/active')
  .get(getActiveAlerts);

router.route('/')
  .post(protect, authorize(UserRole.ADMIN, UserRole.MODERATOR), createAlert)
  .get(protect, authorize(UserRole.ADMIN, UserRole.MODERATOR), getAllAlerts);

router.route('/:id')
  .put(protect, authorize(UserRole.ADMIN, UserRole.MODERATOR), updateAlert)
  .delete(protect, authorize(UserRole.ADMIN, UserRole.MODERATOR), deleteAlert);

export default router;
