import Joi from 'joi';

/**
* HELPER PARA VALIDAR RUT
*/
const rutValidator = Joi.string()
  .trim()
  .pattern(/^\d{1,2}\.?\d{3}\.?\d{3}-?[0-9kK]$/)
  .required()
  .messages({
    'string.base': 'El RUT debe ser un texto',
    'string.empty': 'El RUT no puede estar vacío',
    'string.pattern.base': 'El RUT debe tener un formato válido (ej: 12345678-9)',
    'any.required': 'El RUT es obligatorio'
  });

/**
* HELPER PARA VALIDAR ARCHIVOS
*/
const attachmentValidator = Joi.string()
  .uri()
  .allow('')
  .optional()
  .messages({
    'string.uri': 'El attachment debe ser una URL válida'
  });

/**
* HELPER PARA TRACKING NUMBER
*/
const trackingNumberValidator = Joi.string()
  .pattern(/^TKT-\d+-\d+$/)
  .required()
  .messages({
    'string.pattern.base': 'El número de seguimiento debe tener formato TKT-YYYY-XXXXX',
    'any.required': 'El número de seguimiento es obligatorio'
  });

/**
* Schema para crear ticket
* POST /api/support/ticket
*/
export const createTicketSchema = {
  body: Joi.object({
    rut: rutValidator,
    
    description: Joi.string()
      .trim()
      .min(10)
      .max(2000)
      .required()
      .messages({
        'string.min': 'La descripción debe tener al menos 10 caracteres',
        'string.max': 'La descripción no puede exceder 2000 caracteres',
        'any.required': 'La descripción es obligatoria',
        'string.empty': 'La descripción no puede estar vacía'
      }),
    
    attachment: attachmentValidator
  })
};

/**
* Schema para obtener tickets por RUT
* GET /api/support/ticket/rut/:rut
*/
export const getTicketsByRutSchema = {
  params: Joi.object({
    rut: rutValidator
  }),
  
  query: Joi.object({
    status: Joi.string()
      .valid('open', 'in progress', 'closed')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: open, in progress o closed'
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .optional()
      .messages({
        'number.min': 'El límite debe ser al menos 1',
        'number.max': 'El límite no puede exceder 100'
      }),
    
    offset: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .optional()
      .messages({
        'number.min': 'El offset debe ser 0 o mayor'
      })
  })
};

/**
* Schema para buscar por número de seguimiento
* GET /api/support/ticket/track/:trackingNumber
*/
export const getTicketByTrackingSchema = {
  params: Joi.object({
    trackingNumber: trackingNumberValidator
  })
};

/**
* Schema para obtener todos los tickets (ADMIN)
* GET /api/support/ticket
*/
export const getAllTicketsSchema = {
  query: Joi.object({
    status: Joi.string()
      .valid('open', 'in progress', 'closed')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: open, in progress o closed'
      }),
    
    search: Joi.string()
      .min(3)
      .max(100)
      .optional()
      .messages({
        'string.min': 'La búsqueda debe tener al menos 3 caracteres',
        'string.max': 'La búsqueda no puede exceder 100 caracteres'
      }),
    
    rut: Joi.string()
      .pattern(/^\d{1,2}\.?\d{3}\.?\d{3}-?[0-9kK]$/)
      .optional()
      .messages({
        'string.pattern.base': 'El RUT debe tener un formato válido'
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(200)
      .default(50)
      .optional()
      .messages({
        'number.min': 'El límite debe ser al menos 1',
        'number.max': 'El límite no puede exceder 200'
      }),
    
    offset: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .optional()
      .messages({
        'number.min': 'El offset debe ser 0 o mayor'
      })
  })
};

/**
* Schema para responder ticket (ADMIN)
* PUT /api/support/ticket/:id/respond
*/
export const respondTicketSchema = {
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'El ID del ticket debe ser un número',
        'number.integer': 'El ID del ticket debe ser un número entero',
        'number.positive': 'El ID del ticket debe ser positivo',
        'any.required': 'El ID del ticket es obligatorio'
      })
  }),
  
  body: Joi.object({
    admin_response: Joi.string()
      .trim()
      .min(5)
      .max(2000)
      .required()
      .messages({
        'string.min': 'La respuesta debe tener al menos 5 caracteres',
        'string.max': 'La respuesta no puede exceder 2000 caracteres',
        'any.required': 'La respuesta del administrador es obligatoria',
        'string.empty': 'La respuesta no puede estar vacía'
      })
  })
};

/**
* Schema para obtener ticket por ID
* GET /api/support/ticket/:id
*/
export const getTicketByIdSchema = {
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'El ID del ticket debe ser un número',
        'number.integer': 'El ID del ticket debe ser un número entero',
        'number.positive': 'El ID del ticket debe ser positivo',
        'any.required': 'El ID del ticket es obligatorio'
      })
  })
};

/**
* Schema para actualizar estado de ticket (ADMIN)
* PATCH /api/support/ticket/:id/status
*/
export const updateTicketStatusSchema = {
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'El ID del ticket debe ser un número',
        'number.integer': 'El ID del ticket debe ser un número entero',
        'number.positive': 'El ID del ticket debe ser positivo',
        'any.required': 'El ID del ticket es obligatorio'
      })
  }),
  
  body: Joi.object({
    status: Joi.string()
      .valid('open', 'in progress', 'closed')
      .required()
      .messages({
        'any.only': 'El estado debe ser: open, in progress o closed',
        'any.required': 'El estado es obligatorio'
      })
  })
};

/**
* Schema para estadísticas de tickets (ADMIN)
* GET /api/support/ticket/stats
*/
export const getTicketStatsSchema = {
  query: Joi.object({
    period: Joi.string()
      .valid('TODAY', 'WEEK', 'MONTH', 'YEAR')
      .default('MONTH')
      .optional()
      .messages({
        'any.only': 'El período debe ser TODAY, WEEK, MONTH o YEAR'
      })
  })
};