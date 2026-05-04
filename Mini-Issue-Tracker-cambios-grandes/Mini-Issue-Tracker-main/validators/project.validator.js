const Joi = require('joi');

const projectSchema = Joi.object({
    nombre: Joi.string().required().messages({
        'string.empty': 'El nombre del proyecto es requerido',
        'any.required': 'El nombre del proyecto es requerido'
    }),
    descripcion: Joi.string().required().messages({
        'string.empty': 'La descripción es requerida',
        'any.required': 'La descripción es requerida'
    })
});

const addMemberSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Ingresa un email válido',
        'string.empty': 'El email es requerido'
    })
});

module.exports = { projectSchema, addMemberSchema };
