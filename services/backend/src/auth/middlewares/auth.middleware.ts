import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/env';
import User from '../../models/User';
import Role from '../../models/Role'; 

export const authenticate = (roles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'Acceso no autorizado. Token requerido.' });
      }

      const decoded = jwt.verify(token, config.JWT_SECRET) as any;

      const user = await User.findByPk(decoded.id, {
        include: [{ model: Role, as: 'role' }],
      });

      if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      const userRole = (user as any).role;
      if (!userRole || !userRole.name) {
         console.error('User role information is missing:', user);
         return res.status(500).json({ error: 'Error interno al verificar el rol.' });
      }


      if (roles.length > 0 && !roles.includes(userRole.name)) {
        return res.status(403).json({ error: 'Acceso prohibido. Rol no autorizado.' });
      }

      (req as any).user = user;
      next();
    } catch (error) {
      console.error('Error en autenticación:', error);
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expirado.' });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Token inválido.' });
      }
      res.status(500).json({ error: 'Error interno del servidor durante la autenticación.' });
    }
  };
};

export const isAdmin = authenticate(['ADMIN']);
export const isInspector = authenticate(['INSPECTOR']);
export const isParent = authenticate(['PARENT']);