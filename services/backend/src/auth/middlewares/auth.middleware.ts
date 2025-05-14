import { Request, Response, NextFunction } from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import config from '../../config/env';
import User from '../../models/User';
import Role from '../../models/Role'; 

export interface AuthenticatedRequest extends Request {
  user?: import('../../models/User').default | { id: number; action?: string };
}

export const authenticate = (roles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        res.status(401).json({ error: 'Acceso no autorizado. Token requerido.' });
        return;
      }

      const decoded = jwt.verify(token, config.JWT_SECRET) as any;

      const user = await User.findByPk(decoded.id, {
        include: [{ model: Role, as: 'role' }],
      });

      if (!user) {
        res.status(401).json({ error: 'Usuario no encontrado' });
        return;
      }

      const userRole = (user as any).role;
      if (!userRole || !userRole.name) {
        console.error('User role information is missing:', user);
        res.status(500).json({ error: 'Error interno al verificar el rol.' });
        return;
      }


      if (roles.length > 0 && !roles.includes(userRole.name)) {
        res.status(403).json({ error: 'Acceso prohibido. Rol no autorizado.' });
        return;
      }

      (req as any).user = user;
      next();
    } catch (error) {
      console.error('Error en autenticación:', error);
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token expirado.' });
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: 'Token inválido.' });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor durante la autenticación.' });
      return;
    }
  };
};

export const verifyForceChangeToken = (req: Request, res: Response, next: NextFunction): void => { // Explicitly type return as void
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token temporal para cambio de contraseña no proporcionado.' });
    return; // Ensure void return after sending response
  }

  const token = authHeader.split(' ')[1];

  try {
    // Explicitly type the expected payload from this specific token
    const decoded = jwt.verify(token, config.JWT_SECRET as string) as JwtPayload & { id: number; action: string };

    if (!decoded || typeof decoded.id !== 'number' || decoded.action !== 'force-change-password') {
      res.status(403).json({ error: 'Token inválido o no autorizado para esta acción.' });
      return; // Ensure void return after sending response
    }

    // Augment the standard Request object.
    // This relies on Express.Request being extensible, possibly via global augmentation.
    (req as any).user = { id: decoded.id, action: decoded.action };
    
    next();
  } catch (error) {
    console.error('Error en verifyForceChangeToken:', error);
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token temporal expirado.' });
      return; // Ensure void return after sending response
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Token temporal inválido.' });
      return; // Ensure void return after sending response
    }
    res.status(500).json({ error: 'Error interno al verificar el token temporal.' });
    return; 
  }
};

export const isAdmin = authenticate(['ADMIN']);
export const isInspector = authenticate(['INSPECTOR']);
export const isParent = authenticate(['PARENT']);