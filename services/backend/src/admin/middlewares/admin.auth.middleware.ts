import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config/env';
import UserModel, { UserAttributes } from '../../models/User';
import RoleModel, { RoleAttributes } from '../../models/Role';
import OrganizationModel, { OrganizationAttributes } from '../../models/Organization';
import UserOrganizationRoleModel, { UserOrganizationRoleAttributes } from '../../models/UserOrganizationRole';

export interface AuthenticatedAdminUser extends UserAttributes {
  organizationRoleEntries?: (UserOrganizationRoleAttributes & {
      role?: RoleAttributes;
      organization?: OrganizationAttributes;
  })[];
  adminOrganizations?: OrganizationAttributes[];
  activeOrganizationId?: number;
}

export interface AuthenticatedAdminRequest extends Request {
  user?: AuthenticatedAdminUser;
  validatedData?: {
    body?: any;
    query?: any;
    params?: any;
  };
  file?: Express.Multer.File; 
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acceso no autorizado. Token no proporcionado.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET as string) as JwtPayload & { id: number };

    const userInstance = await UserModel.findByPk(decoded.id, {
        include: [{
            model: UserOrganizationRoleModel,
            as: 'organizationRoleEntries',
            required: false, 
            include: [
                { model: RoleModel, as: 'role', attributes: ['id', 'name'] },
                { model: OrganizationModel, as: 'organization', attributes: ['id', 'name'] }
            ]
        }]
    });

    if (!userInstance || !userInstance.isActive) {
      res.status(403).json({ error: 'Acceso denegado. Usuario inactivo o no encontrado.' });
      return;
    }

    const allUserOrgEntries = userInstance.organizationRoleEntries || [];

    const adminSpecificEntries = allUserOrgEntries.filter(
        entry => entry.role && entry.role.name === 'ADMIN'
    );

    if (adminSpecificEntries.length === 0) {
      res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador activo en al menos una organización.' });
      return;
    }

    const plainUserAttributes = userInstance.get({ plain: true }) as UserAttributes;

    const adminOrganizationsList = adminSpecificEntries
        .map(entry => entry.organization?.get({ plain: true }))
        .filter(org => org !== undefined) as OrganizationAttributes[];

    const allPopulatedEntries = allUserOrgEntries.map(entry => {
        const plainEntry = entry.get({ plain: true }) as UserOrganizationRoleAttributes;
        const plainRole = entry.role?.get({ plain: true }) as RoleAttributes | undefined;
        const plainOrganization = entry.organization?.get({ plain: true }) as OrganizationAttributes | undefined;
        return { ...plainEntry, role: plainRole, organization: plainOrganization };
    });
    
    let currentActiveOrgId = (req as AuthenticatedAdminRequest).user?.activeOrganizationId;

    if (currentActiveOrgId === undefined && adminOrganizationsList.length === 1) {
      currentActiveOrgId = adminOrganizationsList[0].id;
    }
    
    if (currentActiveOrgId !== undefined) {
      const isAdminInActiveOrg = adminSpecificEntries.some(
          entry => entry.organizationId === currentActiveOrgId
      );
      if (!isAdminInActiveOrg) {
          res.status(403).json({ error: `Acceso denegado. El usuario no es administrador en la organización activa seleccionada (ID: ${currentActiveOrgId}).` });
          return;
      }
    }

    (req as AuthenticatedAdminRequest).user = {
      ...plainUserAttributes,
      organizationRoleEntries: allPopulatedEntries,
      adminOrganizations: adminOrganizationsList,
      ...(currentActiveOrgId !== undefined && { activeOrganizationId: currentActiveOrgId })
    };
    
    next();
  } catch (error) {
    console.error('Error de autenticación de administrador:', error);
    if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token expirado.' });
    } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: 'Token inválido.' });
    } else {
        res.status(401).json({ error: 'Acceso no autorizado.' });
    }
    return;
  }
};
