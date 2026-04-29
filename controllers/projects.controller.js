const {
    getProjectsByUser, getProjectById, createProject,
    updateProject, deleteProject, addMember, removeMember, isOwner
} = require('../services/projects.service');
const { findUserByEmail } = require('../services/auth.service');
const { projectSchema, addMemberSchema } = require('../validators/project.validator');

exports.listGet = async (req, res) => {
    try {
        const projects = await getProjectsByUser(req.user.id);
        res.render('projects/list', { projects, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al cargar proyectos', user: req.user });
    }
};

exports.newGet = (req, res) => {
    res.render('projects/form', { project: null, error: null, user: req.user });
};

exports.createPost = async (req, res) => {
    const { error } = projectSchema.validate(req.body);
    if (error) {
        return res.render('projects/form', { project: null, error: error.details[0].message, user: req.user });
    }
    try {
        const { nombre, descripcion } = req.body;
        await createProject(nombre, descripcion, req.user.id);
        res.redirect('/projects');
    } catch (err) {
        console.error(err);
        res.render('projects/form', { project: null, error: 'Error al crear el proyecto', user: req.user });
    }
};

exports.detailGet = async (req, res) => {
    try {
        const project = await getProjectById(req.params.projectId);
        if (!project) return res.status(404).render('error', { message: 'Proyecto no encontrado', user: req.user });
        const ownerFlag = await isOwner(req.params.projectId, req.user.id);
        res.render('projects/detail', { project, user: req.user, isOwner: ownerFlag, error: null, success: null });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al cargar el proyecto', user: req.user });
    }
};

exports.editGet = async (req, res) => {
    try {
        const project = await getProjectById(req.params.projectId);
        if (!project) return res.status(404).render('error', { message: 'Proyecto no encontrado', user: req.user });
        res.render('projects/form', { project, error: null, user: req.user });
    } catch (err) {
        res.status(500).render('error', { message: 'Error', user: req.user });
    }
};

exports.editPost = async (req, res) => {
    const { error } = projectSchema.validate(req.body);
    if (error) {
        const project = await getProjectById(req.params.projectId);
        return res.render('projects/form', { project, error: error.details[0].message, user: req.user });
    }
    try {
        const { nombre, descripcion } = req.body;
        await updateProject(req.params.projectId, nombre, descripcion);
        res.redirect(`/projects/${req.params.projectId}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al actualizar el proyecto', user: req.user });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const ownerFlag = await isOwner(req.params.projectId, req.user.id);
        if (!ownerFlag) return res.status(403).render('error', { message: 'Solo el dueno puede eliminar el proyecto', user: req.user });
        await deleteProject(req.params.projectId);
        res.redirect('/projects');
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al eliminar el proyecto', user: req.user });
    }
};

exports.addMemberPost = async (req, res) => {
    try {
        const project = await getProjectById(req.params.projectId);
        const ownerFlag = await isOwner(req.params.projectId, req.user.id);

        const { error } = addMemberSchema.validate(req.body);
        if (error) {
            return res.render('projects/detail', { project, user: req.user, isOwner: ownerFlag, error: error.details[0].message, success: null });
        }

        const member = await findUserByEmail(req.body.email);
        if (!member) {
            return res.render('projects/detail', { project, user: req.user, isOwner: ownerFlag, error: 'No existe un usuario con ese email en el sistema', success: null });
        }

        const result = await addMember(req.params.projectId, member.id);
        if (!result) {
            return res.render('projects/detail', { project, user: req.user, isOwner: ownerFlag, error: 'El usuario ya es miembro del proyecto', success: null });
        }

        const updatedProject = await getProjectById(req.params.projectId);
        res.render('projects/detail', { project: updatedProject, user: req.user, isOwner: ownerFlag, error: null, success: `${member.nombre} fue agregado al proyecto` });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al agregar miembro', user: req.user });
    }
};

exports.removeMemberPost = async (req, res) => {
    try {
        const ownerFlag = await isOwner(req.params.projectId, req.user.id);
        if (!ownerFlag) return res.status(403).render('error', { message: 'Solo el dueno puede quitar miembros', user: req.user });

        const project = await getProjectById(req.params.projectId);
        if (parseInt(req.params.memberId) === project.owner_id) {
            return res.redirect(`/projects/${req.params.projectId}`);
        }
        await removeMember(req.params.projectId, req.params.memberId);
        res.redirect(`/projects/${req.params.projectId}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al quitar miembro', user: req.user });
    }
};
