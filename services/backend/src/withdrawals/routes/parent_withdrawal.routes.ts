import { Router } from 'express';
import ParentWithdrawalController from '../controllers/parent_withdrawal.controller';
import { isParent } from '../../auth/middlewares/auth.middleware';
import validate from '../../middlewares/validation.middleware';
import {
  generateQrSchema,
  getHistorySchema,
  getActiveQrsSchema,
  resendQrSchema,
  getStudentHistorySchema,
  getStatsSchema,
  cancelQrSchema 
} from '../validators/parent_withdrawal.validators';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(isParent);


router.get('/students', ParentWithdrawalController.getMyStudents);
router.get('/reasons', ParentWithdrawalController.getWithdrawalReasons);
router.get('/stats', validate(getStatsSchema), ParentWithdrawalController.getMyStats);
router.get('/active-qrs', validate(getActiveQrsSchema), ParentWithdrawalController.getMyActiveQrs);
router.get('/history', validate(getHistorySchema), ParentWithdrawalController.getMyWithdrawalHistory);
router.get('/students/:studentId/history', validate(getStudentHistorySchema), ParentWithdrawalController.getStudentHistory);
router.post('/generate-qr', validate(generateQrSchema), ParentWithdrawalController.generateQrCode);
router.post('/students/:studentId/resend-qr', validate(resendQrSchema), ParentWithdrawalController.resendActiveQr);
router.delete('/qr/:identifier/cancel', validate(cancelQrSchema), ParentWithdrawalController.cancelActiveQr);

export default router;