import { Router } from 'express';
import validateRequest from '../../middlewares/validation.middleware';
import { isAdmin } from '../../auth/middlewares/auth.middleware';

import {
    createSupportTicket,
    getTicketByTrackingNumber,
    getTicketsByRut,
    getAllTickets,
    getTicketById,
    updateAdminResponse,
    updateTicketStatus,
    getTicketStats
} from '../controllers/support_ticket.controller';

import {
    createTicketSchema,
    getTicketByTrackingSchema,
    getTicketsByRutSchema,
    getAllTicketsSchema,
    getTicketByIdSchema,
    respondTicketSchema,
    updateTicketStatusSchema,
    getTicketStatsSchema
} from '../validators/support_ticket.validators';

const router = Router();

// RUTAS PÚBLICAS
router.post('/', validateRequest(createTicketSchema), createSupportTicket);
router.get('/track/:trackingNumber', validateRequest(getTicketByTrackingSchema), getTicketByTrackingNumber);
router.get('/rut/:rut', validateRequest(getTicketsByRutSchema), getTicketsByRut);

// RUTAS ADMIN
router.get('/stats', isAdmin, validateRequest(getTicketStatsSchema), getTicketStats);
router.get('/', isAdmin, validateRequest(getAllTicketsSchema), getAllTickets);
router.get('/:id', isAdmin, validateRequest(getTicketByIdSchema), getTicketById);
router.put('/:id/respond', isAdmin, validateRequest(respondTicketSchema), updateAdminResponse);
router.patch('/:id/status', isAdmin, validateRequest(updateTicketStatusSchema), updateTicketStatus);

export default router;