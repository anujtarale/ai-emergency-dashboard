import express from 'express';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { authLimiter } from '../middleware/rateLimiter';
import * as authController from '../controllers/authController';
import * as authValidator from '../validators/authValidator';

const router = express.Router();

router.post('/register', authLimiter, validateBody(authValidator.registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(authValidator.loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, validateBody(authValidator.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateBody(authValidator.resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', validateBody(authValidator.verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', authLimiter, validateBody(authValidator.resendVerificationSchema), authController.resendVerificationEmail);

router.use(protect);

router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAllDevices);
router.post('/change-password', validateBody(authValidator.changePasswordSchema), authController.changePassword);
router.get('/me', authController.getMe);
router.get('/sessions', authController.getSessions);
router.delete('/sessions/:sessionId', authController.revokeSessionHandler);

export default router;
