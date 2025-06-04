import TutorialVideo from '../../models/TutorialVideo';
import UserTutorialView from '../../models/UserTutorialView'; 
import User from '../../models/User';
import { Op } from 'sequelize';

export interface CreateTutorialData {
    title: string;
    description?: string;
    url: string;
    duration_seconds?: number;
}

export interface UpdateTutorialData {
    title?: string;
    description?: string;
    url?: string;
    duration_seconds?: number;
    is_active?: boolean;
}

export interface GetTutorialsFilters {
    userId?: number;
    isActive?: boolean;
}

export interface PaginationOptions {
    limit: number;
    offset: number;
}

export interface TutorialWithProgress {
    id: number;
    title: string;
    description: string | null;
    url: string;
    duration_seconds: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    hasViewed: boolean;
}

export class TutorialVideoService {

    /**
     * VERIFICAR SI USUARIO DEBE VER TUTORIALES
     */
    static async checkTutorialForUser(userId: number) {
        try {
            // BUSCAR TUTORIALES DISPONIBLES
            const availableTutorials = await TutorialVideo.findAll({
                where: {
                    is_active: true
                },
                order: [['created_at', 'ASC']]
            });

            if (availableTutorials.length === 0) {
                return {
                    showTutorial: false,
                    message: 'No hay tutoriales disponibles',
                    nextTutorial: null
                };
            }

            // VERIFICAR TUTORIALES YA VISTOS
            const viewedTutorials = await UserTutorialView.findAll({
                where: { 
                    user_id: userId
                },
                attributes: ['tutorial_video_id']
            });

            const viewedIds = viewedTutorials.map((vt: any) => vt.tutorial_video_id);

            // BUSCAR SIGUIENTE TUTORIAL NO VISTO
            const nextTutorial = availableTutorials.find(tutorial => 
                !viewedIds.includes(tutorial.id)
            );

            if (!nextTutorial) {
                return {
                    showTutorial: false,
                    message: 'Todos los tutoriales han sido completados',
                    nextTutorial: null,
                    completedCount: viewedTutorials.length,
                    totalCount: availableTutorials.length
                };
            }

            return {
                showTutorial: true,
                message: 'Tutorial disponible',
                nextTutorial: {
                    id: nextTutorial.id,
                    title: nextTutorial.title,
                    description: nextTutorial.description,
                    url: nextTutorial.url,
                    duration_seconds: nextTutorial.duration_seconds
                },
                progress: {
                    completed: viewedTutorials.length,
                    total: availableTutorials.length,
                    percentage: Math.round((viewedTutorials.length / availableTutorials.length) * 100)
                }
            };

        } catch (error) {
            console.error('Error verificando tutorial para usuario:', error);
            throw new Error('Error al verificar tutoriales disponibles');
        }
    }

    /**
     * MARCAR TUTORIAL COMO VISTO
     */
    static async markTutorialAsViewed(userId: number, tutorialVideoId: number) {
        try {
            // VERIFICAR QUE EL TUTORIAL EXISTE
            const tutorial = await TutorialVideo.findByPk(tutorialVideoId);
            if (!tutorial) {
                throw new Error('Tutorial no encontrado');
            }

            // VERIFICAR SI YA LO VIO
            const existingView = await UserTutorialView.findOne({
                where: {
                    user_id: userId,
                    tutorial_video_id: tutorialVideoId
                }
            });

            if (existingView) {
                return {
                    alreadyViewed: true,
                    message: 'Tutorial ya marcado como visto',
                    viewedAt: existingView.viewed_at
                };
            }

            // CREAR REGISTRO DE VISUALIZACIÓN
            const view = await UserTutorialView.create({
                user_id: userId,
                tutorial_video_id: tutorialVideoId,
                viewed_at: new Date()
            });

            // OBTENER SIGUIENTE TUTORIAL RECOMENDADO
            const nextRecommendation = await this.getNextRecommendedTutorial(userId);

            return {
                view,
                alreadyViewed: false,
                message: 'Tutorial marcado como visto exitosamente',
                nextRecommendation
            };

        } catch (error) {
            console.error('Error marcando tutorial como visto:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error al marcar tutorial como visto');
        }
    }

    /**
     * OBTENER SIGUIENTE TUTORIAL RECOMENDADO
     */
    static async getNextRecommendedTutorial(userId: number) {
        const recommendation = await this.checkTutorialForUser(userId);
        return recommendation.nextTutorial;
    }

