// tutorial.controller.ts
import { Request, Response } from 'express';
import models from '../../models';
const { TutorialVideo, UserTutorialView } = models;

export const checkTutorial = async (req: Request, res: Response): Promise<Response | void> => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Falta el ID del usuario' });

  try {
    const activeVideo = await TutorialVideo.findOne({ where: { is_active: true } });
    if (!activeVideo) return res.json({ showTutorial: false });

    const hasViewed = await UserTutorialView.findOne({
      where: { user_id: userId, tutorial_video_id: activeVideo.id }
    });

    return res.json({ showTutorial: !hasViewed, video: hasViewed ? null : activeVideo });
  } catch (error) {
    console.error('Error al verificar el tutorial:', error);
    return res.status(500).json({ error: 'Error al verificar el tutorial' });
  }
};

export const markAsViewed = async (req: Request, res: Response): Promise<Response | void> => {
  const { userId, tutorialVideoId } = req.body;
  if (!userId || !tutorialVideoId)
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });

  try {
    await UserTutorialView.create({ user_id: userId, tutorial_video_id: tutorialVideoId });
    return res.json({ message: 'Tutorial marcado como visto' });
  } catch (error) {
    console.error('Error al marcar el tutorial como visto:', error);
    return res.status(500).json({ error: 'Error al marcar el tutorial como visto' });
  }
};