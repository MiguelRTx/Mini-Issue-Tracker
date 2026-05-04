const { Ticket, User, ProjectMember } = require('../models');


const VALID_TRANSITIONS = {
    'pendiente':   ['en_progreso'],
    'en_progreso': ['pendiente', 'completado'],
    'completado':  ['en_progreso']
};

const getTicketsByProject = async (projectId) => {
    return await Ticket.findAll({
        where: { project_id: projectId },
        include: [
            { model: User, as: 'creator',  attributes: ['id', 'nombre'] },
            { model: User, as: 'assignee', attributes: ['id', 'nombre'] }
        ],
        order: [['createdAt', 'DESC']]
    });
};

const getTicketById = async (ticketId) => {
    return await Ticket.findByPk(ticketId, {
        include: [
            { model: User, as: 'creator',  attributes: ['id', 'nombre', 'email'] },
            { model: User, as: 'assignee', attributes: ['id', 'nombre', 'email'] }
        ]
    });
};

const createTicket = async (titulo, descripcion, projectId, createdBy, assignedTo) => {
    return await Ticket.create({
        titulo,
        descripcion,
        estado: 'pendiente',
        project_id: projectId,
        created_by: createdBy,
        assigned_to: assignedTo || null
    });
};

const updateTicket = async (ticketId, titulo, descripcion, assignedTo) => {
    return await Ticket.update(
        { titulo, descripcion, assigned_to: assignedTo || null },
        { where: { id: ticketId } }
    );
};

const deleteTicket = async (ticketId) => {
    return await Ticket.destroy({ where: { id: ticketId } });
};

const changeStatus = async (ticket, newEstado) => {
    const allowed = VALID_TRANSITIONS[ticket.estado];

    if (!allowed || !allowed.includes(newEstado)) {
        throw new Error(`Transición no permitida: de "${ticket.estado}" a "${newEstado}"`);
    }

    if (newEstado === 'en_progreso' && !ticket.assigned_to) {
        throw new Error('No se puede iniciar un ticket sin responsable asignado');
    }

    await ticket.update({ estado: newEstado });
    return ticket;
};

const getProjectMembers = async (projectId) => {
    const { Project } = require('../models');
    const project = await Project.findByPk(projectId, {
        include: [{ model: User, as: 'members', attributes: ['id', 'nombre', 'email'], through: { attributes: [] } }]
    });
    return project ? project.members : [];
};

module.exports = {
    getTicketsByProject, getTicketById, createTicket,
    updateTicket, deleteTicket, changeStatus, getProjectMembers, VALID_TRANSITIONS
};
