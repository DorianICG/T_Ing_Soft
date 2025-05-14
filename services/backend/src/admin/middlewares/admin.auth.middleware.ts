import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config/env'; 
import { User, Role } from '../../models'; 



interface AuthenticatedRequest extends Request {
  user?: User; 
}

export const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET as string) as JwtPayload;

    if (!decoded || typeof decoded.id !== 'number') {
        return res.status(401).json({ error: 'Token inválido.' });
    }

    const user = await User.findByPk(decoded.id, {
        include: [{ model: Role, as: 'role' }]
    });

    if (!user || !user.role || user.role.name !== 'Administrador' || !user.isActive) {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error de autenticación de administrador:', error);
    if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expirado.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Token inválido.' });
    }
    return res.status(401).json({ error: 'Acceso no autorizado.' });
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
      const { error, value } = schemaSource.query.validate(req.query, { ...options, stripUnknown: false }); // stripUnknown: false para query
      if (error) {
        errors = errors.concat(error.details);
      } else {
        (req as any).validatedQuery = value; 
      }
    }

    if (schemaSource.query) {
      const { error, value } = schemaSource.query.validate(req.query, { ...options, stripUnknown: false }); // stripUnknown: false para query
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