import { Request, Response, NextFunction } from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import config from '../../config/env';
import UserModel, { UserAttributes } from '../../models/User'; 
import RoleModel, { RoleAttributes } from '../../models/Role'; 
import UserOrganizationRoleModel, { UserOrganizationRoleAttributes } from '../../models/UserOrganizationRole';


export interface AuthenticatedUserType extends UserAttributes {
  effectiveRole?: string | null;
  organizationRoleEntries?: (UserOrganizationRoleAttributes & { role?: RoleAttributes })[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserType;
}

const getHighestPriorityRoleForMiddleware = (
  userOrgRoles: (UserOrganizationRoleAttributes & { role?: RoleAttributes })[] | undefined | null
): string | null => {
  if (!userOrgRoles || userOrgRoles.length === 0) {
    return null;
  }
  const roleHierarchy = ['ADMIN', 'INSPECTOR', 'PARENT'];
  let highestRoleName: string | null = null;
  let highestPriorityIndex = roleHierarchy.length;

  for (const entry of userOrgRoles) {
    if (entry.role && entry.role.name) {
      const roleNameUpper = entry.role.name.toUpperCase();
      const priorityIndex = roleHierarchy.indexOf(roleNameUpper);
      if (priorityIndex !== -1 && priorityIndex < highestPriorityIndex) {
        highestPriorityIndex = priorityIndex;
        highestRoleName = entry.role.name;
      }
    }
  }
  return highestRoleName;
};

export const authenticate = (allowedRoles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        res.status(401).json({ error: 'Acceso no autorizado. Token requerido.' });
        return;
      }

      const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload & { id: number, role: string };

      const userInstance = await UserModel.findByPk(decoded.id, { 
        include: [{
          model: UserOrganizationRoleModel,
          as: 'organizationRoleEntries',
          required: false,
          include: [{
            model: RoleModel, 
            as: 'role',
            attributes: ['id', 'name']
          }]
        }]
      });

      if (!userInstance) {
        res.status(401).json({ error: 'Usuario no encontrado' });
        return;
      }

      const plainOrganizationRoleEntries = userInstance.organizationRoleEntries?.map(entry => {
        const plainEntry = entry.get({ plain: true }) as UserOrganizationRoleAttributes;
        const plainRole = entry.role?.get({ plain: true }) as RoleAttributes | undefined; 
        return { ...plainEntry, role: plainRole }; 
      });

      const effectiveUserRoleName = getHighestPriorityRoleForMiddleware(plainOrganizationRoleEntries);

      if (!effectiveUserRoleName) {
        console.error('User role information is missing or no valid roles found from DB:', userInstance);
        res.status(500).json({ error: 'Error interno al verificar el rol del usuario.' });
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveUserRoleName)) {
        res.status(403).json({ error: `Acceso prohibido. Rol '${effectiveUserRoleName}' no autorizado para este recurso.` });
        return;
      }

      (req as AuthenticatedRequest).user = {
        ...(userInstance.get({ plain: true }) as UserAttributes),
        effectiveRole: effectiveUserRoleName, 
        organizationRoleEntries: plainOrganizationRoleEntries
      };

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

export const verifyForceChangeToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token temporal para cambio de contraseña no proporcionado.' });
    return; 
  }

  const token = authHeader.split(' ')[1];

  try {
    // Explicitly type the expected payload from this specific token
    const decoded = jwt.verify(token, config.JWT_SECRET as string) as JwtPayload & { id: number; action: string };

    if (!decoded || typeof decoded.id !== 'number' || decoded.action !== 'force-change-password') {
      res.status(403).json({ error: 'Token inválido o no autorizado para esta acción.' });
      return;
    }

    (req as any).user = { id: decoded.id, action: decoded.action };
    
    next();
  } catch (error) {
    console.error('Error en verifyForceChangeToken:', error);
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expirado.' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Token inválido.' });
      return;
    }
    res.status(500).json({ error: 'Error interno del servidor durante la verificación del token.' });
    return;
  }
};

export const isAdmin = authenticate(['ADMIN']);
export const isInspector = authenticate(['INSPECTOR', 'ADMIN']); 
export const isParent = authenticate(['PARENT', 'INSPECTOR', 'ADMIN']);
export const isAuthenticated = authenticate();