import Joi from 'joi';

/**
 * Schema para obtener información de QR
 * GET /api/withdrawals/inspector/qr/:qrCode/info
 */
export const getQrInfoSchema = {
  params: Joi.object({
    qrCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': 'El código QR debe tener exactamente 6 dígitos',
        'any.required': 'El código QR es obligatorio'
      })
  })
};

/**
 * Schema para procesar decisión de QR
 * POST /api/withdrawals/inspector/qr/process
 */
export const processQrSchema = {
  body: Joi.object({
    qrCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': 'El código QR debe tener exactamente 6 dígitos',
        'any.required': 'El código QR es obligatorio'
      }),
    
    action: Joi.string()
      .valid('APPROVE', 'DENY')
      .required()
      .messages({
        'any.only': 'La acción debe ser APPROVE o DENY',
        'any.required': 'La acción es obligatoria'
      }),
    
    notes: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Las notas no pueden exceder 1000 caracteres'
      })
  })
};

/**
 * Schema para retiro manual
 * POST /api/withdrawals/inspector/manual
 */
export const manualWithdrawalSchema = {
  body: Joi.object({
    studentRut: Joi.string()
      .pattern(/^\d{7,8}-[\dkK]$/)
      .required()
      .messages({
        'string.pattern.base': 'El RUT del estudiante debe tener formato válido (12345678-9)',
        'any.required': 'El RUT del estudiante es obligatorio'
      }),
    
    parentRut: Joi.string()
      .pattern(/^\d{7,8}-[\dkK]$/)
      .required()
      .messages({
        'string.pattern.base': 'El RUT del apoderado debe tener formato válido (12345678-9)',
        'any.required': 'El RUT del apoderado es obligatorio'
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
      }),
    
    notes: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Las notas no pueden exceder 1000 caracteres'
      })
  })
};

/**
 * Schema para obtener historial
 * GET /api/withdrawals/inspector/history
 */
export const getHistorySchema = {
  query: Joi.object({
    studentId: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'El ID del estudiante debe ser un número',
        'number.integer': 'El ID del estudiante debe ser un número entero',
        'number.positive': 'El ID del estudiante debe ser positivo'
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
 * Schema para buscar estudiante por RUT
 * GET /api/withdrawals/inspector/student/:rut
 */
export const searchStudentSchema = {
  params: Joi.object({
    rut: Joi.string()
      .pattern(/^\d{7,8}-[\dkK]$/)
      .required()
      .messages({
        'string.pattern.base': 'El RUT debe tener formato válido (12345678-9)',
        'any.required': 'El RUT es obligatorio'
      })
  })
};