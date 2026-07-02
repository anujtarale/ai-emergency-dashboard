import express from 'express';
import {
  getStats,
  getUsers,
  updateUserRole,
  getFeatures,
  toggleFeature,
  getSettings,
  updateSettings,
  getActivityLogs
} from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

// All routes here are admin only
router.use(protect, authorize(UserRole.ADMIN));

router.route('/stats')
  .get(getStats);

router.route('/users')
  .get(getUsers);

router.route('/users/role')
  .put(updateUserRole);

router.route('/features')
  .get(getFeatures);

router.route('/features/:name')
  .put(toggleFeature);

router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

router.route('/activity-logs')
  .get(getActivityLogs);

export default router;
