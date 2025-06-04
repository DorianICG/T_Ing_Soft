import SupportTicket from '../../models/SupportTicket';
import User from '../../models/User';
import generateTrackingNumber from '../../utils/generateTrackingNumber';
import { sendEmail } from '../../utils/emailService';
import { Op } from 'sequelize';

export interface CreateTicketData {
  rut: string;
  description: string;
  attachment?: string | null;
}

export interface UpdateTicketStatusData {
  status: 'open' | 'in progress' | 'closed';
}

export interface RespondTicketData {
  adminResponse: string;
  adminUserId: number;
}

export interface GetTicketsFilters {
  status?: 'open' | 'in progress' | 'closed';
  search?: string;
  rut?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export class SupportTicketService {

  static async createTicket(data: CreateTicketData) {
    const trackingNumber = generateTrackingNumber();

    const user = await User.findOne({
      where: { rut: data.rut },
      attributes: ['id', 'firstName', 'lastName', 'email', 'rut']
    });

    if (!user) {
      throw new Error(`El RUT ${data.rut} no está registrado en el sistema. Debe registrarse primero para crear un ticket de soporte.`);
    }

    console.log(`Ticket asociado a usuario: ${user.firstName} ${user.lastName} (${user.rut})`);

    const ticket = await SupportTicket.create({
      user_id: user.id,
      description: data.description,
      attachment: data.attachment || null,
      tracking_number: trackingNumber,
      status: 'open'
    });

    const ticketWithUser = await SupportTicket.findByPk(ticket.id_ticket, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'rut'],
        required: true
      }]
    });

    return {
      ticket: ticketWithUser,
      tracking_number: trackingNumber
    };
  }

  static async sendConfirmationEmail(ticket: any, trackingNumber: string, description: string, rut: string) {
    try {
      if (ticket?.user?.email && ticket.user.email !== 'NO TIENE') {
        const userName = `${ticket.user.firstName || ''} ${ticket.user.lastName || ''}`.trim() || 'Usuario';
        
        await sendEmail(
          ticket.user.email,
          `Ticket de Soporte Creado - #${trackingNumber}`,
          `Hola ${userName},

Tu ticket ha sido creado exitosamente.

Número de seguimiento: ${trackingNumber}
RUT: ${ticket.user.rut}
Descripción: ${description}
Fecha: ${new Date().toLocaleDateString('es-CL')}
Estado: Abierto

IMPORTANTE: Guarda tu número de seguimiento para hacer seguimiento de tu ticket.

Estaremos respondiendo pronto.

Saludos,
Equipo de Soporte`
        );
        
        console.log(`Email de confirmación enviado a: ${ticket.user.email}`);
      } else {
        console.log(`Usuario ${rut} no tiene email válido - Email omitido`);
      }
    } catch (emailError) {
      console.warn('Error enviando email de confirmación:', emailError);
    }
  }

  static async getTicketsByRut(rut: string, filters: Partial<GetTicketsFilters> = {}, pagination: PaginationOptions) {
    const user = await User.findOne({
      where: { rut: rut },
      attributes: ['id', 'firstName', 'lastName']
    });

    if (!user) {
      throw new Error(`El RUT ${rut} no está registrado en el sistema.`);
    }

    const whereCondition: any = {
      user_id: user.id
    };

    if (filters.status) {
      whereCondition.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      whereCondition.created_at = {};
      if (filters.startDate) {
        whereCondition.created_at[Op.gte] = filters.startDate;
      }
      if (filters.endDate) {
        whereCondition.created_at[Op.lte] = filters.endDate;
      }
    }

    const tickets = await SupportTicket.findAndCountAll({
      where: whereCondition,
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'rut'],
        required: true
      }],
      order: [['created_at', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset
    });

    return {
      tickets: tickets.rows,
      total: tickets.count,
      pagination: {
        limit: pagination.limit,
        offset: pagination.offset,
        totalPages: Math.ceil(tickets.count / pagination.limit)
      }
    };
  }

  static async respondToTicket(ticketId: number, data: RespondTicketData) {
    const ticket = await SupportTicket.findByPk(ticketId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'rut'],
        required: true
      }]
    });

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    if (ticket.status === 'closed') {
      throw new Error('El ticket ya está cerrado');
    }

    await ticket.update({
      admin_response: data.adminResponse.trim(),
      admin_user_id: data.adminUserId,
      status: 'closed',
      responded_at: new Date()
    });

    return ticket;
  }

  static async sendResponseEmail(ticket: any, adminResponse: string) {
    try {
      if (ticket?.user?.email && ticket.user.email !== 'NO TIENE') {
        const userName = `${ticket.user.firstName || ''} ${ticket.user.lastName || ''}`.trim() || 'Usuario';
        
        await sendEmail(
          ticket.user.email,
          `Respuesta a tu Ticket #${ticket.tracking_number}`,
          `Hola ${userName},

Se ha respondido a tu ticket de soporte:

Ticket: #${ticket.tracking_number}
RUT: ${ticket.user.rut}
Tu consulta: ${ticket.description}

RESPUESTA DEL EQUIPO:
${adminResponse}

Estado: CERRADO
Respondido: ${new Date().toLocaleDateString('es-CL')}

Gracias por contactarnos.

Saludos,
Equipo de Soporte`
        );
        
        console.log(`Email de respuesta enviado a: ${ticket.user.email}`);
      } else {
        console.log(`Usuario RUT ${ticket.user.rut} no tiene email válido para respuesta`);
      }
    } catch (emailError) {
      console.warn('Error enviando email de respuesta:', emailError);
    }
  }

  static async getTicketById(ticketId: number) {
    const ticket = await SupportTicket.findByPk(ticketId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'rut'],
        required: true
      }]
    });

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    return ticket;
  }

  static async getTicketByTrackingNumber(trackingNumber: string) {
    const ticket = await SupportTicket.findOne({
      where: { tracking_number: trackingNumber },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'rut'],
        required: true
      }]
    });

    if (!ticket) {
      throw new Error('Ticket no encontrado con ese número de seguimiento');
    }

    return ticket;
  }

  static async getTickets(filters: GetTicketsFilters, pagination: PaginationOptions) {
    const whereClause: any = {};
    const includeClause: any = {
      model: User,
      as: 'user',
      attributes: ['id', 'firstName', 'lastName', 'email', 'rut'],
      required: true
    };

    if (filters.userId) {
      whereClause.user_id = filters.userId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.created_at = {};
      if (filters.startDate) {
        whereClause.created_at[Op.gte] = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.created_at[Op.lte] = filters.endDate;
      }
    }

    if (filters.rut || filters.search) {
      includeClause.where = {};
      
      if (filters.rut) {
        includeClause.where.rut = { [Op.iLike]: `%${filters.rut}%` };
      }

      if (filters.search) {
        includeClause.where[Op.or] = [
          { rut: { [Op.iLike]: `%${filters.search}%` } },
          { firstName: { [Op.iLike]: `%${filters.search}%` } },
          { lastName: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }
    }

    if (filters.search && !filters.rut) {
      whereClause[Op.or] = [
        { tracking_number: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    const tickets = await SupportTicket.findAndCountAll({
      where: whereClause,
      include: [includeClause],
      order: [['created_at', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset
    });

    return {
      tickets: tickets.rows,
      total: tickets.count,
      pagination: {
        limit: pagination.limit,
        offset: pagination.offset,
        totalPages: Math.ceil(tickets.count / pagination.limit)
      }
    };
  }

  static async updateTicketStatus(ticketId: number, data: UpdateTicketStatusData) {
    const ticket = await SupportTicket.findByPk(ticketId);

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    await ticket.update({ status: data.status });
    return ticket;
  }

  static async getTicketStats(period: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' = 'MONTH') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'TODAY':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'WEEK':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'MONTH':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'YEAR':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [totalTickets, openTickets, inProgressTickets, closedTickets, responseTimeData] = await Promise.all([
      SupportTicket.count({
        where: { created_at: { [Op.gte]: startDate } }
      }),
      SupportTicket.count({
        where: { status: 'open', created_at: { [Op.gte]: startDate } }
      }),
      SupportTicket.count({
        where: { status: 'in progress', created_at: { [Op.gte]: startDate } }
      }),
      SupportTicket.count({
        where: { status: 'closed', created_at: { [Op.gte]: startDate } }
      }),
      SupportTicket.findAll({
        where: {
          status: 'closed',
          responded_at: { [Op.not]: null },
          created_at: { [Op.gte]: startDate }
        },
        attributes: ['created_at', 'responded_at']
      })
    ]);

    let avgResponseHours = 0;
    if (responseTimeData.length > 0) {
      const totalHours = responseTimeData.reduce((acc, ticket) => {
        const created = new Date(ticket.created_at).getTime();
        const responded = new Date(ticket.responded_at!).getTime();
        return acc + ((responded - created) / (1000 * 60 * 60));
      }, 0);
      avgResponseHours = totalHours / responseTimeData.length;
    }

    return {
      period,
      summary: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        closed: closedTickets,
        averageResponseTimeHours: Math.round(avgResponseHours * 100) / 100
      },
      dateRange: {
        from: startDate,
        to: now
      }
    };
  }

  static validateCreateTicketData(data: any): CreateTicketData {
    const { rut, description, attachment } = data;

    if (!rut || typeof rut !== 'string' || rut.trim().length === 0) {
      throw new Error('El RUT es obligatorio');
    }

    const rutClean = rut.replace(/[.-]/g, '').trim();
    if (!/^\d{7,8}[0-9kK]$/.test(rutClean)) {
      throw new Error('El RUT debe tener un formato válido (ej: 12345678-9)');
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      throw new Error('La descripción debe tener al menos 10 caracteres');
    }

    if (description.trim().length > 2000) {
      throw new Error('La descripción no debe exceder 2000 caracteres');
    }

    if (attachment && typeof attachment !== 'string') {
      throw new Error('El attachment debe ser una URL válida');
    }

    return {
      rut: rut.trim(),
      description: description.trim(),
      attachment: attachment?.trim() || null
    };
  }

  static validateRespondData(data: any): RespondTicketData {
    if (!data.adminResponse?.trim()) {
      throw new Error('La respuesta del administrador es obligatoria');
    }

    if (data.adminResponse.length < 5) {
      throw new Error('La respuesta debe tener al menos 5 caracteres');
    }

    if (data.adminResponse.length > 2000) {
      throw new Error('La respuesta no puede exceder 2000 caracteres');
    }

    return {
      adminResponse: data.adminResponse.trim(),
      adminUserId: data.adminUserId
    };
  }
}