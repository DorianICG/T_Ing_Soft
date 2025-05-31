import { Router } from 'express';
import parentWithdrawalRoutes from './parent_withdrawal.routes';
import inspectorWithdrawalRoutes from './inspector_withdrawal.routes';

const router = Router();

router.use('/parent', parentWithdrawalRoutes);
router.use('/inspector', inspectorWithdrawalRoutes);

export default router;