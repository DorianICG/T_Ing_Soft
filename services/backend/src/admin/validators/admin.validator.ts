import Joi from 'joi';
import { validarRut, formatearRut} from '../../utils/rutValidator';


const rutBaseSchema = (fieldName: string = 'RUT') => Joi.string()
  .trim()
  .custom((value, helpers) => {
    if (!validarRut(value)) {
      return helpers.error('any.invalid', { message: `El ${fieldName} no es válido o no tiene el formato correcto.` });
    }
    return formatearRut(value);
  })
  .messages({
    'string.empty': `El ${fieldName} es requerido.`,
    'any.required': `El ${fieldName} es requerido.`,
    'any.invalid': `El ${fieldName} no es válido o no tiene el formato correcto.`
  });

const rutSchema = rutBaseSchema('RUT')
  .required();

const studentRutSchema = rutBaseSchema('RUT del alumno')
  .required();

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
  .allow(null, '', 'NO TIENE') // Allow empty, null, or "NO TIENE"
  .optional()
  .messages({
    'string.email': 'El correo electrónico debe tener un formato válido (ej. usuario@dominio.com)',
  });

const phoneSchema = Joi.string()
  .pattern(/^(?:\+?56)?(9\d{8})$/)
  .allow(null, '', 'NO TIENE') // Allow empty, null, or "NO TIENE"
  .optional()
  .messages({
    'string.pattern.base': 'El teléfono debe tener 9 dígitos (ej. 912345678) u opcionalmente +569...',
  });

const nameSchema = (fieldName: string, maxLength: number = 50) => Joi.string()
  .min(2)
  .max(maxLength)
  .required()
  .messages({
    'string.min': `El ${fieldName} debe tener al menos 2 caracteres`,
    'string.max': `El ${fieldName} no puede exceder los ${maxLength} caracteres`,
    'string.empty': `El ${fieldName} es requerido`,
    'any.required': `El ${fieldName} es requerido`,
  });

const validUserRoles = ['PARENT', 'INSPECTOR', 'ADMIN'];
const roleNameSchema = Joi.string()
  .valid(...validUserRoles)
  .trim()
  .uppercase()
  .required()
  .messages({
    'any.only': `El rol debe ser uno de: ${validUserRoles.join(', ')}`,
    'string.empty': 'El rol es requerido',
    'any.required': 'El rol es requerido',
  });

// --- User Schemas ---

export const createUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': 'El nombre debe ser una cadena de texto.',
    'string.empty': 'El nombre es requerido.',
    'string.min': 'El nombre debe tener al menos {#limit} caracteres.',
    'string.max': 'El nombre no debe exceder los {#limit} caracteres.',
    'any.required': 'El nombre es requerido.'
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': 'El apellido debe ser una cadena de texto.',
    'string.empty': 'El apellido es requerido.',
    'string.min': 'El apellido debe tener al menos {#limit} caracteres.',
    'string.max': 'El apellido no debe exceder los {#limit} caracteres.',
    'any.required': 'El apellido es requerido.'
  }),
  rut: rutSchema,
  email: Joi.string().trim().email({ tlds: { allow: false } }).allow('', null).empty(['', null]).default('NO TIENE').max(100).messages({
    'string.email': 'El email debe tener un formato válido.',
    'string.max': 'El email no debe exceder los {#limit} caracteres.'
  }),
  phone: Joi.string().trim().allow('', null).empty(['', null]).default('NO TIENE').max(15).pattern(/^[0-9+]*$/).messages({
    'string.base': 'El teléfono debe ser una cadena de texto.',
    'string.pattern.base': 'El teléfono solo puede contener números y el símbolo "+".',
    'string.max': 'El teléfono no debe exceder los {#limit} caracteres.'
  }),
  password: Joi.string().min(6).max(100).optional().allow('', null).messages({ 
    'string.base': 'La contraseña debe ser una cadena de texto.',
    'string.min': 'La contraseña debe tener al menos {#limit} caracteres.',
    'string.max': 'La contraseña no debe exceder los {#limit} caracteres.'
  }),
  roleName: Joi.string().trim().uppercase().required().valid(...validUserRoles).messages({ 
    'string.empty': 'El nombre del rol es requerido.',
    'any.only': `El rol debe ser uno de los siguientes: ${validUserRoles.join(', ')}.`,
    'any.required': 'El nombre del rol es requerido.'
  }),
  isActive: Joi.boolean().optional().default(true).messages({
    'boolean.base': 'El estado activo debe ser un valor booleano.'
  })
});

// En updateUserSchema
export const updateUserSchema = Joi.object({
  firstName: nameSchema('nombre').optional(),
  lastName: nameSchema('apellidos').optional(),
  rut: rutBaseSchema('RUT').optional(), 
  email: emailSchema,
  phone: phoneSchema,
  password: strongPasswordSchema.optional(),
  roleName: roleNameSchema.optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

// --- Student Schemas ---

const birthDateSchema = Joi.date()
  .iso() // Expects YYYY-MM-DD
  .required()
  .messages({
    'date.base': 'La fecha de nacimiento debe ser una fecha válida.',
    'date.format': 'La fecha de nacimiento debe estar en formato YYYY-MM-DD.',
    'any.required': 'La fecha de nacimiento es requerida.',
  });

export const createStudentSchema = Joi.object({
  firstName: nameSchema('nombre', 50), 
  lastName: nameSchema('apellidos', 50), 
  rut: studentRutSchema,
  birthDate: birthDateSchema,
  organizationId: Joi.number().integer().positive().required().messages({ 
    'number.base': 'ID de Organización debe ser un número.',
    'number.positive': 'ID de Organización debe ser un número positivo.',
    'any.required': 'ID de Organización es requerido.',
  }),
  parentId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID de Apoderado debe ser un número.',
    'number.positive': 'ID de Apoderado debe ser un número positivo.',
    'any.required': 'ID de Apoderado es requerido.',
  }),
});

export const updateStudentSchema = Joi.object({
  firstName: nameSchema('nombre', 50).optional(),
  lastName: nameSchema('apellidos', 50).optional(),
  rut: rutBaseSchema('RUT del alumno').optional(), 
  birthDate: birthDateSchema.optional(),
  organizationId: Joi.number().integer().positive().optional(),
  parentId: Joi.number().integer().positive().optional(),
}).min(1);

// Schema for query parameters (e.g., for listing users/students)
export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional().default('ASC'),
  roleName: Joi.string().valid(...validUserRoles).optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().optional().allow(''),
});