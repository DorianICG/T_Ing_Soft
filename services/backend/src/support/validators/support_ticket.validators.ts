import Joi from 'joi';

/**
* HELPER PARA VALIDAR ARCHIVOS
*/
const attachmentValidator = Joi.string()
  .max(255)
  .optional()
  .allow('')
  .messages({
    'string.max': 'El nombre del archivo no puede exceder 255 caracteres'
  });

/**
* HELPER PARA TRACKING NUMBER
*/
const trackingNumberValidator = Joi.string()
  .pattern(/^TKT-\d+(-\d+)?$/)
  .required()
  .messages({
    'string.pattern.base': 'El número de seguimiento debe tener formato TKT-xxxxx',
    'any.required': 'El número de seguimiento es obligatorio'
  });

/**
* Schema para crear ticket
* POST /api/support/tickets
*/
export const createTicketSchema = {
  body: Joi.object({
    description: Joi.string()
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
* Schema para responder ticket (ADMIN)
* PUT /api/support/tickets/:id/respond
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
* GET /api/support/tickets/:id
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
* Schema para buscar por número de seguimiento
* GET /api/support/tickets/track/:trackingNumber
*/
export const getTicketByTrackingSchema = {
  params: Joi.object({
    trackingNumber: trackingNumberValidator
  })
};

/**
* Schema para obtener tickets del usuario
* GET /api/support/tickets/my-tickets
*/
export const getUserTicketsSchema = {
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
* Schema para obtener todos los tickets (ADMIN)
* GET /api/support/tickets
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
* Schema para actualizar estado de ticket (ADMIN)
* PATCH /api/support/tickets/:id/status
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
* GET /api/support/tickets/stats
*/
export const getTicketStatsSchema = {
  query: Joi.object({
    period: Joi.string()
      .valid('TODAY', 'WEEK', 'MONTH', 'YEAR')
      .default('MONTH')
      .optional()
      .messages({
        'any.only': 'El período debe ser TODAY, WEEK, MONTH o YEAR'
      }),
    
    groupBy: Joi.string()
      .valid('DAY', 'WEEK', 'MONTH')
      .default('DAY')
      .optional()
      .messages({
        'any.only': 'El agrupamiento debe ser DAY, WEEK o MONTH'
      })
  })
};

/**
* Schema para buscar tickets avanzada (ADMIN)
* POST /api/support/tickets/search
*/
export const searchTicketsSchema = {
  body: Joi.object({
    // Filtros de búsqueda
    status: Joi.array()
      .items(Joi.string().valid('open', 'in progress', 'closed'))
      .optional()
      .messages({
        'array.includes': 'Los estados deben ser: open, in progress o closed'
      }),
    
    userId: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'El ID del usuario debe ser un número',
        'number.integer': 'El ID del usuario debe ser un número entero',
        'number.positive': 'El ID del usuario debe ser positivo'
      }),
    
    searchText: Joi.string()
      .min(3)
      .max(200)
      .optional()
      .messages({
        'string.min': 'El texto de búsqueda debe tener al menos 3 caracteres',
        'string.max': 'El texto de búsqueda no puede exceder 200 caracteres'
      }),
    
    // Filtros de fecha
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'La fecha de inicio debe estar en formato ISO (YYYY-MM-DD)'
      }),
    
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.format': 'La fecha de fin debe estar en formato ISO (YYYY-MM-DD)',
        'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio'
      }),
    
    // Paginación
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .optional(),
    
    offset: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .optional()
  })
};

/**
* Schema para eliminar ticket (ADMIN)
* DELETE /api/support/tickets/:id
*/
export const deleteTicketSchema = {
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
* Schema para reabrir ticket (ADMIN)
* POST /api/support/tickets/:id/reopen
*/
export const reopenTicketSchema = {
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
    reason: Joi.string()
      .min(5)
      .max(500)
      .optional()
      .messages({
        'string.min': 'La razón debe tener al menos 5 caracteres',
        'string.max': 'La razón no puede exceder 500 caracteres'
      })
  })
};