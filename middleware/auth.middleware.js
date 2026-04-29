const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_key';

const requireLogin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/auth/login');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/auth/login');
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
            return res.status(403).render('error', {
                message: 'No tienes acceso a este proyecto.',
                user: req.user
            });
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { requireLogin, requireProjectAccess };
