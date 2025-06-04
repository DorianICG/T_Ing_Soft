import { Router } from 'express';
import supportTicketRoutes from './support_ticket.routes';
import tutorialVideoRoutes from './tutorial_video.routes';

const router = Router();

router.use('/ticket', supportTicketRoutes);
router.use('/tutorial', tutorialVideoRoutes);

export default router;