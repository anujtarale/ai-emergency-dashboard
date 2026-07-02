import express from 'express';
import {
  createReport,
  getReportById,
  getUserReports,
  updateReport,
  deleteReport,
  getAllReports,
  getNearbyReports
} from '../controllers/reportController';
import { protect, authorize } from '../middleware/auth';
import { createReportValidator } from '../validators/reportValidator';
import { handleValidationErrors } from '../middleware/validator';
import { UserRole } from '../types';

const router = express.Router();

router.route('/')
  .post(protect, createReportValidator, handleValidationErrors, createReport)
  .get(protect, getUserReports);

router.route('/nearby')
  .get(protect, getNearbyReports);

router.route('/all')
  .get(protect, authorize(UserRole.ADMIN, UserRole.MODERATOR), getAllReports);

router.route('/:id')
  .get(protect, getReportById)
  .put(protect, updateReport)
  .delete(protect, deleteReport);

export default router;
