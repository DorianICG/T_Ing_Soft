import Joi from 'joi';
import { validarRut, formatearRut } from '../../utils/rutValidator';

// --- BASE SCHEMAS ---

const rutBaseSchema = (fieldName: string = 'RUT') => Joi.string()
  .trim()
  .required()
  .custom((value, helpers) => {
    
    if (!value || value === undefined || value === null) {
      return helpers.error('string.empty');
    }

    const rutString = String(value).trim();
    
    if (rutString === '') {
      return helpers.error('string.empty');
    }

    if (!validarRut(rutString)) {
      return helpers.error('any.invalid', { 
        message: `El ${fieldName} '${rutString}' no es válido (dígito verificador incorrecto o formato inválido).` 
      });
    }
    
    const rutFormateado = formatearRut(rutString);
    if (!rutFormateado || rutFormateado === '') {
      return helpers.error('any.invalid', { 
        message: `Error al formatear el ${fieldName} '${rutString}'.` 
      });
    }
    
    return rutFormateado; 
  })
  .messages({ 
    'string.empty': `El ${fieldName} es requerido.`,
    'any.required': `El ${fieldName} es requerido.`,
    'string.base': `El ${fieldName} debe ser una cadena de texto.`,
    'any.invalid': `El ${fieldName} no tiene el formato válido.`
  });

const rutSchema = rutBaseSchema('RUT')
  .required();

const studentRutSchema = rutBaseSchema('RUT del alumno')
  .required();

const strongPasswordSchema = Joi.string()
  .min(8)
  .max(16)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/ )
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

const nameSchema = (fieldName: string, maxLength: number = 50) => Joi.string()
  .trim()
  .min(2)
  .max(maxLength)
  .required()
  .messages({
    'string.min': `El ${fieldName} debe tener al menos 2 caracteres`,
    'string.max': `El ${fieldName} no puede exceder los ${maxLength} caracteres`,
    'string.empty': `El ${fieldName} es requerido`,
    'any.required': `El ${fieldName} es requerido`,
  });

const validUserRoles = ['PARENT', 'INSPECTOR'];

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

// --- SCHEMAS DE FECHAS ---

const birthDateSchemaOptional = Joi.date()
  .iso()
  .allow(null, '')
  .optional()
  .messages({
    'date.base': 'La fecha de nacimiento debe ser una fecha válida si se proporciona.',
    'date.format': 'La fecha de nacimiento debe estar en formato YYYY-MM-DD si se proporciona.',
  });

const birthDateStringSchema = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .allow(null, '')
  .optional()
  .messages({
    'string.pattern.base': 'La fecha de nacimiento debe estar en formato YYYY-MM-DD.',
  });

const parentRutSchemaOptional = Joi.string()
  .trim()
  .allow(null, '') 
  .optional()
  .custom((value, helpers) => {
    if (!value || value.trim() === '') {
      return value; 
    }
    if (!validarRut(value)) { 
      return helpers.error('any.invalid', { message: `El RUT del padre/tutor no es válido o no tiene el formato correcto.` });
    }
    const rutFormateado = formatearRut(value);
    if (!rutFormateado || !rutFormateado.includes('-')) {
        return helpers.error('any.invalid', { message: `Error interno al formatear el RUT del padre/tutor después de la validación.` });
    }
    return rutFormateado;
  })
  .messages({
    'any.invalid': `El RUT del padre/tutor no es válido o no tiene el formato correcto si se proporciona.`
  });

// --- USER SCHEMAS ---

export const createUserSchema = Joi.object({
  firstName: nameSchema('nombre', 50),       
  lastName: nameSchema('apellido', 50),      
  rut: rutSchema,            
  email: emailSchema,
  phone: phoneSchema,
  password: strongPasswordSchema.optional(),
  roleName: Joi.string()
    .valid(...validUserRoles)
    .trim()
    .uppercase()
    .required()
    .messages({
      'any.only': `El rol debe ser uno de: ${validUserRoles.join(', ')}`,
      'string.empty': 'El rol es requerido',
      'any.required': 'El rol es requerido',
    }),
  isActive: Joi.boolean().optional().default(true),
  organizationId: Joi.number().integer().positive().optional()
});

export const updateUserSchema = Joi.object({
  firstName: nameSchema('nombre', 50).optional(),
  lastName: nameSchema('apellido', 50).optional(),
  email: emailSchema,
  phone: phoneSchema,
  roleName: Joi.string()
    .valid(...validUserRoles)
    .trim()
    .uppercase()
    .optional()
    .messages({
      'any.only': `El rol debe ser uno de: ${validUserRoles.join(', ')}`,
    }),
  isActive: Joi.boolean().optional(),
  organizationId: Joi.number().integer().positive().optional()
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar.'
});

export const changeUserPasswordSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: Joi.object({
    newPassword: strongPasswordSchema.required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'La confirmación debe coincidir con la nueva contraseña.'
      })
  })
});

