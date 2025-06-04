import { Request, Response } from 'express';
import { SupportTicketService } from '../services/support_ticket.service';

/**
 * CREAR TICKET DE SOPORTE
 * POST /api/support/ticket
 */
export const createSupportTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rut, description, attachment } = req.body;

    const validatedData = SupportTicketService.validateCreateTicketData({
      rut,
      description,
      attachment
    });

    const result = await SupportTicketService.createTicket(validatedData);

    if (!result.ticket) {
      throw new Error('Error interno al crear el ticket');
    }

    SupportTicketService.sendConfirmationEmail(result.ticket, result.tracking_number, description, rut)
      .catch(error => console.warn('Error enviando email:', error));

    res.status(201).json({
      success: true,
      data: {
        ticket: {
          id: result.ticket.id_ticket,
          tracking_number: result.tracking_number,
          rut: result.ticket.user?.rut,
          description: result.ticket.description,
          status: result.ticket.status,
          created_at: result.ticket.created_at
        },
      },
      message: `Ticket creado exitosamente. IMPORTANTE: Guarda este número de seguimiento: ${result.tracking_number}`
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
 * RASTREAR TICKET POR TRACKING NUMBER
 * GET /api/support/ticket/track/:trackingNumber
 */
export const getTicketByTrackingNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trackingNumber } = req.params;

    const ticket = await SupportTicketService.getTicketByTrackingNumber(trackingNumber);

    res.status(200).json({
      success: true,
      data: { 
        ticket: {
          tracking_number: ticket.tracking_number,
          rut: ticket.user?.rut,
          description: ticket.description,
          status: ticket.status,
          admin_response: ticket.admin_response,
          created_at: ticket.created_at,
          responded_at: ticket.responded_at
        }
      },
      message: 'Ticket encontrado'
    });

  } catch (error: unknown) {
    console.error('Error buscando ticket:', error);
    
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
 * OBTENER TICKETS DEL USUARIO POR RUT
 * GET /api/support/ticket/rut/:rut
 */
export const getTicketsByRut = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rut } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    const rutClean = rut.replace(/[.-]/g, '').trim();
    if (!/^\d{7,8}[0-9kK]$/.test(rutClean)) {
      res.status(400).json({
        success: false,
        message: 'RUT inválido'
      });
      return;
    }

    const filters = {
      status: status as any
    };

    const pagination = {
      limit: Number(limit),
      offset: Number(offset)
    };

    const result = await SupportTicketService.getTicketsByRut(rut, filters, pagination);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Tickets obtenidos exitosamente'
    });

  } catch (error: unknown) {
    console.error('Error obteniendo tickets por RUT:', error);
    
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
 * GET /api/support/ticket
 */
export const getAllTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, limit = 50, offset = 0, search, rut } = req.query;

    const filters = {
      status: status as any,
      search: search as string,
      rut: rut as string
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
 * OBTENER TICKET POR ID (ADMIN)
 * GET /api/support/ticket/:id
 */
export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicketService.getTicketById(Number(id));

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
 * RESPONDER TICKET (ADMIN)
 * PUT /api/support/ticket/:id/respond
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

    const validatedData = SupportTicketService.validateRespondData({
      adminResponse: admin_response,
      adminUserId
    });

    const ticket = await SupportTicketService.respondToTicket(Number(id), validatedData);

    SupportTicketService.sendResponseEmail(ticket, validatedData.adminResponse)
      .catch(error => console.warn('Error enviando email:', error));

    res.status(200).json({
      success: true,
      data: { ticket },
      message: 'Respuesta enviada exitosamente'
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
 * PATCH /api/support/ticket/:id/status
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
 * GET /api/support/ticket/stats
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