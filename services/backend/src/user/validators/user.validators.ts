import Joi from 'joi';

// Usar los mismos schemas que admin para consistencia
const strongPasswordSchema = Joi.string()
  .min(8)
  .max(16)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/)
  .messages({
    'string.pattern.base': 'La contraseña debe tener entre 8-16 caracteres, incluir mayúscula, minúscula, número y símbolo (@$!%*?&)',
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.max': 'La contraseña no puede exceder los 16 caracteres',
    'string.empty': 'La contraseña es requerida',
    'any.required': 'La contraseña es requerida',
  });

const emailSchema = Joi.string()
  .email({ minDomainSegments: 2, tlds: { allow: true } })
  .allow(null, '', 'NO TIENE')
  .optional()
  .messages({
    'string.email': 'El correo electrónico debe tener un formato válido (ej. usuario@dominio.com)',
  });

const phoneSchema = Joi.string()
  .pattern(/^(?:\+?56)?(9\d{8})$/)
  .allow(null, '', 'NO TIENE') 
  .optional()
  .messages({
    'string.pattern.base': 'El teléfono debe tener 9 dígitos (ej. 912345678) u opcionalmente +569...',
  });

// Validador para actualizar perfil 
export const updateProfileSchema = Joi.object({
  body: Joi.object({
    email: emailSchema,
    phone: phoneSchema
  }).min(1).messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar.'
  })
});

// Validador para cambiar contraseña
export const changePasswordSchema = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'string.empty': 'La contraseña actual es requerida.',
        'any.required': 'La contraseña actual es requerida.'
      }),
    newPassword: strongPasswordSchema
      .required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'La confirmación de contraseña debe coincidir con la nueva contraseña.',
        'string.empty': 'La confirmación de contraseña es requerida.',
        'any.required': 'La confirmación de contraseña es requerida.'
      })
  })
});