// --- STUDENT SCHEMAS ---

export const createStudentSchema = Joi.object({
  rut: studentRutSchema,
  firstName: nameSchema('nombre del estudiante', 50),
  lastName: nameSchema('apellido del estudiante', 50),
  birthDate: birthDateSchemaOptional,
  courseId: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del curso debe ser un número.',
    'number.positive': 'El ID del curso debe ser un número entero positivo.',
    'any.required': 'El ID del curso es obligatorio.',
  }),
  parentRut: parentRutSchemaOptional,
  organizationId: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID de Organización debe ser un número.',
    'number.positive': 'ID de Organización debe ser un número positivo.',
  }),
});

export const updateStudentSchema = Joi.object({
  firstName: nameSchema('nombre', 50).optional(),
  lastName: nameSchema('apellidos', 50).optional(),
  birthDate: birthDateStringSchema, 
  courseId: Joi.number().integer().positive().optional().messages({
    'number.base': 'El ID del curso debe ser un número.',
    'number.positive': 'El ID del curso debe ser un número positivo.'
  }),
  parentRut: parentRutSchemaOptional
}).min(1);

// --- COURSE SCHEMAS ---

export const createCourseSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.base': 'El nombre del curso debe ser una cadena de texto.',
    'string.empty': 'El nombre del curso es requerido.',
    'string.min': 'El nombre del curso debe tener al menos {#limit} caracteres.',
    'string.max': 'El nombre del curso no debe exceder los {#limit} caracteres.',
    'any.required': 'El nombre del curso es requerido.'
  })
});

export const updateCourseSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.base': 'El nombre del curso debe ser una cadena de texto.',
    'string.min': 'El nombre del curso debe tener al menos {#limit} caracteres.',
    'string.max': 'El nombre del curso no debe exceder los {#limit} caracteres.'
  })
}).min(1);

// --- SCHEMAS PARA PARÁMETROS ---

export const getByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID debe ser un número.',
      'number.integer': 'El ID debe ser un número entero.',
      'number.positive': 'El ID debe ser un número positivo.',
      'any.required': 'El ID es requerido.'
    })
  })
});

export const getUserSchema = getByIdSchema;
export const getStudentSchema = getByIdSchema;
export const getCourseSchema = getByIdSchema;
export const deleteUserSchema = getByIdSchema;
export const deleteStudentSchema = getByIdSchema;
export const deleteCourseSchema = getByIdSchema;

// --- SCHEMAS DE QUERY PARA LISTADOS ---

export const getUsersSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(20),
    search: Joi.string().optional().allow(''),
    role: Joi.string().valid(...validUserRoles).optional(),
    organizationId: Joi.number().integer().positive().optional(),
    isActive: Joi.boolean().optional()
  })
});

export const getStudentsSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(20),
    search: Joi.string().optional().allow(''),
    courseId: Joi.number().integer().positive().optional(),
    organizationId: Joi.number().integer().positive().optional(),
    hasParent: Joi.boolean().optional()
  })
});

export const getCoursesSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(20),
    search: Joi.string().optional().allow(''),
    organizationId: Joi.number().integer().positive().optional()
  })
});

// --- SCHEMAS PARA CARGA MASIVA ---

export const bulkUsersSchema = Joi.object({
  body: Joi.object({
    organizationId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID de organización debe ser un número.',
      'number.positive': 'El ID de organización debe ser un número positivo.'
    })
  }).optional().allow({}),
}).unknown(true);

export const bulkStudentsSchema = Joi.object({
  body: Joi.object({
    organizationId: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID de organización debe ser un número.',
      'number.positive': 'El ID de organización debe ser un número positivo.'
    })
  }).optional().allow({}),
}).unknown(true); 

export const bulkCoursesSchema = Joi.object({
  body: Joi.object({}).optional().allow({}),
}).unknown(true);

// --- SCHEMAS PARA TOGGLE STATUS ---

export const toggleUserStatusSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: Joi.object({
    isActive: Joi.boolean().required().messages({
      'boolean.base': 'El estado activo debe ser un valor booleano.',
      'any.required': 'El estado activo es requerido.'
    })
  })
});

// --- SCHEMAS CON ESTRUCTURA COMPLETA BODY/PARAMS ---
export const createUserSchemaWithBody = Joi.object({
  body: createUserSchema
});

export const updateUserSchemaWithParams = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: updateUserSchema
});

export const createStudentSchemaWithBody = Joi.object({
  body: createStudentSchema
});

export const updateStudentSchemaWithParams = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: updateStudentSchema
});

export const createCourseSchemaWithBody = Joi.object({
  body: createCourseSchema
});

export const updateCourseSchemaWithParams = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: updateCourseSchema
});


// --- SCHEMA GENERAL PARA QUERY ---

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional().default('ASC'),
  roleName: Joi.string().valid(...validUserRoles).optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().optional().allow(''),
});