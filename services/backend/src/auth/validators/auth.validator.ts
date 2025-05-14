import Joi from 'joi';

const emailSchema = Joi.string()
  .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'cl', 'org'] } }) 
  .required()
  .messages({
    'string.email': 'El correo electrónico debe tener un formato válido (ej. usuario@dominio.com)',
    'string.empty': 'El correo electrónico es requerido',
    'any.required': 'El correo electrónico es requerido',
  });

const passwordSchema = Joi.string()
  .min(8)
  .max(16)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/)
  .required()
  .messages({
    'string.pattern.base': 'La contraseña debe tener entre 8-16 caracteres, incluir mayúscula, minúscula, número y símbolo (@$!%*?&)',
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.max': 'La contraseña no puede exceder los 16 caracteres',
    'string.empty': 'La contraseña es requerida',
    'any.required': 'La contraseña es requerida',
  });

const loginPasswordSchema = Joi.string()
  .required()
  .messages({
    'string.empty': 'La contraseña es requerida',
    'any.required': 'La contraseña es requerida',
  });

const tokenSchema = Joi.string()
  .required()
  .messages({
    'string.empty': 'El token es requerido',
    'any.required': 'El token es requerido',
  });

const mfaCodeSchema = Joi.string()
  .length(6)
  .pattern(/^[0-9]+$/)
  .required()
  .messages({
    'string.length': 'El código MFA debe tener 6 dígitos',
    'string.pattern.base': 'El código MFA debe contener solo números',
    'string.empty': 'El código MFA es requerido',
    'any.required': 'El código MFA es requerido',
  });

const firstNameSchema = Joi.string()
  .min(2)
  .max(50)
  .required()
  .messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder los 50 caracteres',
    'string.empty': 'El nombre es requerido',
    'any.required': 'El nombre es requerido',
  });

const lastNameSchema = Joi.string()
  .min(2)
  .max(505) 
  .required()
  .messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede exceder los 50 caracteres',
    'string.empty': 'El apellido es requerido',
    'any.required': 'El apellido es requerido',
  });

const phoneSchema = Joi.string()
  .pattern(/^(?:\+?56)?(9\d{8})$/)
  .required()
  .messages({
    'string.pattern.base': 'El teléfono debe tener 9 dígitos (ej. 912345678) u opcionalmente +569...',
    'string.empty': 'El teléfono es requerido',
    'any.required': 'El teléfono es requerido',
  });

const rutSchema = Joi.string()
  .pattern(/^\d{7,8}-[\dkK]$/)
  .required()
  .messages({
    'string.pattern.base': 'El RUT debe tener el formato 12345678-9 o 1234567-k',
    'string.empty': 'El RUT es requerido',
    'any.required': 'El RUT es requerido',
  });


export const loginSchema = Joi.object({
  rut: rutSchema,
  password: loginPasswordSchema,
  captchaToken: Joi.string().optional(),
});

export const verifyMfaSchema = Joi.object({
  email: emailSchema,
  code: mfaCodeSchema,
});

export const forgotPasswordSchema = Joi.object({
  email: emailSchema,
});

export const requestUnlockSchema = Joi.object({
  email: emailSchema,
});

export const resetPasswordSchema = Joi.object({
  token: tokenSchema,
  newPassword: passwordSchema,
});

export const forceChangePasswordSchema = Joi.object({
  newPassword: passwordSchema,
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('newPassword'))
    .messages({
      'any.only': 'Las contraseñas no coinciden.',
      'string.empty': 'La confirmación de contraseña es requerida.',
      'any.required': 'La confirmación de contraseña es requerida.',
    }),
});

export const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema, 
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  phone: phoneSchema,
  rut: rutSchema, 
  // roleId: Joi.number().integer().required(), // Ejemplo si necesitas rol
});

export const updateProfileSchema = Joi.object({
    firstName: firstNameSchema.optional(), 
    lastName: lastNameSchema.optional(),
    phone: phoneSchema.optional(),
}).min(1);

export const findUserByRutSchema = Joi.object({
  rut: rutSchema,
});