    /**
     * OBTENER TUTORIALES CON FILTROS
     */
    static async getTutorials(filters: GetTutorialsFilters, pagination: PaginationOptions) {
        try {
            const whereClause: any = {};

            // APLICAR FILTROS DISPONIBLES
            if (filters.isActive !== undefined) {
                whereClause.is_active = filters.isActive;
            } else {
                whereClause.is_active = true;
            }

            // OBTENER TUTORIALES
            const tutorials = await TutorialVideo.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'ASC']],
                limit: pagination.limit,
                offset: pagination.offset
            });

            // SI HAY USUARIO, AGREGAR ESTADO DE VISUALIZACIÓN
            let tutorialsWithProgress: TutorialWithProgress[] = tutorials.rows.map(tutorial => ({
                ...tutorial.toJSON(),
                hasViewed: false
            })) as TutorialWithProgress[];

            if (filters.userId) {
                const userViews = await UserTutorialView.findAll({
                    where: { 
                        user_id: filters.userId,
                        tutorial_video_id: { [Op.in]: tutorials.rows.map(t => t.id) }
                    }
                });

                const viewedIds = new Set(userViews.map((uv: any) => uv.tutorial_video_id));

                tutorialsWithProgress = tutorials.rows.map(tutorial => ({
                    ...tutorial.toJSON(),
                    hasViewed: viewedIds.has(tutorial.id)
                })) as TutorialWithProgress[];
            }

            return {
                tutorials: tutorialsWithProgress,
                total: tutorials.count,
                pagination: {
                    limit: pagination.limit,
                    offset: pagination.offset,
                    totalPages: Math.ceil(tutorials.count / pagination.limit)
                }
            };

        } catch (error) {
            console.error('Error obteniendo tutoriales:', error);
            throw new Error('Error al obtener tutoriales');
        }
    }

    /**
     * OBTENER TUTORIAL POR ID
     */
    static async getTutorialById(tutorialId: number, userId?: number) {
        try {
            const tutorial = await TutorialVideo.findByPk(tutorialId);

            if (!tutorial) {
                throw new Error('Tutorial no encontrado');
            }

            let tutorialWithProgress: TutorialWithProgress = {
                ...tutorial.toJSON(),
                hasViewed: false
            } as TutorialWithProgress;

            // VERIFICAR SI EL USUARIO LO VIO
            if (userId) {
                const view = await UserTutorialView.findOne({
                    where: { 
                        user_id: userId,
                        tutorial_video_id: tutorialId
                    }
                });

                tutorialWithProgress = {
                    ...tutorial.toJSON(),
                    hasViewed: !!view
                } as TutorialWithProgress;
            }

            return tutorialWithProgress;

        } catch (error) {
            console.error('Error obteniendo tutorial por ID:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error al obtener tutorial');
        }
    }

    /**
     * OBTENER PROGRESO DEL USUARIO
     */
    static async getUserProgress(userId: number) {
        try {
            // OBTENER TUTORIALES DISPONIBLES
            const totalTutorials = await TutorialVideo.count({
                where: { is_active: true }
            });

            // OBTENER TUTORIALES VISTOS POR EL USUARIO
            const userViews = await UserTutorialView.findAll({
                where: { user_id: userId },
                include: [{
                    model: TutorialVideo,
                    as: 'tutorialVideo',
                    where: { is_active: true },
                    attributes: ['title', 'duration_seconds']
                }],
                order: [['viewed_at', 'DESC']]
            });

            return {
                summary: {
                    totalTutorials,
                    viewedCount: userViews.length,
                    pendingCount: totalTutorials - userViews.length,
                    completionPercentage: totalTutorials > 0 
                        ? Math.round((userViews.length / totalTutorials) * 100) 
                        : 0
                },
                recentActivity: userViews.slice(0, 5), // Últimos 5 tutoriales vistos
                achievements: this.calculateAchievements(userViews.length, userViews)
            };

        } catch (error) {
            console.error('Error obteniendo progreso del usuario:', error);
            throw new Error('Error al obtener progreso del usuario');
        }
    }

    /**
     * CALCULAR LOGROS/ACHIEVEMENTS
     */
    static calculateAchievements(viewedCount: number, allViews: any[]) {
        const achievements = [];

        // LOGROS POR CANTIDAD
        if (viewedCount >= 1) achievements.push({ name: 'Primer Tutorial', description: 'Viste tu primer tutorial' });
        if (viewedCount >= 3) achievements.push({ name: 'Estudiante Activo', description: 'Viste 3 tutoriales' });
        if (viewedCount >= 5) achievements.push({ name: 'Experto en Aprendizaje', description: 'Viste 5 tutoriales' });

        // LOGROS POR CONSISTENCIA
        const recentViews = allViews.filter(v => {
            const viewDate = new Date(v.viewed_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return viewDate >= weekAgo;
        });

        if (recentViews.length >= 2) {
            achievements.push({ name: 'Aprendiz Consistente', description: 'Viste 2 tutoriales esta semana' });
        }

        return achievements;
    }

    /**
     * FUNCIONES ADMINISTRATIVAS
     */

    /**
     * CREAR TUTORIAL (SIMPLIFICADO)
     */
    static async createTutorial(data: CreateTutorialData) {
        try {
            const tutorial = await TutorialVideo.create({
                title: data.title,
                description: data.description || null,
                url: data.url,
                duration_seconds: data.duration_seconds || 60,
                is_active: true
            });

            return tutorial;

        } catch (error) {
            console.error('Error creando tutorial:', error);
            throw new Error('Error al crear tutorial');
        }
    }

    /**
     * ACTUALIZAR TUTORIAL
     */
    static async updateTutorial(tutorialId: number, data: UpdateTutorialData) {
        try {
            const tutorial = await TutorialVideo.findByPk(tutorialId);

            if (!tutorial) {
                throw new Error('Tutorial no encontrado');
            }

            await tutorial.update(data);
            return tutorial;

        } catch (error) {
            console.error('Error actualizando tutorial:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error al actualizar tutorial');
        }
    }

    /**
     * ACTIVAR/DESACTIVAR TUTORIAL
     */
    static async toggleTutorialStatus(tutorialId: number, isActive: boolean) {
        try {
            const tutorial = await TutorialVideo.findByPk(tutorialId);

            if (!tutorial) {
                throw new Error('Tutorial no encontrado');
            }

            await tutorial.update({ is_active: isActive });
            return tutorial;

        } catch (error) {
            console.error('Error cambiando estado del tutorial:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error al cambiar estado del tutorial');
        }
    }

    /**
     * ELIMINAR TUTORIAL
     */
    static async deleteTutorial(tutorialId: number) {
        try {
            const tutorial = await TutorialVideo.findByPk(tutorialId);

            if (!tutorial) {
                throw new Error('Tutorial no encontrado');
            }

            // ELIMINAR VISUALIZACIONES RELACIONADAS PRIMERO
            await UserTutorialView.destroy({
                where: { tutorial_video_id: tutorialId }
            });

            // ELIMINAR TUTORIAL
            await tutorial.destroy();

            return { message: 'Tutorial eliminado exitosamente' };

        } catch (error) {
            console.error('Error eliminando tutorial:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error al eliminar tutorial');
        }
    }

    /**
     * OBTENER ESTADÍSTICAS DE TUTORIALES
     */
    static async getTutorialStats(period: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' = 'MONTH', tutorialId?: number) {
        try {
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

            // FILTROS BASE
            const viewsWhere: any = {
                viewed_at: { [Op.gte]: startDate }
            };

            if (tutorialId) {
                viewsWhere.tutorial_video_id = tutorialId;
            }

            // CONSULTAS EN PARALELO
            const [
                totalViews,
                uniqueViewers,
                totalTutorials
            ] = await Promise.all([
                // Total de visualizaciones
                UserTutorialView.count({
                    where: viewsWhere
                }),
                // Usuarios únicos que vieron tutoriales
                UserTutorialView.count({
                    where: viewsWhere,
                    distinct: true,
                    col: 'user_id'
                }),
                // Total de tutoriales activos
                TutorialVideo.count({
                    where: { is_active: true }
                })
            ]);

            return {
                period,
                summary: {
                    totalViews,
                    uniqueViewers,
                    totalTutorials,
                    avgViewsPerUser: uniqueViewers > 0 ? Math.round((totalViews / uniqueViewers) * 100) / 100 : 0
                },
                dateRange: {
                    from: startDate,
                    to: now
                }
            };

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw new Error('Error al obtener estadísticas de tutoriales');
        }
    }

    /**
     * VALIDAR DATOS DE CREACIÓN
     */
    static validateCreateData(data: any): CreateTutorialData {
        if (!data.title?.trim()) {
            throw new Error('El título es obligatorio');
        }

        if (!data.url?.trim()) {
            throw new Error('La URL del video es obligatoria');
        }

        if (data.duration_seconds && (data.duration_seconds < 1 || data.duration_seconds > 300)) {
            throw new Error('La duración debe estar entre 1 y 300 segundos');
        }

        return {
            title: data.title.trim(),
            description: data.description?.trim() || undefined,
            url: data.url.trim(),
            duration_seconds: data.duration_seconds || 60
        };
    }
}