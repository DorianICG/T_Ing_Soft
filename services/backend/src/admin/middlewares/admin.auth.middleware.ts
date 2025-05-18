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
      console.log(`INFO: activeOrganizationId no estaba definido. Establecido automáticamente a la única organización de administración: ${currentActiveOrgId}`);
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

export default function validate(schemaSource: { body?: Joi.Schema, query?: Joi.Schema, params?: Joi.Schema }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const options = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    let errors: Joi.ValidationErrorItem[] = [];
    const validatedDataCollector: { body?: any, query?: any, params?: any } = {};

    // Validar req.body
    if (schemaSource.body) {
      const { error, value } = schemaSource.body.validate(req.body, { ...options, stripUnknown: true }); // stripUnknown: true es común para body
      if (error) {
        errors = errors.concat(error.details);
      } else {
        validatedDataCollector.body = value; 
      }
    }

    // Validar req.query 
    if (schemaSource.query) {
      const { error, value } = schemaSource.query.validate(req.query, { ...options, stripUnknown: false });
      if (error) {
        errors = errors.concat(error.details);
      } else {
        validatedDataCollector.query = value; 
      }
    }

    // Validar req.params
    if (schemaSource.params) {
      const { error, value } = schemaSource.params.validate(req.params, options); 
      if (error) {
        errors = errors.concat(error.details);
      } else {
        validatedDataCollector.params = value;
      }
    }

    if (errors.length > 0) {
      const formattedErrors = errors.map((err: Joi.ValidationErrorItem) => ({
        message: err.message.replace(/['"]/g, ''),
        field: err.path.join('.'),
        location: schemaSource.body && validatedDataCollector.body && err.path.length > 0 && Object.prototype.hasOwnProperty.call(req.body, err.path[0]) ? 'body' :
                    schemaSource.query && validatedDataCollector.query && err.path.length > 0 && Object.prototype.hasOwnProperty.call(req.query, err.path[0]) ? 'query' :
                    schemaSource.params && validatedDataCollector.params && err.path.length > 0 && Object.prototype.hasOwnProperty.call(req.params, err.path[0]) ? 'params' : err.path[0] || 'unknown',
      }));
      return res.status(400).json({ errors: formattedErrors });
    }

    (req as any).validatedData = validatedDataCollector;
    next();
  };
}