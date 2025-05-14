import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import validate from '../../middlewares/validation.middleware';
import { verifyForceChangeToken } from '../middlewares/auth.middleware';
import {
  loginSchema,
  verifyMfaSchema,
  forgotPasswordSchema,
  requestUnlockSchema,
  resetPasswordSchema,
  forceChangePasswordSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/verify-mfa', validate(verifyMfaSchema), AuthController.verifyMfa);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/request-unlock', validate(requestUnlockSchema), AuthController.requestUnlock);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);
router.post(
  '/force-change-password',
  verifyForceChangeToken, 
  validate(forceChangePasswordSchema),
  AuthController.forceChangePassword
);

export default router;