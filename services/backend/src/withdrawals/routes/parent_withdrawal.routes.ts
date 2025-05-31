import { Router } from 'express';
import ParentWithdrawalController from '../controllers/parent_withdrawal.controller';
import { isParent } from '../../auth/middlewares/auth.middleware';
import validate from '../../middlewares/validation.middleware';
import {
  generateQrSchema,
  getStudentHistorySchema,
  getHistorySchema
} from '../validators/parent_withdrawal.validators';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(isParent);

// Rutas
router.get('/students', ParentWithdrawalController.getMyStudents);
router.get('/reasons', ParentWithdrawalController.getWithdrawalReasons);
router.post('/generate-qr', validate(generateQrSchema), ParentWithdrawalController.generateQrCode);
router.get('/history', validate(getHistorySchema), ParentWithdrawalController.getMyWithdrawalHistory);
router.get('/students/:studentId/history', validate(getStudentHistorySchema), ParentWithdrawalController.getStudentHistory);

export default router;