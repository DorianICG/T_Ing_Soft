import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { loginSchema } from '../validators/auth.validator';

import validate from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);

export default router;