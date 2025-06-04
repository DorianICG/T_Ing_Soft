import SupportTicket from '../../models/SupportTicket';
import User from '../../models/User';
import generateTrackingNumber from '../../utils/generateTrackingNumber';
import { sendEmail } from '../../utils/emailService';
import { Op } from 'sequelize';

export interface CreateTicketData {
    userId: number;
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
    userId?: number;
    startDate?: Date;
    endDate?: Date;
}

export interface PaginationOptions {
    limit: number;
    offset: number;
}

export class SupportTicketService {
    
    /**
     * CREAR NUEVO TICKET
     */
    static async createTicket(data: CreateTicketData) {
        const trackingNumber = generateTrackingNumber();
        
        const ticket = await SupportTicket.create({
            user_id: data.userId,
            description: data.description,
            attachment: data.attachment || null,
            tracking_number: trackingNumber
        });

        const ticketWithUser = await SupportTicket.findByPk(ticket.id_ticket, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });

        return {
            ticket: ticketWithUser,
            tracking_number: trackingNumber
        };
    }

    /**
     * ENVIAR EMAIL DE CONFIRMACIÓN
     */
    static async sendConfirmationEmail(ticket: any, trackingNumber: string, description: string) {
        if (!ticket?.user?.email) return;

        try {
            await sendEmail(
                ticket.user.email,
                `Ticket de Soporte Creado - #${trackingNumber}`,
                `Hola ${ticket.user.firstName},

Tu ticket ha sido creado exitosamente.

📋 Número de seguimiento: ${trackingNumber}
📝 Descripción: ${description}
📅 Fecha: ${new Date().toLocaleDateString('es-CL')}

Estaremos respondiendo pronto.

Saludos,
Equipo de Soporte`
            );
        } catch (emailError) {
            console.warn('⚠️ Error enviando email de confirmación:', emailError);
            throw emailError;
        }
    }

    /**
     * RESPONDER TICKET (ADMIN)
     */
    static async respondToTicket(ticketId: number, data: RespondTicketData) {
        const ticket = await SupportTicket.findByPk(ticketId, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
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
            status: 'closed',
            responded_at: new Date()
        });

        return ticket;
    }

    /**
     * ENVIAR EMAIL DE RESPUESTA
     */
    static async sendResponseEmail(ticket: any, adminResponse: string) {
        if (!ticket?.user?.email) return;

        try {
            await sendEmail(
                ticket.user.email,
                `Respuesta a tu Ticket #${ticket.tracking_number}`,
                `Hola ${ticket.user.firstName},

Se ha respondido a tu ticket de soporte:

📋 Ticket: #${ticket.tracking_number}
📝 Tu consulta: ${ticket.description}

📋 RESPUESTA:
${adminResponse}

Estado: CERRADO ✅

Gracias por contactarnos.

Saludos,
Equipo de Soporte`
            );
        } catch (emailError) {
            console.warn('⚠️ Error enviando email de respuesta:', emailError);
            throw emailError;
        }
    }

    /**
     * OBTENER TICKET POR ID
     */
    static async getTicketById(ticketId: number) {
        const ticket = await SupportTicket.findByPk(ticketId, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });

        if (!ticket) {
            throw new Error('Ticket no encontrado');
        }

        return ticket;
    }

    /**
     * OBTENER TICKET POR TRACKING NUMBER
     */
    static async getTicketByTrackingNumber(trackingNumber: string) {
        const ticket = await SupportTicket.findOne({
            where: { tracking_number: trackingNumber },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });

        if (!ticket) {
            throw new Error('Ticket no encontrado con ese número de seguimiento');
        }

        return ticket;
    }

    /**
     * VERIFICAR PERMISOS DE ACCESO
     */
    static canAccessTicket(ticket: any, userId: number, userRole: string): boolean {
        return userRole === 'ADMIN' || ticket.user_id === userId;
    }

    /**
     * OBTENER TICKETS CON FILTROS Y PAGINACIÓN
     */
    static async getTickets(filters: GetTicketsFilters, pagination: PaginationOptions) {
        const whereClause: any = {};

        // FILTROS
        if (filters.userId) {
            whereClause.user_id = filters.userId;
        }

        if (filters.status) {
            whereClause.status = filters.status;
        }

        if (filters.search) {
            whereClause[Op.or] = [
                { tracking_number: { [Op.iLike]: `%${filters.search}%` } },
                { description: { [Op.iLike]: `%${filters.search}%` } }
            ];
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

        const tickets = await SupportTicket.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
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

    /**
     * ACTUALIZAR ESTADO DE TICKET
     */
    static async updateTicketStatus(ticketId: number, data: UpdateTicketStatusData) {
        const ticket = await SupportTicket.findByPk(ticketId);

        if (!ticket) {
            throw new Error('Ticket no encontrado');
        }

        await ticket.update({ status: data.status });
        return ticket;
    }

    /**
     * OBTENER ESTADÍSTICAS
     */
    static async getTicketStats(period: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' = 'MONTH') {
        // CALCULAR FECHAS SEGÚN PERÍODO
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

        // CONSULTAS EN PARALELO PARA MEJOR PERFORMANCE
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

        // CALCULAR TIEMPO PROMEDIO DE RESPUESTA
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

    /**
     * VALIDAR DATOS DE ENTRADA
     */
    static validateCreateTicketData(data: any): CreateTicketData {
        if (!data.userId || !data.description?.trim()) {
            throw new Error('Usuario y descripción son obligatorios');
        }

        if (data.description.length < 10) {
            throw new Error('La descripción debe tener al menos 10 caracteres');
        }

        if (data.description.length > 2000) {
            throw new Error('La descripción no puede exceder 2000 caracteres');
        }

        return {
            userId: data.userId,
            description: data.description.trim(),
            attachment: data.attachment || null
        };
    }

    /**
     * VALIDAR DATOS DE RESPUESTA
     */
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