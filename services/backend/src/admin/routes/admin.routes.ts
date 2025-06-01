import { Router, RequestHandler } from 'express';
import adminControllerInstance, { AdminController as AdminControllerClass } from '../controllers/admin.controller';
import { isAdmin } from '../middlewares/admin.auth.middleware'; 
import { authenticateAndAttachUser, setActiveOrganization } from '../../access-control';
import validate from '../../middlewares/validation.middleware';
import {
  // User schemas
  createUserSchemaWithBody,
  updateUserSchemaWithParams,
  getUserSchema,
  getUsersSchema,
  deleteUserSchema,
  toggleUserStatusSchema,
  bulkUsersSchema,
  
  // Student schemas
  createStudentSchemaWithBody,
  updateStudentSchemaWithParams,
  getStudentSchema,
  getStudentsSchema,
  deleteStudentSchema,
  bulkStudentsSchema,
  
  // Course schemas
  createCourseSchemaWithBody,
  updateCourseSchemaWithParams,
  getCourseSchema,
  getCoursesSchema,
  deleteCourseSchema,
  bulkCoursesSchema
} from '../validators/admin.validator';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Middlewares globales
router.use(authenticateAndAttachUser); 
router.use(setActiveOrganization);  
router.use(isAdmin);

// ===== RUTAS DE USUARIOS =====

// Crear usuario individual
router.post('/users', validate(createUserSchemaWithBody), adminControllerInstance.createUser);
router.post('/users/bulk', upload.single('file'), validate(bulkUsersSchema), adminControllerInstance.createUsersBulk);
router.get('/users', validate(getUsersSchema), adminControllerInstance.getUsers);
router.get('/users/:id', validate(getUserSchema), adminControllerInstance.getUser);
router.put('/users/:id', validate(updateUserSchemaWithParams), adminControllerInstance.updateUser);
router.delete('/users/:id', validate(deleteUserSchema), adminControllerInstance.deleteUser);
router.patch('/users/:id/status', validate(toggleUserStatusSchema), adminControllerInstance.toggleUserStatus);

// ===== RUTAS DE ESTUDIANTES =====
router.post('/students', validate(createStudentSchemaWithBody), adminControllerInstance.createStudent);
router.post('/students/bulk', upload.single('file'), validate(bulkStudentsSchema), adminControllerInstance.createStudentsBulk);
router.get('/students', validate(getStudentsSchema), adminControllerInstance.getStudents);
router.get('/students/:id', validate(getStudentSchema), adminControllerInstance.getStudent);
router.put('/students/:id', validate(updateStudentSchemaWithParams), adminControllerInstance.updateStudent);
router.delete('/students/:id', validate(deleteStudentSchema), adminControllerInstance.deleteStudent);

// ===== RUTAS DE CURSOS =====
router.post('/courses', validate(createCourseSchemaWithBody), adminControllerInstance.createCourse);
router.post('/courses/bulk', upload.single('file'), validate(bulkCoursesSchema), adminControllerInstance.createCoursesBulk);
router.get('/courses', validate(getCoursesSchema), adminControllerInstance.getCourses);
router.get('/courses/:id', validate(getCourseSchema), adminControllerInstance.getCourse);
router.put('/courses/:id', validate(updateCourseSchemaWithParams), adminControllerInstance.updateCourse);
router.delete('/courses/:id', validate(deleteCourseSchema), adminControllerInstance.deleteCourse);

export default router;