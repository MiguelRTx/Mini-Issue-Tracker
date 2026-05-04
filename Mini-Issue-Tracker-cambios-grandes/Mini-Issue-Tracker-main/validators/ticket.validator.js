const Joi = require('joi');

const ticketSchema = Joi.object({
    titulo: Joi.string().required().messages({
        'string.empty': 'El título del ticket es requerido',
        'any.required': 'El título del ticket es requerido'
    }),
    descripcion: Joi.string().required().messages({
        'string.empty': 'La descripción es requerida',
        'any.required': 'La descripción es requerida'
    }),
    assigned_to: Joi.alternatives().try(
        Joi.number().integer().positive(),
        Joi.string().allow('', null)
    ).optional()
});

const statusSchema = Joi.object({
    estado: Joi.string().valid('pendiente', 'en_progreso', 'completado').required().messages({
        'any.only': 'Estado no válido. Debe ser pendiente, en_progreso o completado',
        'any.required': 'El estado es requerido'
    })
});

module.exports = { ticketSchema, statusSchema };
