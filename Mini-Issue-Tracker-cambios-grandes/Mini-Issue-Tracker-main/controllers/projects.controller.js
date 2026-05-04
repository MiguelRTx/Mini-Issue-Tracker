const {
    getProjectsByUser, getProjectById, createProject,
    updateProject, deleteProject, addMember, removeMember, isOwner
} = require('../services/projects.service');
const { findUserByEmail } = require('../services/auth.service');
const { projectSchema, addMemberSchema } = require('../validators/project.validator');

exports.listGet = async (req, res) => {
    try {
        const projects = await getProjectsByUser(req.user.id);
        res.json({ projects });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al cargar proyectos' });
    }
};

exports.createPost = async (req, res) => {
    const { error } = projectSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    try {
        const { nombre, descripcion } = req.body;
        const project = await createProject(nombre, descripcion, req.user.id);
        res.status(201).json({ message: 'Proyecto creado', project });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear el proyecto' });
    }
};

exports.detailGet = async (req, res) => {
    try {
        const project = await getProjectById(req.params.projectId);
        if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
        
        const ownerFlag = await isOwner(req.params.projectId, req.user.id);
        res.json({ project, isOwner: ownerFlag });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al cargar el proyecto' });
    }
};

exports.editPut = async (req, res) => {
    const { error } = projectSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    try {
        const { nombre, descripcion } = req.body;
        await updateProject(req.params.projectId, nombre, descripcion);
        res.json({ message: 'Proyecto actualizado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el proyecto' });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const ownerFlag = await isOwner(req.params.projectId, req.user.id);
        if (!ownerFlag) return res.status(403).json({ error: 'Solo el dueño puede eliminar el proyecto' });
        
        await deleteProject(req.params.projectId);
        res.json({ message: 'Proyecto eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el proyecto' });
    }
};

exports.addMemberPost = async (req, res) => {
    try {
        const { error } = addMemberSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const member = await findUserByEmail(req.body.email);
        if (!member) return res.status(404).json({ error: 'No existe un usuario con ese email' });

        const result = await addMember(req.params.projectId, member.id);
        if (!result) return res.status(400).json({ error: 'El usuario ya es miembro del proyecto' });

        const updatedProject = await getProjectById(req.params.projectId);
        res.json({ message: `${member.nombre} fue agregado al proyecto`, project: updatedProject });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al agregar miembro' });
    }
};

exports.removeMemberPost = async (req, res) => {
    try {
        const ownerFlag = await isOwner(req.params.projectId, req.user.id);
        if (!ownerFlag) return res.status(403).json({ error: 'Solo el dueño puede quitar miembros' });

        const project = await getProjectById(req.params.projectId);
        if (parseInt(req.params.memberId) === project.owner_id) {
            return res.status(400).json({ error: 'No puedes eliminar al dueño del proyecto' });
        }
        
        await removeMember(req.params.projectId, req.params.memberId);
        res.json({ message: 'Miembro eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al quitar miembro' });
    }
};