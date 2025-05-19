import express from 'express';
import { Request, Response } from 'express';
import SupportTicket from '../../models/SupportTicket';
import User from '../../models/User';
import generateTrackingNumber from '../../utils/generateTrackingNumber';
import { sendEmail } from '../../utils/emailService';

// Controlador completo
const createSupportTicket = async (req: Request, res: Response) => {
    const { user_id, description, attachment } = req.body;

    if (!description || !user_id) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const trackingNumber = generateTrackingNumber();

        const ticket = await SupportTicket.create({
            user_id,
            description,
            attachment,
            tracking_number: trackingNumber
        });

        // Enviar correo de confirmación al usuario
        const user = await User.findByPk(user_id);
        if (user && user.email) {
            await sendEmail(
                user.email,
                `Nuevo ticket abierto - #${trackingNumber}`,
                `Tu ticket ha sido creado con éxito.\nNúmero de seguimiento: ${trackingNumber}\nEstaremos respondiendo pronto.`
            );
        }

        res.status(201).json({
            message: 'Ticket creado exitosamente',
            ticket
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el ticket' });
    }
};

const updateAdminResponse = async (req: Request, res: Response) => {
    const { id_ticket, admin_response } = req.body;

    if (!id_ticket || !admin_response) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const ticket = await SupportTicket.findByPk(id_ticket);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        await ticket.update({
            admin_response,
            status: 'closed',
            responded_at: new Date()
        });

        const user = await User.findByPk(ticket.user_id);
        if (user && user.email) {
            await sendEmail(
                user.email,
                `Respuesta a tu ticket #${ticket.tracking_number}`,
                `Se ha respondido a tu ticket:\n\n"${admin_response}"\n\nGracias por tu consulta.`,
                `<p>Se ha respondido a tu ticket:</p><pre>${admin_response}</pre><br><p>Gracias por tu consulta.</p>` // Opcional: también enviar HTML
            );
        }

        res.json({
            message: 'Respuesta enviada y ticket cerrado',
            ticket
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el ticket' });
    }
};

const getTicketById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const ticket = await SupportTicket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        res.json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el ticket' });
    }
};

export {
    createSupportTicket,
    updateAdminResponse,
    getTicketById
};