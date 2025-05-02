import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

interface SchemaParts {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

const validate = (schemaParts: SchemaParts | Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => { 
    let schemaToValidate: SchemaParts;

    if (Joi.isSchema(schemaParts)) {
      schemaToValidate = { body: schemaParts as Joi.ObjectSchema };
    } else {
      schemaToValidate = schemaParts;
    }

    const options: Joi.ValidationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    let allErrors: { message: string; field: string; location: 'body' | 'query' | 'params' }[] = [];

    if (schemaToValidate.body) {
      const { error: bodyError, value: validatedBody } = schemaToValidate.body.validate(req.body, options);
      if (bodyError) {
        const bodyErrors = bodyError.details.map((detail) => ({
          message: detail.message.replace(/['"]/g, ''),
          field: detail.context?.key || 'unknown',
          location: 'body' as const,
        }));
        allErrors = allErrors.concat(bodyErrors);
      } else {
         req.body = validatedBody;
      }
    }

    if (schemaToValidate.query) {
      const { error: queryError, value: validatedQuery } = schemaToValidate.query.validate(req.query, options);
      if (queryError) {
        const queryErrors = queryError.details.map((detail) => ({
            message: detail.message.replace(/['"]/g, ''),
            field: detail.context?.key || 'unknown',
            location: 'query' as const,
        }));
        allErrors = allErrors.concat(queryErrors);
      } else {
         req.query = validatedQuery;
      }
    }

    if (schemaToValidate.params) {
      const { error: paramsError, value: validatedParams } = schemaToValidate.params.validate(req.params, options);
      if (paramsError) {
        const paramsErrors = paramsError.details.map((detail) => ({
            message: detail.message.replace(/['"]/g, ''),
            field: detail.context?.key || 'unknown',
            location: 'params' as const,
        }));
        allErrors = allErrors.concat(paramsErrors);
      } else {
         req.params = validatedParams;
      }
    }

    if (allErrors.length > 0) {
        console.warn('Validation Error:', allErrors);
        res.status(400).json({ errors: allErrors });
    } else {
        next();
    }
  };
};

export default validate;