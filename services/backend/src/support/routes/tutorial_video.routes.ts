import { Router } from 'express';
import validateRequest from '../../middlewares/validation.middleware';
import { 
    authenticate,
    isAdmin,
    isAuthenticated 
} from '../../auth/middlewares/auth.middleware';

import {
    checkTutorial,
    markAsViewed,
    getAllTutorials,
    getTutorialById,
    getUserProgress,
    createTutorial,
    updateTutorial,
    toggleTutorialStatus,
    getTutorialStats,
    deleteTutorial
} from '../controllers/tutorial_video.controller';

import {
    markViewedSchema,
    getAllTutorialsSchema,
    getTutorialByIdSchema,
    createTutorialSchema,
    updateTutorialSchema,
    toggleTutorialStatusSchema,
    getTutorialStatsSchema,
    deleteTutorialSchema
} from '../validators/tutorial_video.validators';

const router = Router();

router.get('/admin/stats', isAdmin, validateRequest(getTutorialStatsSchema), getTutorialStats);
router.post('/admin/create', isAdmin, validateRequest(createTutorialSchema), createTutorial);
router.put('/admin/:id', isAdmin, validateRequest(updateTutorialSchema), updateTutorial);
router.patch('/admin/:id/toggle', isAdmin, validateRequest(toggleTutorialStatusSchema), toggleTutorialStatus);
router.delete('/admin/:id', isAdmin, validateRequest(deleteTutorialSchema), deleteTutorial);
router.post('/check', isAuthenticated, checkTutorial);
router.post('/mark-viewed', isAuthenticated, validateRequest(markViewedSchema), markAsViewed);
router.get('/my-progress', isAuthenticated, getUserProgress);
router.get('/', isAuthenticated, validateRequest(getAllTutorialsSchema), getAllTutorials);
router.get('/:id', isAuthenticated, validateRequest(getTutorialByIdSchema), getTutorialById);

export default router;