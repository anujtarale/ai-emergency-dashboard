import express from 'express';
import Feature from '../models/Feature';
import { protect } from '../middleware/auth';

const router = express.Router();

// Allow any authenticated user to retrieve active features
router.get('/', protect, async (req, res, next) => {
  try {
    const features = await Feature.find({}).select('name displayName isEnabled');
    res.status(200).json({
      success: true,
      data: features
    });
  } catch (error) {
    next(error);
  }
});

export default router;
