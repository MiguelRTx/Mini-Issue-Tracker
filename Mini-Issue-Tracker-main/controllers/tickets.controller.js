const {
    getTicketsByProject, getTicketById, createTicket,
    updateTicket, deleteTicket, changeStatus, VALID_TRANSITIONS
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
        
        res.json({ project, tickets: grouped });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al cargar el tablero' });
    }
};

exports.createPost = async (req, res) => {
    const { pid } = req.params;
    const { error } = ticketSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    try {
        const { titulo, descripcion, assigned_to } = req.body;
        const assignedId = assigned_to ? parseInt(assigned_to) : null;
        const ticket = await createTicket(titulo, descripcion, pid, req.user.id, assignedId);
        res.status(201).json({ message: 'Ticket creado', ticket });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear el ticket' });
    }
};

exports.detailGet = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await getTicketById(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
        
        const validNext = VALID_TRANSITIONS[ticket.estado] || [];
        res.json({ ticket, validTransitions: validNext });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al cargar el ticket' });
    }
};

exports.editPut = async (req, res) => {
    const { id } = req.params;
    const { error } = ticketSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    try {
        const { titulo, descripcion, assigned_to } = req.body;
        const assignedId = assigned_to ? parseInt(assigned_to) : null;
        await updateTicket(id, titulo, descripcion, assignedId);
        res.json({ message: 'Ticket actualizado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el ticket' });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteTicket(id);
        res.json({ message: 'Ticket eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el ticket' });
    }
};

exports.changeStatusPatch = async (req, res) => {
    const { id } = req.params;
    const { error } = statusSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    try {
        const { estado } = req.body;
        const ticket = await getTicketById(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
        
        await changeStatus(ticket, estado);
        res.json({ message: 'Estado actualizado', estado: ticket.estado });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message }); // 400 porque suele ser error de regla de negocio
    }
};