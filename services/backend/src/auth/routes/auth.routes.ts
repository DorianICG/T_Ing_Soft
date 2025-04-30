import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { loginSchema } from '../validators/auth.validator';

// Import the schema validation middleware from its correct file
import validate from '../../middlewares/validation.middleware';

// Keep authenticate if needed for other routes, but it's not used for schema validation
// import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Use the validation middleware for the loginSchema (which validates req.body by default)
router.post('/login', validate(loginSchema), AuthController.login);

// Example of using authenticate on a protected route (AFTER login)
// import { authenticate } from '../middlewares/auth.middleware';
// router.get('/profile', authenticate(), UserProfileController.getProfile);
// router.get('/admin/dashboard', authenticate(['ADMIN']), AdminController.getDashboard);

export default router;