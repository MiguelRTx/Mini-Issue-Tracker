const { Project, ProjectMember, User } = require('../models');

const getProjectsByUser = async (userId) => {
    const memberships = await ProjectMember.findAll({ where: { user_id: userId } });
    const projectIds = memberships.map(m => m.project_id);
    if (projectIds.length === 0) return [];
    return await Project.findAll({
        where: { id: projectIds },
        include: [{ model: User, as: 'owner', attributes: ['id', 'nombre', 'email'] }],
        order: [['createdAt', 'DESC']]
    });
};

const getProjectById = async (projectId) => {
    return await Project.findByPk(projectId, {
        include: [
            { model: User, as: 'owner', attributes: ['id', 'nombre', 'email'] },
            { model: User, as: 'members', attributes: ['id', 'nombre', 'email'], through: { attributes: [] } }
        ]
    });
};

const createProject = async (nombre, descripcion, ownerId) => {
    const project = await Project.create({ nombre, descripcion, owner_id: ownerId });
    await ProjectMember.create({ project_id: project.id, user_id: ownerId });
    return project;
};

const updateProject = async (projectId, nombre, descripcion) => {
    return await Project.update({ nombre, descripcion }, { where: { id: projectId } });
};

const deleteProject = async (projectId) => {
    return await Project.destroy({ where: { id: projectId } });
};

const addMember = async (projectId, userId) => {
    const exists = await ProjectMember.findOne({ where: { project_id: projectId, user_id: userId } });
    if (exists) return null;
    return await ProjectMember.create({ project_id: projectId, user_id: userId });
};

const removeMember = async (projectId, userId) => {
    return await ProjectMember.destroy({ where: { project_id: projectId, user_id: userId } });
};

const isOwner = async (projectId, userId) => {
    const project = await Project.findByPk(projectId);
    return project && project.owner_id === parseInt(userId);
};

module.exports = {
    getProjectsByUser, getProjectById, createProject,
    updateProject, deleteProject, addMember, removeMember, isOwner
};
