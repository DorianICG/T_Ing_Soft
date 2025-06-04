import { Request, Response } from 'express';
import { TutorialVideoService } from '../services/tutorial_video.service';

/**
 * VERIFICAR SI EL USUARIO DEBE VER TUTORIAL
 * POST /api/support/tutorials/check
 */
export const checkTutorial = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id; 

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }

        const result = await TutorialVideoService.checkTutorialForUser(userId);

        res.status(200).json({
            success: true,
            data: result,
            message: result.showTutorial ? 'Tutorial disponible' : 'No hay tutoriales pendientes'
        });

    } catch (error: unknown) {
        console.error('Error verificando tutorial:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        res.status(500).json({
            success: false,
            message: 'Error al verificar tutorial',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * MARCAR TUTORIAL COMO VISTO
 * POST /api/support/tutorials/mark-viewed
 */
export const markAsViewed = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { tutorialVideoId } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }

        const result = await TutorialVideoService.markTutorialAsViewed(userId, tutorialVideoId);

        res.status(201).json({
            success: true,
            data: result,
            message: result.alreadyViewed ? 'Tutorial ya estaba marcado como visto' : 'Tutorial marcado como visto exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error marcando tutorial como visto:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        res.status(400).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * OBTENER TODOS LOS TUTORIALES DISPONIBLES
 * GET /api/support/tutorials
 */
export const getAllTutorials = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { limit = 20, offset = 0 } = req.query; // REMOVIDO: platform, category

        const filters = {
            userId // SIMPLIFICADO: solo userId
        };

        const pagination = {
            limit: Number(limit),
            offset: Number(offset)
        };

        const result = await TutorialVideoService.getTutorials(filters, pagination);

        res.status(200).json({
            success: true,
            data: result,
            message: 'Tutoriales obtenidos exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error obteniendo tutoriales:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * OBTENER TUTORIAL POR ID
 * GET /api/support/tutorials/:id
 */
export const getTutorialById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const tutorial = await TutorialVideoService.getTutorialById(Number(id), userId);

        res.status(200).json({
            success: true,
            data: { tutorial },
            message: 'Tutorial obtenido exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error obteniendo tutorial:', error);
        
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
 * OBTENER PROGRESO DEL USUARIO
 * GET /api/support/tutorials/my-progress
 */
export const getUserProgress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }

        const progress = await TutorialVideoService.getUserProgress(userId);

        res.status(200).json({
            success: true,
            data: progress,
            message: 'Progreso obtenido exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error obteniendo progreso:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * FUNCIONES ADMINISTRATIVAS
 */

/**
 * CREAR NUEVO TUTORIAL (ADMIN) - SIMPLIFICADO
 * POST /api/support/tutorials/admin/create
 */
export const createTutorial = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, url, duration_seconds } = req.body;

        const validatedData = TutorialVideoService.validateCreateData({
            title,
            description,
            url, 
            duration_seconds 
        });

        const tutorial = await TutorialVideoService.createTutorial(validatedData);

        res.status(201).json({
            success: true,
            data: { tutorial },
            message: 'Tutorial creado exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error creando tutorial:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        res.status(400).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};

/**
 * ACTUALIZAR TUTORIAL (ADMIN)
 * PUT /api/support/tutorials/admin/:id
 */
export const updateTutorial = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const tutorial = await TutorialVideoService.updateTutorial(Number(id), updateData);

        res.status(200).json({
            success: true,
            data: { tutorial },
            message: 'Tutorial actualizado exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error actualizando tutorial:', error);
        
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
 * ACTIVAR/DESACTIVAR TUTORIAL (ADMIN)
 * PATCH /api/support/tutorials/admin/:id/toggle
 */
export const toggleTutorialStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const tutorial = await TutorialVideoService.toggleTutorialStatus(Number(id), is_active);

        res.status(200).json({
            success: true,
            data: { tutorial },
            message: `Tutorial ${is_active ? 'activado' : 'desactivado'} exitosamente`
        });

    } catch (error: unknown) {
        console.error('Error cambiando estado del tutorial:', error);
        
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
 * OBTENER ESTADÍSTICAS DE TUTORIALES (ADMIN)
 * GET /api/support/tutorials/admin/stats
 */
export const getTutorialStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { period = 'MONTH', tutorialId } = req.query;

        const stats = await TutorialVideoService.getTutorialStats(
            period as any,
            tutorialId ? Number(tutorialId) : undefined
        );

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

/**
 * ELIMINAR TUTORIAL (ADMIN)
 * DELETE /api/support/tutorials/admin/:id
 */
export const deleteTutorial = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        await TutorialVideoService.deleteTutorial(Number(id));

        res.status(200).json({
            success: true,
            message: 'Tutorial eliminado exitosamente'
        });

    } catch (error: unknown) {
        console.error('Error eliminando tutorial:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrado') ? 404 : 500;
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};