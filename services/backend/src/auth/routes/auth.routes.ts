import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { loginSchema } from '../validators/auth.validator';
import validate from '../../middlewares/validation.middleware';


const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/verify-mfa', AuthController.verifyMfa);

router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);


export default router;