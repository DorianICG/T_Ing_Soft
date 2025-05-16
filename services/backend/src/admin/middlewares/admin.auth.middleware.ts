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
}

export interface AuthenticatedAdminRequest extends Request {
  user?: AuthenticatedAdminUser;
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

    const adminEntriesFromInstance = userInstance.organizationRoleEntries?.filter(
        entry => entry.role && entry.role.name === 'ADMIN'
    );

    if (!adminEntriesFromInstance || adminEntriesFromInstance.length === 0) {
      res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador activo en al menos una organización.' });
      return;
    }

    const plainUserAttributes = userInstance.get({ plain: true }) as UserAttributes;

    const populatedAdminEntries = adminEntriesFromInstance.map(entry => {
        const plainEntry = entry.get({ plain: true }) as UserOrganizationRoleAttributes;
        const plainRole = entry.role?.get({ plain: true }) as RoleAttributes | undefined;
        const plainOrganization = entry.organization?.get({ plain: true }) as OrganizationAttributes | undefined;
        return {
            ...plainEntry,
            role: plainRole,
            organization: plainOrganization,
        };
    });

    const adminOrgs = adminEntriesFromInstance
        .map(entry => entry.organization?.get({ plain: true }))
        .filter(org => org !== undefined) as OrganizationAttributes[];

    (req as AuthenticatedAdminRequest).user = {
        ...plainUserAttributes,
        organizationRoleEntries: populatedAdminEntries,
        adminOrganizations: adminOrgs,
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

export default function validate(schemaSource: any) { 
  return (req: Request, res: Response, next: NextFunction) => {
    const options = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    let errors: Joi.ValidationErrorItem[] = [];
    let validatedData: { [key: string]: any } = {};

    if (schemaSource.query) {
      const { error, value } = schemaSource.query.validate(req.query, { ...options, stripUnknown: false }); 
      if (error) {
        errors = errors.concat(error.details);
      } else {
        (req as any).validatedQuery = value; 
      }
    }

    if (schemaSource.query) {
      const { error, value } = schemaSource.query.validate(req.query, { ...options, stripUnknown: false }); 
      if (error) {
        errors = errors.concat(error.details);
      } else {
        (req as any).validatedQuery = value; 
        validatedData.query = value;
      }
    }

    if (schemaSource.params) {
      const { error, value } = schemaSource.params.validate(req.params, options);
      if (error) {
        errors = errors.concat(error.details);
      } else {
        (req as any).validatedParams = value;
        validatedData.params = value;
      }
    }

    if (errors.length > 0) {
      const formattedErrors = errors.map((err: Joi.ValidationErrorItem) => ({
        message: err.message,
        field: err.path.join('.'),
        location: schemaSource.body && err.context?.key && req.body.hasOwnProperty(err.context.key) ? 'body' :
                    schemaSource.query && err.context?.key && req.query.hasOwnProperty(err.context.key) ? 'query' :
                    schemaSource.params && err.context?.key && req.params.hasOwnProperty(err.context.key) ? 'params' : 'unknown',
      }));
      return res.status(400).json({ errors: formattedErrors });
    }

    (req as any).validatedData = validatedData;

    next();
  };
}