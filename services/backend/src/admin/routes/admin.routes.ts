import { Router } from 'express';
import adminControllerInstance, { AdminController as AdminControllerClass } from '../controllers/admin.controller';
import { isAdmin } from '../../auth/middlewares/auth.middleware';
import validate from '../../middlewares/validation.middleware';
import {
  createUserSchema,
  updateUserSchema,
  createStudentSchema,
  updateStudentSchema,
  listQuerySchema
} from '../validators/admin.validator';

const router = Router();


router.use(isAdmin);

// Métodos de instancia (ahora usan el adminControllerInstance importado)
router.post('/users', validate(createUserSchema), adminControllerInstance.createUser);
router.get('/users/:id', adminControllerInstance.getUserById);
router.put('/users/:id', validate(updateUserSchema), adminControllerInstance.updateUser);
router.patch('/users/:id/deactivate', adminControllerInstance.deactivateUser);
router.patch('/users/:id/activate', adminControllerInstance.activateUser);
router.delete('/users/:id', adminControllerInstance.deleteUser);

router.post('/students', validate(createStudentSchema), adminControllerInstance.createStudent);
router.get('/students/:id', adminControllerInstance.getStudentById);
router.put('/students/:id', validate(updateStudentSchema), adminControllerInstance.updateStudent);
router.delete('/students/:id', adminControllerInstance.deleteStudent);

// Métodos estáticos llamados desde la CLASE (AdminControllerClass)
router.get('/users', validate({ query: listQuerySchema }), AdminControllerClass.getAllUsers);
router.get('/students', validate({ query: listQuerySchema }), AdminControllerClass.getAllStudents);

export default router;