import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

interface SchemaParts {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

const validate = (schemaParts: SchemaParts | Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => { // Esta función interna debe devolver void
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

    // Validar body
    if (schemaToValidate.body) {
      const { error: bodyError } = schemaToValidate.body.validate(req.body, options);
      if (bodyError) {
        const errorMessage = bodyError.details.map((details) => details.message).join(', ');
        // ---> NO uses 'return' aquí <---
        res.status(400).json({ error: `Error de Validación (body): ${errorMessage}` });
        return; // Puedes usar un return vacío para salir de la función si lo deseas
      }
    }

    // Validar query
    if (schemaToValidate.query) {
      const { error: queryError } = schemaToValidate.query.validate(req.query, options);
      if (queryError) {
        const errorMessage = queryError.details.map((details) => details.message).join(', ');
         // ---> NO uses 'return' aquí <---
        res.status(400).json({ error: `Error de Validación (query): ${errorMessage}` });
        return; // Salir de la función
      }
    }

    // Validar params
    if (schemaToValidate.params) {
      const { error: paramsError } = schemaToValidate.params.validate(req.params, options);
      if (paramsError) {
        const errorMessage = paramsError.details.map((details) => details.message).join(', ');
         // ---> NO uses 'return' aquí <---
        res.status(400).json({ error: `Error de Validación (params): ${errorMessage}` });
        return; // Salir de la función
      }
    }

    next(); // Validación exitosa
  };
};

export default validate;