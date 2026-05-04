const Joi = require('joi');

const registerSchema = Joi.object({
    nombre: Joi.string().required().messages({
        'string.empty': 'El nombre es requerido',
        'any.required': 'El nombre es requerido'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Ingresa un email válido',
        'string.empty': 'El email es requerido',
        'any.required': 'El email es requerido'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'string.empty': 'La contraseña es requerida',
        'any.required': 'La contraseña es requerida'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Ingresa un email válido',
        'string.empty': 'El email es requerido'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'La contraseña es requerida'
    })
});

module.exports = { registerSchema, loginSchema };
