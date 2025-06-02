import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { isAuthenticated } from '../../auth/middlewares/auth.middleware';
import validate from '../../middlewares/validation.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validators';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(isAuthenticated);

// Rutas del perfil de usuario
router.get('/profile', UserController.getProfile);
router.put('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.put('/password', validate(changePasswordSchema), UserController.changePassword);

export default router;