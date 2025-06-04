import { Request, Response } from 'express';
import { SupportTicketService } from '../services/support_ticket.service';

// AGREGAR INTERFACE
interface AuthenticatedRequestBody extends Request {
    user?: {
        id: number;
        effectiveRole?: string;
        [key: string]: any;
    };
}

/**
 * CREAR TICKET DE SOPORTE
 * POST /api/support/tickets
 */
export const createSupportTicket = async (req: Request, res: Response): Promise<void> => {
    try {
        const { description, attachment } = req.body;
        const user_id = (req as any).user?.id; 

        if (!user_id) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }

        // VALIDAR Y CREAR TICKET
        const validatedData = SupportTicketService.validateCreateTicketData({
            userId: user_id,
            description,
            attachment
        });

        const result = await SupportTicketService.createTicket(validatedData);

        // ENVIAR EMAIL 
        SupportTicketService.sendConfirmationEmail(result.ticket, result.tracking_number, description)
            .catch(error => console.warn('Error enviando email:', error));

        res.status(201).json({
            success: true,
            data: result,
            message: 'Ticket creado exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error creando ticket:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        res.status(400).json({ 
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * OBTENER TICKET POR ID
 * GET /api/support/tickets/:id
 */
export const getTicketById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.effectiveRole;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }

        const ticket = await SupportTicketService.getTicketById(Number(id));

        // VERIFICAR PERMISOS
        const isAdmin = userRole === 'ADMIN';
        const canAccess = isAdmin || ticket.user_id === userId;

        if (!canAccess) {
            res.status(403).json({ 
                success: false,
                message: 'No tienes permisos para ver este ticket' 
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { ticket },
            message: 'Ticket obtenido exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error obteniendo ticket:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrado') ? 404 : 500;
        
        res.status(statusCode).json({ 
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * OBTENER TICKETS DEL USUARIO
 * GET /api/support/tickets/my-tickets
 */
export const getUserTickets = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { status, limit = 20, offset = 0 } = req.query;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }

        const filters = {
            userId: userId,
            status: status as any
        };

        const pagination = {
            limit: Number(limit),
            offset: Number(offset)
        };

        const result = await SupportTicketService.getTickets(filters, pagination);

        res.status(200).json({
            success: true,
            data: result,
            message: 'Tickets obtenidos exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error obteniendo tickets del usuario:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * OBTENER TODOS LOS TICKETS (ADMIN)
 * GET /api/support/tickets
 */
export const getAllTickets = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, limit = 50, offset = 0, search } = req.query;

        const filters = {
            status: status as any,
            search: search as string
        };

        const pagination = {
            limit: Number(limit),
            offset: Number(offset)
        };

        const result = await SupportTicketService.getTickets(filters, pagination);

        res.status(200).json({
            success: true,
            data: result,
            message: 'Tickets obtenidos exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error obteniendo todos los tickets:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * BUSCAR TICKET POR TRACKING NUMBER
 * GET /api/support/tickets/track/:trackingNumber
 */
export const getTicketByTrackingNumber = async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackingNumber } = req.params;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.effectiveRole;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }

        const ticket = await SupportTicketService.getTicketByTrackingNumber(trackingNumber);

        // VERIFICAR PERMISOS
        const isAdmin = userRole === 'ADMIN';
        const canAccess = isAdmin || ticket.user_id === userId;

        if (!canAccess) {
            res.status(403).json({ 
                success: false,
                message: 'No tienes permisos para ver este ticket' 
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { ticket },
            message: 'Ticket encontrado'
        });

    } catch (error: unknown) {
        console.error('Error buscando ticket por tracking number:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrado') ? 404 : 500;
        
        res.status(statusCode).json({ 
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * RESPONDER TICKET (ADMIN)
 * PUT /api/support/tickets/:id/respond
 */
export const updateAdminResponse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { admin_response } = req.body;
        const adminUserId = (req as any).user?.id;

        if (!adminUserId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }

        // VALIDAR DATOS
        const validatedData = SupportTicketService.validateRespondData({
            adminResponse: admin_response,
            adminUserId
        });

        // RESPONDER TICKET
        const ticket = await SupportTicketService.respondToTicket(Number(id), validatedData);

        // ENVIAR EMAIL
        SupportTicketService.sendResponseEmail(ticket, validatedData.adminResponse)
            .catch(error => console.warn('Error enviando email:', error));

        res.status(200).json({
            success: true,
            data: { ticket },
            message: 'Respuesta enviada y ticket cerrado exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error respondiendo ticket:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrado') ? 404 : 
                          errorMessage.includes('cerrado') ? 400 : 500;
        
        res.status(statusCode).json({ 
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * ACTUALIZAR ESTADO DE TICKET (ADMIN)
 * PATCH /api/support/tickets/:id/status
 */
export const updateTicketStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await SupportTicketService.updateTicketStatus(Number(id), { status });

        res.status(200).json({
            success: true,
            data: { ticket },
            message: `Estado actualizado a ${status} exitosamente`
        });

    } catch (error: unknown) {
        console.error('Error actualizando estado del ticket:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrado') ? 404 : 500;
        
        res.status(statusCode).json({ 
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * ESTADÍSTICAS DE TICKETS (ADMIN)
 * GET /api/support/tickets/stats
 */
export const getTicketStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { period = 'MONTH' } = req.query;

        const stats = await SupportTicketService.getTicketStats(period as any);

        res.status(200).json({
            success: true,
            data: stats,
            message: 'Estadísticas obtenidas exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error obteniendo estadísticas:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};