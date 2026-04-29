const {
    getTicketsByProject, getTicketById, createTicket,
    updateTicket, deleteTicket, changeStatus, getProjectMembers, VALID_TRANSITIONS
} = require('../services/tickets.service');
const { getProjectById } = require('../services/projects.service');
const { ticketSchema, statusSchema } = require('../validators/ticket.validator');

exports.boardGet = async (req, res) => {
    try {
        const { pid } = req.params;
        const project = await getProjectById(pid);
        const tickets = await getTicketsByProject(pid);
        const grouped = {
            pendiente:   tickets.filter(t => t.estado === 'pendiente'),
            en_progreso: tickets.filter(t => t.estado === 'en_progreso'),
            completado:  tickets.filter(t => t.estado === 'completado')
        };
        res.render('tickets/board', { project, grouped, user: req.user, error: null });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al cargar el tablero', user: req.user });
    }
};

exports.newGet = async (req, res) => {
    try {
        const { pid } = req.params;
        const project = await getProjectById(pid);
        const members = await getProjectMembers(pid);
        res.render('tickets/form', { ticket: null, project, members, error: null, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error', user: req.user });
    }
};

exports.createPost = async (req, res) => {
    const { pid } = req.params;
    const { error } = ticketSchema.validate(req.body);
    if (error) {
        const project = await getProjectById(pid);
        const members = await getProjectMembers(pid);
        return res.render('tickets/form', { ticket: null, project, members, error: error.details[0].message, user: req.user });
    }
    try {
        const { titulo, descripcion, assigned_to } = req.body;
        const assignedId = assigned_to && assigned_to !== '' ? parseInt(assigned_to) : null;
        await createTicket(titulo, descripcion, pid, req.user.id, assignedId);
        res.redirect(`/projects/${pid}/tickets`);
    } catch (err) {
        console.error(err);
        const project = await getProjectById(pid);
        const members = await getProjectMembers(pid);
        res.render('tickets/form', { ticket: null, project, members, error: 'Error al crear el ticket', user: req.user });
    }
};

exports.detailGet = async (req, res) => {
    try {
        const { pid, id } = req.params;
        const ticket = await getTicketById(id);
        if (!ticket) return res.status(404).render('error', { message: 'Ticket no encontrado', user: req.user });
        const project = await getProjectById(pid);
        const members = await getProjectMembers(pid);
        const validNext = VALID_TRANSITIONS[ticket.estado] || [];
        res.render('tickets/detail', { ticket, project, members, validNext, user: req.user, error: null });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al cargar el ticket', user: req.user });
    }
};

exports.editGet = async (req, res) => {
    try {
        const { pid, id } = req.params;
        const ticket = await getTicketById(id);
        if (!ticket) return res.status(404).render('error', { message: 'Ticket no encontrado', user: req.user });
        const project = await getProjectById(pid);
        const members = await getProjectMembers(pid);
        res.render('tickets/form', { ticket, project, members, error: null, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error', user: req.user });
    }
};

exports.editPost = async (req, res) => {
    const { pid, id } = req.params;
    const { error } = ticketSchema.validate(req.body);
    if (error) {
        const ticket = await getTicketById(id);
        const project = await getProjectById(pid);
        const members = await getProjectMembers(pid);
        return res.render('tickets/form', { ticket, project, members, error: error.details[0].message, user: req.user });
    }
    try {
        const { titulo, descripcion, assigned_to } = req.body;
        const assignedId = assigned_to && assigned_to !== '' ? parseInt(assigned_to) : null;
        await updateTicket(id, titulo, descripcion, assignedId);
        res.redirect(`/projects/${pid}/tickets/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al actualizar el ticket', user: req.user });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { pid, id } = req.params;
        await deleteTicket(id);
        res.redirect(`/projects/${pid}/tickets`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al eliminar el ticket', user: req.user });
    }
};

exports.changeStatusPost = async (req, res) => {
    const { pid, id } = req.params;
    const { error } = statusSchema.validate(req.body);
    if (error) {
        return res.redirect(`/projects/${pid}/tickets/${id}`);
    }
    try {
        const ticket = await getTicketById(id);
        if (!ticket) return res.status(404).render('error', { message: 'Ticket no encontrado', user: req.user });
        await changeStatus(ticket, req.body.estado);
        res.redirect(`/projects/${pid}/tickets/${id}`);
    } catch (err) {
        console.error(err);
        const ticket = await getTicketById(id);
        const project = await getProjectById(pid);
        const members = await getProjectMembers(pid);
        const validNext = VALID_TRANSITIONS[ticket.estado] || [];
        res.render('tickets/detail', { ticket, project, members, validNext, user: req.user, error: err.message });
    }
};

exports.changeStatusApi = async (req, res) => {
    const { pid, id } = req.params;
    try {
        const { estado } = req.body;
        const ticket = await getTicketById(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
        await changeStatus(ticket, estado);
        res.json({ success: true, estado: ticket.estado });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
