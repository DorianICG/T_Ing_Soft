import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

interface SchemaParts {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

const validate = (schemaParts: SchemaParts | Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => { 
    
    let schemaToValidate: SchemaParts;

    if (Joi.isSchema(schemaParts)) {
      const schemaDesc = (schemaParts as any).describe();
      
      const hasStructuredKeys = schemaDesc.keys && (
        schemaDesc.keys.body || 
        schemaDesc.keys.params || 
        schemaDesc.keys.query
      );
      
      if (hasStructuredKeys) {
        
        const { error } = (schemaParts as Joi.ObjectSchema).validate({
          body: req.body,
          params: req.params,
          query: req.query
        }, { 
          abortEarly: false, 
          allowUnknown: true, 
          stripUnknown: false 
        });
        
        if (error) {
          const errors = error.details.map((detail) => ({
            message: detail.message.replace(/['"]/g, ''),
            field: detail.path.join('.'),
            location: detail.path[0] as 'body' | 'query' | 'params',
          }));
          res.status(400).json({ errors });
          return;
        }
        
        next();
        return;
        
      } else {
        schemaToValidate = { body: schemaParts as Joi.ObjectSchema };
      }
    } else {
      schemaToValidate = schemaParts;
    }

    let allErrors: { message: string; field: string; location: 'body' | 'query' | 'params' }[] = [];

    if (schemaToValidate.body) {
      const { error: bodyError } = schemaToValidate.body.validate(req.body, { 
        abortEarly: false, 
        allowUnknown: true, 
        stripUnknown: false 
      });
      
      if (bodyError) {
        const bodyErrors = bodyError.details.map((detail) => ({
          message: detail.message.replace(/['"]/g, ''),
          field: detail.path.join('.') || detail.context?.key || 'unknown', 
          location: 'body' as const,
        }));
        allErrors = allErrors.concat(bodyErrors);
      }
    }

    if (schemaToValidate.query) {
      const { error: queryError } = schemaToValidate.query.validate(req.query, { 
        abortEarly: false, 
        allowUnknown: true, 
        stripUnknown: false 
      });
      if (queryError) {
        const queryErrors = queryError.details.map((detail) => ({
            message: detail.message.replace(/['"]/g, ''),
            field: detail.path.join('.') || detail.context?.key || 'unknown',
            location: 'query' as const,
        }));
        allErrors = allErrors.concat(queryErrors);
      }
    }

    if (schemaToValidate.params) {
      const { error: paramsError } = schemaToValidate.params.validate(req.params, { 
        abortEarly: false, 
        allowUnknown: true, 
        stripUnknown: false 
      });
      if (paramsError) {
        const paramsErrors = paramsError.details.map((detail) => ({
            message: detail.message.replace(/['"]/g, ''),
            field: detail.path.join('.') || detail.context?.key || 'unknown', 
            location: 'params' as const,
        }));
        allErrors = allErrors.concat(paramsErrors);
      }
    }

    if (allErrors.length > 0) {
        res.status(400).json({ errors: allErrors });
        return;
    } else {
        next();
    }
  };
};

export default validate;