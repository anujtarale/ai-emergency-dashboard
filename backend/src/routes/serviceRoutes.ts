import express from 'express';
import {
  getNearbyServices,
  getAllServices,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

/**
 * @swagger
 * /services/nearby:
 *   get:
 *     summary: Get nearby emergency services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         required: true
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [hospital, police, fire, pharmacy, shelter, all]
 *     responses:
 *       200:
 *         description: List of nearby services
 */
router.get('/nearby', getNearbyServices);

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all emergency services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [hospital, police, fire, pharmacy, shelter, all]
 *     responses:
 *       200:
 *         description: List of all services
 */
router.get('/', getAllServices);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new emergency service (admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Service created
 */
router.post('/', protect, authorize(UserRole.ADMIN), createService);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update an emergency service (admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Service updated
 */
router.put('/:id', protect, authorize(UserRole.ADMIN), updateService);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete an emergency service (admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Service deleted
 */
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteService);

export default router;
