const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser, verifyPassword } = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_key';

exports.loginPost = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);
        if (!user || !(await verifyPassword(password, user.password))) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }
        const token = jwt.sign(
            { id: user.id, nombre: user.nombre, email: user.email },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.cookie('token', token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 });
        
        res.json({ message: 'Login exitoso', token, user: { id: user.id, nombre: user.nombre, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.registerPost = async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    try {
        const { nombre, email, password } = req.body;
        const existing = await findUserByEmail(email);
        if (existing) return res.status(400).json({ error: 'El email ya está registrado' });
        
        const newUser = await createUser(nombre, email, password);
        res.status(201).json({ message: 'Usuario creado exitosamente', user: { id: newUser.id, nombre: newUser.nombre } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
};

exports.logoutPost = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada exitosamente' });
};

exports.getUsers = async (req, res) => {
    try {
        const { User } = require('../models');
        const users = await User.findAll({
            attributes: ['id', 'nombre', 'email'],
            order: [['nombre', 'ASC']]
        });
        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};