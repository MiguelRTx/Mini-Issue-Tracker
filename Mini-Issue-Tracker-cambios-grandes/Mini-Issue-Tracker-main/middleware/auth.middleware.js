const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_key';

const requireLogin = (req, res, next) => {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) return res.status(401).json({ error: 'No autorizado. Se requiere token.' });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

const requireProjectAccess = async (req, res, next) => {
    const { ProjectMember } = require('../models');
    try {
        const projectId = req.params.projectId || req.params.pid;
        const userId = req.user.id;

        const member = await ProjectMember.findOne({
            where: { project_id: projectId, user_id: userId }
        });

        if (!member) {
            return res.status(403).json({ error: 'No tienes acceso a este proyecto.' });
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { requireLogin, requireProjectAccess };