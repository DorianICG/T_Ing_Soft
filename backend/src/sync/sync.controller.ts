import { Router } from 'express';
import { SyncService } from './sync.service';

const router = Router();

router.post('/pull', SyncService.pullChanges);
router.post('/push', SyncService.pushChanges);

export const SyncController = router;