import Joi from 'joi';

/**
 * Schema para generar código QR
 * POST /api/withdrawals/parent/generate-qr
 */
export const generateQrSchema = {
  body: Joi.object({
    studentId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'El ID del estudiante debe ser un número',
        'number.integer': 'El ID del estudiante debe ser un número entero',
        'number.positive': 'El ID del estudiante debe ser positivo',
        'any.required': 'El ID del estudiante es obligatorio'
      }),
    
    reasonId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'El ID del motivo debe ser un número',
        'number.integer': 'El ID del motivo debe ser un número entero',
        'number.positive': 'El ID del motivo debe ser positivo',
        'any.required': 'El motivo de retiro es obligatorio'
      }),
    
    customReason: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'El motivo personalizado no puede exceder 500 caracteres'
      })
  })
};

/**
 * Schema para obtener historial completo con más filtros
 * GET /api/withdrawals/parent/history
 */
export const getHistorySchema = {
  query: Joi.object({
    // Filtro por estudiante específico
    studentId: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'El ID del estudiante debe ser un número',
        'number.integer': 'El ID del estudiante debe ser un número entero',
        'number.positive': 'El ID del estudiante debe ser positivo'
      }),
    
    // Filtro por estado del retiro
    status: Joi.string()
      .valid('APPROVED', 'DENIED', 'ACTIVE', 'EXPIRED')
      .optional()
      .messages({
        'any.only': 'El estado debe ser APPROVED, DENIED, ACTIVE o EXPIRED'
      }),
    
    // Filtro por método de retiro
    method: Joi.string()
      .valid('QR', 'MANUAL')
      .optional()
      .messages({
        'any.only': 'El método debe ser QR o MANUAL'
      }),
    
    // Filtro por fecha de inicio
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'La fecha de inicio debe estar en formato ISO (YYYY-MM-DD)'
      }),
    
    // Filtro por fecha de fin
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.format': 'La fecha de fin debe estar en formato ISO (YYYY-MM-DD)',
        'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio'
      }),
    
    // ✅ NUEVO: Incluir QRs pendientes/activos
    includePending: Joi.boolean()
      .default(true)
      .optional()
      .messages({
        'boolean.base': 'includePending debe ser true o false'
      }),
    
    // Paginación - límite de resultados
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
    
    // Paginación - offset
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
 * Schema para obtener QRs activos del apoderado
 * GET /api/withdrawals/parent/active-qrs
 */
export const getActiveQrsSchema = {
  query: Joi.object({
    includeExpired: Joi.boolean()
      .default(false)
      .optional()
      .messages({
        'boolean.base': 'includeExpired debe ser true o false'
      }),
    
    studentId: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'El ID del estudiante debe ser un número',
        'number.integer': 'El ID del estudiante debe ser un número entero',
        'number.positive': 'El ID del estudiante debe ser positivo'
      })
  })
};

/**
 * Schema para reenviar QR activo
 * POST /api/withdrawals/parent/students/:studentId/resend-qr
 */
export const resendQrSchema = {
  params: Joi.object({
    studentId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'El ID del estudiante debe ser un número',
        'number.integer': 'El ID del estudiante debe ser un número entero',
        'number.positive': 'El ID del estudiante debe ser positivo',
        'any.required': 'El ID del estudiante es obligatorio'
      })
  })
};

/**
 * Schema para obtener historial de estudiante específico
 * GET /api/withdrawals/parent/students/:studentId/history
 */
export const getStudentHistorySchema = {
  params: Joi.object({
    studentId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'El ID del estudiante debe ser un número',
        'number.integer': 'El ID del estudiante debe ser un número entero',
        'number.positive': 'El ID del estudiante debe ser positivo',
        'any.required': 'El ID del estudiante es obligatorio'
      })
  }),
  
  query: Joi.object({
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10)
      .optional(),
    
    offset: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .optional()
  })
};

/**
 * Schema para estadísticas del apoderado
 * GET /api/withdrawals/parent/stats
 */
export const getStatsSchema = {
  query: Joi.object({
    period: Joi.string()
      .valid('WEEK', 'MONTH', 'QUARTER', 'YEAR')
      .default('MONTH')
      .optional()
      .messages({
        'any.only': 'El período debe ser WEEK, MONTH, QUARTER o YEAR'
      }),
    
    includeStudentBreakdown: Joi.boolean()
      .default(true)
      .optional()
      .messages({
        'boolean.base': 'includeStudentBreakdown debe ser true o false'
      })
  })
};

/**
 * Schema para cancelar QR activo
 * DELETE /api/withdrawals/parent/qr/:code/cancel
 */
export const cancelQrSchema = {
  params: Joi.object({
    identifier: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': 'El código QR debe tener exactamente 6 dígitos',
        'any.required': 'Código QR requerido'
      })
  })
};