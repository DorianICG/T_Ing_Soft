import { Router } from 'express';
import validateRequest from '../../middlewares/validation.middleware';
import { 
    authenticate,
    isAdmin,
    isAuthenticated 
} from '../../auth/middlewares/auth.middleware';

import {
    createSupportTicket,
    updateAdminResponse,
    getTicketById,
    getUserTickets,
    getAllTickets,
    getTicketByTrackingNumber,
    updateTicketStatus,
    getTicketStats
} from '../controllers/support_ticket.controller';

import {
    createTicketSchema,
    respondTicketSchema,
    getTicketByIdSchema,
    getTicketByTrackingSchema,
    getUserTicketsSchema,
    getAllTicketsSchema,
    updateTicketStatusSchema,
    getTicketStatsSchema
} from '../validators/support_ticket.validators';

const router = Router();

router.get('/stats', isAdmin, validateRequest(getTicketStatsSchema), getTicketStats);
router.get('/my-tickets', isAuthenticated, validateRequest(getUserTicketsSchema), getUserTickets);
router.get('/track/:trackingNumber', isAuthenticated, validateRequest(getTicketByTrackingSchema), getTicketByTrackingNumber);
router.post('/', isAuthenticated, validateRequest(createTicketSchema), createSupportTicket);
router.get('/', isAdmin, validateRequest(getAllTicketsSchema), getAllTickets);
router.get('/:id', isAuthenticated, validateRequest(getTicketByIdSchema), getTicketById);
router.put('/:id/respond', isAdmin, validateRequest(respondTicketSchema), updateAdminResponse);
router.patch('/:id/status', isAdmin, validateRequest(updateTicketStatusSchema), updateTicketStatus);

export default router;