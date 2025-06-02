import { Request, Response } from 'express';
import UserService from '../services/user.service';
import { AuthenticatedUserRequest, UpdateProfileRequest, ChangePasswordRequest } from '../types/user.types';

export class UserController {
  // Obtener perfil del usuario autenticado
  async getProfile(req: Request, res: Response): Promise<void> {
    const userReq = req as AuthenticatedUserRequest;
    
    try {
      if (!userReq.user || !userReq.user.id) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }

      const profile = await UserService.getUserProfile(userReq.user.id);
      res.status(200).json(profile);

    } catch (error: any) {
      console.error('Error obteniendo perfil de usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor al obtener el perfil.' });
    }
  }

  // Actualizar perfil del usuario
  async updateProfile(req: Request, res: Response): Promise<void> {
    const userReq = req as AuthenticatedUserRequest;
    
    try {
      if (!userReq.user || !userReq.user.id) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }

      const updateData: UpdateProfileRequest = {
        email: req.body.email,
        phone: req.body.phone
      };

      const updatedProfile = await UserService.updateUserProfile(userReq.user.id, updateData);
      
      res.status(200).json({
        message: 'Perfil actualizado exitosamente.',
        user: updatedProfile
      });

    } catch (error: any) {
      console.error('Error actualizando perfil de usuario:', error);
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al actualizar el perfil.' });
      }
    }
  }

  // Cambiar contraseña del usuario
  async changePassword(req: Request, res: Response): Promise<void> {
    const userReq = req as AuthenticatedUserRequest;
    
    try {
      if (!userReq.user || !userReq.user.id) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }

      const passwordData: ChangePasswordRequest = {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
        confirmPassword: req.body.confirmPassword
      };

      await UserService.changeUserPassword(userReq.user.id, passwordData);
      
      res.status(200).json({
        message: 'Contraseña actualizada exitosamente.'
      });

    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      if (error.message.includes('incorrecta') || 
          error.message.includes('diferente') ||
          error.message.includes('no encontrado')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al cambiar la contraseña.' });
      }
    }
  }
}

export default new UserController();