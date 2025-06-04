import Joi from 'joi';

/**
 * MARCAR COMO VISTO
 */
export const markViewedSchema = Joi.object({
    body: Joi.object({
        tutorialVideoId: Joi.number().integer().min(1).required()
            .messages({
                'number.base': 'El ID del tutorial debe ser un número',
                'number.integer': 'El ID del tutorial debe ser un número entero',
                'number.min': 'El ID del tutorial debe ser mayor a 0',
                'any.required': 'El ID del tutorial es obligatorio'
            })
    })
});

/**
 * OBTENER TUTORIALES CON PAGINACIÓN
 */
export const getAllTutorialsSchema = Joi.object({
    query: Joi.object({
        limit: Joi.number().integer().min(1).max(100).default(20)
            .messages({
                'number.base': 'El límite debe ser un número',
                'number.integer': 'El límite debe ser un número entero',
                'number.min': 'El límite debe ser mayor a 0',
                'number.max': 'El límite no debe exceder 100'
            }),
        offset: Joi.number().integer().min(0).default(0)
            .messages({
                'number.base': 'El offset debe ser un número',
                'number.integer': 'El offset debe ser un número entero',
                'number.min': 'El offset debe ser mayor o igual a 0'
            })
    })
});

/**
 * OBTENER POR ID
 */
export const getTutorialByIdSchema = Joi.object({
    params: Joi.object({
        id: Joi.number().integer().min(1).required()
            .messages({
                'number.base': 'El ID del tutorial debe ser un número',
                'number.integer': 'El ID del tutorial debe ser un número entero',
                'number.min': 'El ID del tutorial debe ser mayor a 0',
                'any.required': 'El ID del tutorial es obligatorio'
            })
    })
});

/**
 * CREAR TUTORIAL
 */
export const createTutorialSchema = Joi.object({
    body: Joi.object({
        title: Joi.string().trim().min(3).max(255).required()
            .messages({
                'string.base': 'El título debe ser un texto',
                'string.empty': 'El título no puede estar vacío',
                'string.min': 'El título debe tener al menos 3 caracteres',
                'string.max': 'El título no debe exceder 255 caracteres',
                'any.required': 'El título es obligatorio'
            }),
        
        description: Joi.string().trim().max(1000).allow('').optional()
            .messages({
                'string.base': 'La descripción debe ser un texto',
                'string.max': 'La descripción no debe exceder 1000 caracteres'
            }),
        
        url: Joi.string().trim().uri({ scheme: ['http', 'https'] }).max(500).required()
            .messages({
                'string.base': 'La URL debe ser un texto',
                'string.empty': 'La URL no puede estar vacía',
                'string.uri': 'Debe ser una URL válida (http o https)',
                'string.max': 'La URL no debe exceder 500 caracteres',
                'any.required': 'La URL es obligatoria'
            }),
        
        duration_seconds: Joi.number().integer().min(1).max(300).optional()
            .messages({
                'number.base': 'La duración debe ser un número',
                'number.integer': 'La duración debe ser un número entero',
                'number.min': 'La duración debe ser mayor a 0',
                'number.max': 'La duración no debe exceder 300 segundos'
            })
    })
});

/**
 * ACTUALIZAR TUTORIAL
 */
export const updateTutorialSchema = Joi.object({
    params: Joi.object({
        id: Joi.number().integer().min(1).required()
            .messages({
                'number.base': 'El ID del tutorial debe ser un número',
                'number.integer': 'El ID del tutorial debe ser un número entero',
                'number.min': 'El ID del tutorial debe ser mayor a 0',
                'any.required': 'El ID del tutorial es obligatorio'
            })
    }),
    body: Joi.object({
        title: Joi.string().trim().min(3).max(255).optional()
            .messages({
                'string.base': 'El título debe ser un texto',
                'string.min': 'El título debe tener al menos 3 caracteres',
                'string.max': 'El título no debe exceder 255 caracteres'
            }),
        
        description: Joi.string().trim().max(1000).allow('').optional()
            .messages({
                'string.base': 'La descripción debe ser un texto',
                'string.max': 'La descripción no debe exceder 1000 caracteres'
            }),
        
        url: Joi.string().trim().uri({ scheme: ['http', 'https'] }).max(500).optional()
            .messages({
                'string.base': 'La URL debe ser un texto',
                'string.uri': 'Debe ser una URL válida (http o https)',
                'string.max': 'La URL no debe exceder 500 caracteres'
            }),
        
        duration_seconds: Joi.number().integer().min(1).max(300).optional()
            .messages({
                'number.base': 'La duración debe ser un número',
                'number.integer': 'La duración debe ser un número entero',
                'number.min': 'La duración debe ser mayor a 0',
                'number.max': 'La duración no debe exceder 300 segundos'
            }),
        
        is_active: Joi.boolean().optional()
            .messages({
                'boolean.base': 'is_active debe ser true o false'
            })
    })
});

/**
 * TOGGLE STATUS
 */
export const toggleTutorialStatusSchema = Joi.object({
    params: Joi.object({
        id: Joi.number().integer().min(1).required()
            .messages({
                'number.base': 'El ID del tutorial debe ser un número',
                'number.integer': 'El ID del tutorial debe ser un número entero',
                'number.min': 'El ID del tutorial debe ser mayor a 0',
                'any.required': 'El ID del tutorial es obligatorio'
            })
    }),
    body: Joi.object({
        is_active: Joi.boolean().required()
            .messages({
                'boolean.base': 'is_active debe ser true o false',
                'any.required': 'is_active es obligatorio'
            })
    })
});

/**
 * ESTADÍSTICAS
 */
export const getTutorialStatsSchema = Joi.object({
    query: Joi.object({
        period: Joi.string().valid('TODAY', 'WEEK', 'MONTH', 'YEAR').default('MONTH')
            .messages({
                'string.base': 'El período debe ser un texto',
                'any.only': 'El período debe ser: TODAY, WEEK, MONTH o YEAR'
            }),
        
        tutorialId: Joi.number().integer().min(1).optional()
            .messages({
                'number.base': 'El ID del tutorial debe ser un número',
                'number.integer': 'El ID del tutorial debe ser un número entero',
                'number.min': 'El ID del tutorial debe ser mayor a 0'
            })
    })
});

/**
 * ELIMINAR TUTORIAL
 */
export const deleteTutorialSchema = Joi.object({
    params: Joi.object({
        id: Joi.number().integer().min(1).required()
            .messages({
                'number.base': 'El ID del tutorial debe ser un número',
                'number.integer': 'El ID del tutorial debe ser un número entero',
                'number.min': 'El ID del tutorial debe ser mayor a 0',
                'any.required': 'El ID del tutorial es obligatorio'
            })
    })
});