import Joi from 'joi';

// Esquema de validación para login
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'cl'] } })
    .required()
    .messages({
      'string.email': 'El correo electrónico debe ser válido',
      'string.empty': 'El correo electrónico es requerido',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial', // Remove or comment out
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.max': 'La contraseña no puede exceder los 16 caracteres', 
      'string.empty': 'La contraseña es requerida',
    }),
});

// Esquema de validación para registro de usuario (Keep complexity rules here)
export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'cl'] } })
    .required()
    .messages({
      'string.email': 'El correo electrónico debe ser válido',
      'string.empty': 'El correo electrónico es requerido',
      }),
    password: Joi.string()
    .min(8)
    .max(16)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'))
    .required()
    .messages({
      'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.max': 'La contraseña no puede exceder los 16 caracteres',
      'string.empty': 'La contraseña es requerida',
    }),
    firstName: Joi.string()
    .min(2)
    .max(25)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder los 25 caracteres',
      'string.empty': 'El nombre es requerido',
    }),
    lastName: Joi.string()
    .min(2)
    .max(25)
    .required()
    .messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder los 25 caracteres',
      'string.empty': 'El apellido es requerido',
    }),
    phone: Joi.string()
    .pattern(/^[0-9]{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'El teléfono debe tener 9 dígitos',
      'string.empty': 'El teléfono es requerido',
    })
});