import { Router, RequestHandler } from 'express';
import adminControllerInstance, { AdminController as AdminControllerClass } from '../controllers/admin.controller';import { isAdmin } from '../middlewares/admin.auth.middleware'; 
import { authenticateAndAttachUser, setActiveOrganization } from '../../access-control';
import validate from '../../middlewares/validation.middleware';
import {
  createUserSchema,
  updateUserSchema,
  createStudentSchema,
  updateStudentSchema,
  listQuerySchema
} from '../validators/admin.validator';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
router.use(authenticateAndAttachUser); 
router.use(setActiveOrganization);  
router.use(isAdmin);    

// Métodos de instancia 
router.post('/users', validate(createUserSchema), adminControllerInstance.createUser);
router.post('/users/bulk', upload.single('file'), adminControllerInstance.createUsersBulk);

export default router;