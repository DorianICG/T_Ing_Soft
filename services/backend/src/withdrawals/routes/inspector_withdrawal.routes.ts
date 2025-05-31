import { Router } from 'express';
import InspectorWithdrawalController from '../controllers/inspector_withdrawal.controller';
import { isInspector } from '../../auth/middlewares/auth.middleware';
import validate from '../../middlewares/validation.middleware';
import {
  getQrInfoSchema,
  processQrSchema,
  manualWithdrawalSchema,
  getHistorySchema,
  searchStudentSchema
} from '../validators/inspector_withdrawal.validators';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(isInspector);

// Rutas
router.get('/qr/:qrCode/info', validate(getQrInfoSchema), InspectorWithdrawalController.getQrInfo);
router.post('/qr/process', validate(processQrSchema), InspectorWithdrawalController.processQrDecision);
router.post('/manual', validate(manualWithdrawalSchema), InspectorWithdrawalController.processManualWithdrawal);
router.get('/reasons', InspectorWithdrawalController.getWithdrawalReasons);
router.get('/student/:rut', validate(searchStudentSchema), InspectorWithdrawalController.searchStudentByRut);
router.get('/history', validate(getHistorySchema), InspectorWithdrawalController.getWithdrawalHistory);

export default router;