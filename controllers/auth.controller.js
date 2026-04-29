const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser, verifyPassword } = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_key';

exports.loginGet = (req, res) => {
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, JWT_SECRET);
            return res.redirect('/projects');
        } catch (e) {
            res.clearCookie('token');
        }
    }
    res.render('auth/login', { error: null });
};

exports.loginPost = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.render('auth/login', { error: error.details[0].message });
    }
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);
        if (!user || !(await verifyPassword(password, user.password))) {
            return res.render('auth/login', { error: 'Email o contrasena incorrectos' });
        }
        const token = jwt.sign(
            { id: user.id, nombre: user.nombre, email: user.email },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.cookie('token', token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 });
        res.redirect('/projects');
    } catch (err) {
        console.error(err);
        res.render('auth/login', { error: 'Error interno del servidor' });
    }
};

exports.registerGet = (req, res) => {
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, JWT_SECRET);
            return res.redirect('/projects');
        } catch (e) {
            res.clearCookie('token');
        }
    }
    res.render('auth/register', { error: null });
};

exports.registerPost = async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.render('auth/register', { error: error.details[0].message });
    }
    try {
        const { nombre, email, password } = req.body;
        const existing = await findUserByEmail(email);
        if (existing) {
            return res.render('auth/register', { error: 'El email ya esta registrado' });
        }
        await createUser(nombre, email, password);
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.render('auth/register', { error: 'Error al crear el usuario' });
    }
};

exports.logoutPost = (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
};
