import { Router } from 'express';
import InspectorWithdrawalController from '../controllers/inspector_withdrawal.controller';
import { isInspector } from '../../auth/middlewares/auth.middleware';
import validate from '../../middlewares/validation.middleware';
import {
  getQrInfoSchema,
  processQrSchema,
  manualAuthorizationSchema,
  manualWithdrawalSchema,
  getHistorySchema,
  searchStudentSchema,
  getStatsSchema 
} from '../validators/inspector_withdrawal.validators';

const router = Router();

router.use(isInspector);

router.get('/qr/:qrCode/info', validate(getQrInfoSchema), InspectorWithdrawalController.getQrInfo);
router.get('/student/:rut', validate(searchStudentSchema), InspectorWithdrawalController.searchStudentByRut);
router.get('/reasons', InspectorWithdrawalController.getWithdrawalReasons);
router.get('/stats', validate(getStatsSchema), InspectorWithdrawalController.getInspectorStats);
router.get('/history', validate(getHistorySchema), InspectorWithdrawalController.getWithdrawalHistory);
router.post('/qr/process', validate(processQrSchema), InspectorWithdrawalController.processQrDecision);
router.post('/authorize-manual', validate(manualAuthorizationSchema), InspectorWithdrawalController.authorizeManually);
router.post('/manual', validate(manualWithdrawalSchema), InspectorWithdrawalController.processManualWithdrawal);

export default router;