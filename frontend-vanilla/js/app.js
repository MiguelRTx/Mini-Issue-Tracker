const app = {
    state: {
        user: null,
        currentView: '',
        params: {}
    },

    init() {
        this.checkSession();
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    checkSession() {
        const token = api.getToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.state.user = payload;
                document.getElementById('userGreeting').textContent = `Hola, ${payload.nombre}`;
                document.getElementById('navbar').style.display = 'block';
            } catch (e) {
                this.logout();
            }
        } else {
            this.state.user = null;
            document.getElementById('navbar').style.display = 'none';
        }
    },

    navigate(view, params = {}) {
        let hash = `#/${view}`;
        if (params.pid) hash += `/${params.pid}`;
        if (params.tid) hash += `/${params.tid}`;
        window.location.hash = hash;
    },

    handleRoute() {
        this.checkSession();
        const hash = window.location.hash.slice(2) || 'projects';
        const parts = hash.split('/');
        
        let view = parts[0];
        this.state.params = {
            pid: parts[1] || null,
            tid: parts[2] || null
        };

        const publicViews = ['login', 'register'];
        if (!this.state.user && !publicViews.includes(view)) {
            return this.navigate('login');
        }
        if (this.state.user && publicViews.includes(view)) {
            return this.navigate('projects');
        }

        this.renderView(view);
    },

    renderView(viewName) {
        const template = document.getElementById(`tpl-${viewName}`);
        const content = document.getElementById('app-content');
        
        if (!template) {
            content.innerHTML = `<h2>404 - Vista no encontrada</h2>`;
            return;
        }

        content.innerHTML = '';
        content.appendChild(template.content.cloneNode(true));
        this.state.currentView = viewName;

        const camelCaseView = viewName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        const methodName = 'init_' + camelCaseView;

        if (this[methodName]) {
            this[methodName]();
        }
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    logout() {
        localStorage.removeItem('authToken');
        this.checkSession();
        this.navigate('login');
    },


    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('btn-login');
        const errorDiv = document.getElementById('login-error');
        
        const credentials = {
            email: form.email.value,
            password: form.password.value
        };

        try {
            btn.disabled = true;
            btn.textContent = 'Ingresando...';
            errorDiv.classList.add('hidden');
            
            const res = await api.auth.login(credentials);
            localStorage.setItem('authToken', res.token);
            this.navigate('projects');
            this.showToast('Sesión iniciada');
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Ingresar';
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('btn-register');
        const errorDiv = document.getElementById('register-error');
        
        const data = {
            nombre: form.nombre.value,
            email: form.email.value,
            password: form.password.value
        };

        try {
            btn.disabled = true;
            btn.textContent = 'Registrando...';
            errorDiv.classList.add('hidden');
            
            await api.auth.register(data);
            this.navigate('login');
            this.showToast('Cuenta creada. Por favor inicia sesión.');
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Registrarse';
        }
    },

    async init_projects() {
        try {
            const res = await api.projects.getAll();
            const grid = document.getElementById('projects-grid');
            const empty = document.getElementById('projects-empty');
            const loading = document.getElementById('projects-loading');
            
            loading.classList.add('hidden');
            
            if (res.projects.length === 0) {
                empty.classList.remove('hidden');
                return;
            }

            grid.classList.remove('hidden');
            grid.innerHTML = res.projects.map(p => {
                const isOwner = p.owner_id === this.state.user.id;
                const badge = isOwner ? '<span class="badge badge-owner">Dueño</span>' : '<span class="badge badge-member">Miembro</span>';
                const initial = p.nombre.substring(0, 4).toUpperCase();
                const date = new Date(p.createdAt).toLocaleDateString();
                
                return `
                <div class="card project-card">
                    <div class="project-card-header">
                        <span class="project-key">${initial}</span>
                        ${badge}
                    </div>
                    <h2 class="project-name">${p.nombre}</h2>
                    <p class="project-desc">${p.descripcion || 'Sin descripción'}</p>
                    <div class="project-meta">
                        <span class="meta-item">Fecha: ${date}</span>
                    </div>
                    <div class="project-card-actions">
                        <button class="btn btn-primary btn-sm" onclick="app.navigate('ticket-board', {pid: ${p.id}})">Ver Tablero</button>
                        <button class="btn btn-ghost btn-sm" onclick="app.navigate('project-detail', {pid: ${p.id}})">Detalles</button>
                    </div>
                </div>
                `;
            }).join('');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    async init_projectForm() {
        const title = document.getElementById('pform-title');
        const form = document.getElementById('form-project');
        
        if (this.state.params.pid) {
            title.textContent = 'Editar Proyecto';
            try {
                const res = await api.projects.getOne(this.state.params.pid);
                form.elements['pform-nombre'].value = res.project.nombre;
                form.elements['pform-descripcion'].value = res.project.descripcion;
                document.getElementById('pform-id').value = res.project.id;
            } catch (error) {
                this.showToast('Error al cargar proyecto', 'error');
            }
        }
    },

    async handleProjectSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('btn-pform');
        const errorDiv = document.getElementById('pform-error');
        
        const data = {
            nombre: document.getElementById('pform-nombre').value,
            descripcion: document.getElementById('pform-descripcion').value
        };
        const pid = document.getElementById('pform-id').value;

        try {
            btn.disabled = true;
            errorDiv.classList.add('hidden');
            
            if (pid) {
                await api.projects.update(pid, data);
                this.showToast('Proyecto actualizado');
                this.navigate('project-detail', {pid});
            } else {
                const res = await api.projects.create(data);
                this.showToast('Proyecto creado');
                this.navigate('project-detail', {pid: res.project.id});
            }
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
            btn.disabled = false;
        }
    },

    async init_projectDetail() {
        const pid = this.state.params.pid;
        if (!pid) return this.navigate('projects');

        try {
            const res = await api.projects.getOne(pid);
            const { project, isOwner } = res;
            
            document.getElementById('pdetail-loading').classList.add('hidden');
            document.getElementById('pdetail-content').classList.remove('hidden');

            document.getElementById('pd-nombre').textContent = project.nombre;
            document.getElementById('pd-desc').textContent = project.descripcion;
            document.getElementById('pd-owner').textContent = project.owner ? project.owner.nombre : 'Desconocido';
            document.getElementById('pd-date').textContent = new Date(project.createdAt).toLocaleDateString();

            const actions = document.getElementById('pd-actions');
            document.getElementById('btn-ver-tablero').onclick = () => this.navigate('ticket-board', {pid});
            document.getElementById('btn-editar-proyecto').onclick = () => this.navigate('project-form', {pid});

            if (isOwner) {
                if (!document.getElementById('btn-delete-project')) {
                    const delBtn = document.createElement('button');
                    delBtn.id = 'btn-delete-project';
                    delBtn.className = 'btn btn-danger';
                    delBtn.textContent = 'Eliminar';
                    delBtn.onclick = () => this.handleDeleteProject(pid);
                    actions.appendChild(delBtn);
                }
            } else {
                document.getElementById('pd-add-member-section').classList.add('hidden');
            }

            if (isOwner || true) {
                api.auth.getUsers().then(usersRes => {
                    const datalist = document.getElementById('users-datalist');
                    if (datalist) {
                        const existingEmails = (project.members || []).map(m => m.email);
                        if (project.owner) existingEmails.push(project.owner.email);
                        
                        datalist.innerHTML = usersRes.users
                            .filter(u => !existingEmails.includes(u.email))
                            .map(u => `<option value="${u.email}">${u.nombre}</option>`)
                            .join('');
                    }
                }).catch(e => console.log('Error fetching users for datalist', e));
            }

            const membersList = document.getElementById('pd-members');
            membersList.innerHTML = (project.members || []).map(m => {
                const badge = m.id === project.owner_id ? '<span class="badge badge-owner">Dueño</span>' : '';
                const removeBtn = (isOwner && m.id !== project.owner_id) 
                    ? `<button class="btn-icon" onclick="app.removeMember(${project.id}, ${m.id})">✕</button>` 
                    : '';
                
                return `
                <div class="member-item">
                    <div class="member-info">
                        <span class="avatar" style="background: hsl(${m.id * 67 % 360},60%,45%)">${m.nombre.charAt(0).toUpperCase()}</span>
                        <div>
                            <span class="member-name">${m.nombre}</span>
                            <span class="member-email">${m.email}</span>
                        </div>
                    </div>
                    <div class="member-actions">
                        ${badge}
                        ${removeBtn}
                    </div>
                </div>`;
            }).join('');

        } catch (error) {
            this.showToast('Error al cargar detalle del proyecto', 'error');
            this.navigate('projects');
        }
    },

    async handleDeleteProject(pid) {
        if (!confirm('¿Seguro que deseas eliminar el proyecto y sus tickets?')) return;
        try {
            await api.projects.delete(pid);
            this.showToast('Proyecto eliminado');
            this.navigate('projects');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    async handleAddMember(e) {
        e.preventDefault();
        const email = document.getElementById('am-email').value;
        const pid = this.state.params.pid;
        
        try {
            document.getElementById('btn-add-member').disabled = true;
            await api.projects.addMember(pid, email);
            this.showToast('Miembro agregado con éxito');
            this.init_projectDetail();
        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            document.getElementById('btn-add-member').disabled = false;
        }
    },

    async removeMember(pid, uid) {
        if (!confirm('¿Quitar miembro del proyecto?')) return;
        try {
            await api.projects.removeMember(pid, uid);
            this.showToast('Miembro removido');
            this.init_projectDetail();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    async init_ticketBoard() {
        const pid = this.state.params.pid;
        if (!pid) return this.navigate('projects');

        document.getElementById('board-back-link').onclick = (e) => { e.preventDefault(); this.navigate('project-detail', {pid}); };
        document.getElementById('btn-new-ticket').onclick = () => this.navigate('ticket-form', {pid});

        try {
            const res = await api.tickets.getBoard(pid);
            document.getElementById('board-loading').classList.add('hidden');
            document.getElementById('board-content').classList.remove('hidden');

            const renderTickets = (tickets, state) => {
                document.getElementById(`count-${state}`).textContent = tickets.length;
                const container = document.getElementById(`col-${state}`);
                container.innerHTML = tickets.map(t => {
                    const assignee = t.assignee 
                        ? `<span class="avatar-sm" style="background: hsl(${t.assigned_to * 67 % 360},60%,45%)">${t.assignee.nombre.charAt(0).toUpperCase()}</span> ${t.assignee.nombre}`
                        : '<span class="text-dim">Sin asignar</span>';

                    let actions = '';
                    if (state === 'pendiente') {
                        actions = `<button class="btn btn-outline btn-sm" onclick="app.changeTicketStatus(${pid}, ${t.id}, 'en_progreso')">Iniciar →</button>`;
                    } else if (state === 'en-progreso') {
                        actions = `
                            <button class="btn btn-ghost btn-sm" onclick="app.changeTicketStatus(${pid}, ${t.id}, 'pendiente')">← Pausar</button>
                            <button class="btn btn-primary btn-sm" onclick="app.changeTicketStatus(${pid}, ${t.id}, 'completado')">Completar ✓</button>
                        `;
                    } else if (state === 'completado') {
                        actions = `<button class="btn btn-outline btn-sm" onclick="app.changeTicketStatus(${pid}, ${t.id}, 'en_progreso')">← Reabrir</button>`;
                    }

                    return `
                    <div class="card ticket-card">
                        <a href="#" class="ticket-title" onclick="app.navigate('ticket-detail', {pid: ${pid}, tid: ${t.id}}); return false;">${t.titulo}</a>
                        <p class="ticket-desc">${t.descripcion}</p>
                        <div class="ticket-footer">
                            <span class="ticket-assignee">${assignee}</span>
                        </div>
                        <div class="ticket-actions">
                            ${actions}
                            <button class="btn-icon" onclick="app.deleteTicket(${pid}, ${t.id})" title="Eliminar">🗑</button>
                        </div>
                    </div>`;
                }).join('');
            };

            renderTickets(res.tickets.pendiente, 'pendiente');
            renderTickets(res.tickets.en_progreso, 'en-progreso');
            renderTickets(res.tickets.completado, 'completado');

        } catch (error) {
            this.showToast('Error al cargar tablero', 'error');
        }
    },

    async changeTicketStatus(pid, tid, estado) {
        try {
            await api.tickets.changeStatus(pid, tid, estado);
            this.showToast('Estado actualizado');
            if (this.state.currentView === 'ticket-board') this.init_ticketBoard();
            else this.init_ticketDetail();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    async deleteTicket(pid, tid) {
        if (!confirm('¿Eliminar este ticket permanentemente?')) return;
        try {
            await api.tickets.delete(pid, tid);
            this.showToast('Ticket eliminado');
            if (this.state.currentView === 'ticket-board') this.init_ticketBoard();
            else this.navigate('ticket-board', {pid});
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    async init_ticketForm() {
        const pid = this.state.params.pid;
        const tid = this.state.params.tid;
        if (!pid) return this.navigate('projects');

        document.getElementById('tform-back-link').onclick = (e) => { e.preventDefault(); this.navigate('ticket-board', {pid}); };
        document.getElementById('btn-tform-cancel').onclick = () => this.navigate('ticket-board', {pid});

        try {
            const { project } = await api.projects.getOne(pid);
            const select = document.getElementById('tform-assignee');
            const membersHtml = (project.members || []).map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
            select.innerHTML = `<option value="">-- Sin asignar --</option>${membersHtml}`;

            if (tid) {
                document.getElementById('tform-title').textContent = 'Editar Ticket';
                const { ticket } = await api.tickets.getOne(pid, tid);
                document.getElementById('tform-id').value = ticket.id;
                document.getElementById('tform-titulo').value = ticket.titulo;
                document.getElementById('tform-descripcion').value = ticket.descripcion;
                if (ticket.assigned_to) select.value = ticket.assigned_to;
            }
        } catch (error) {
            this.showToast('Error al preparar formulario', 'error');
        }
    },

    async handleTicketSubmit(e) {
        e.preventDefault();
        const pid = this.state.params.pid;
        const tid = document.getElementById('tform-id').value;
        const btn = document.getElementById('btn-tform-submit');
        const errorDiv = document.getElementById('tform-error');

        const data = {
            titulo: document.getElementById('tform-titulo').value,
            descripcion: document.getElementById('tform-descripcion').value,
        };
        const assignee = document.getElementById('tform-assignee').value;
        if (assignee) data.assigned_to = assignee;

        try {
            btn.disabled = true;
            errorDiv.classList.add('hidden');

            if (tid) {
                await api.tickets.update(pid, tid, data);
                this.showToast('Ticket actualizado');
                this.navigate('ticket-detail', {pid, tid});
            } else {
                await api.tickets.create(pid, data);
                this.showToast('Ticket creado');
                this.navigate('ticket-board', {pid});
            }
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
            btn.disabled = false;
        }
    },

    async init_ticketDetail() {
        const pid = this.state.params.pid;
        const tid = this.state.params.tid;
        if (!pid || !tid) return this.navigate('projects');

        document.getElementById('tdetail-back-link').onclick = (e) => { e.preventDefault(); this.navigate('ticket-board', {pid}); };
        document.getElementById('btn-tdetail-edit').onclick = () => this.navigate('ticket-form', {pid, tid});
        document.getElementById('btn-tdetail-delete').onclick = () => this.deleteTicket(pid, tid);

        try {
            const [ticketRes, projectRes] = await Promise.all([
                api.tickets.getOne(pid, tid),
                api.projects.getOne(pid)
            ]);

            const ticket = ticketRes.ticket;
            const validTransitions = ticketRes.validTransitions || [];
            const members = projectRes.project.members || [];

            document.getElementById('tdetail-loading').classList.add('hidden');
            document.getElementById('tdetail-content').classList.remove('hidden');

            document.getElementById('td-id').textContent = `#${ticket.id}`;
            
            const estadoLabels = { pendiente: 'Pendiente', en_progreso: 'En Progreso', completado: 'Completado' };
            const badge = document.getElementById('td-estado');
            badge.className = `estado-badge estado-${ticket.estado}`;
            badge.textContent = estadoLabels[ticket.estado];

            document.getElementById('td-titulo').textContent = ticket.titulo;
            document.getElementById('td-desc').textContent = ticket.descripcion;
            document.getElementById('td-creator').textContent = ticket.creator ? ticket.creator.nombre : 'Desconocido';
            document.getElementById('td-date').textContent = new Date(ticket.createdAt).toLocaleDateString();

            const assigneeEl = document.getElementById('td-assignee');
            if (ticket.assignee) {
                assigneeEl.innerHTML = `
                    <span class="avatar-sm" style="background: hsl(${ticket.assigned_to * 67 % 360},60%,45%)">
                        ${ticket.assignee.nombre.charAt(0).toUpperCase()}
                    </span> ${ticket.assignee.nombre}`;
            } else {
                assigneeEl.innerHTML = '<span class="text-dim">Sin asignar</span>';
            }

            const select = document.getElementById('td-reassign-select');
            select.innerHTML = '<option value="">-- Sin asignar --</option>' + 
                members.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
            if (ticket.assigned_to) select.value = ticket.assigned_to;

            const transContainer = document.getElementById('td-transitions-container');
            if (validTransitions.length > 0) {
                const options = validTransitions.map(e => `<option value="${e}">${estadoLabels[e]}</option>`).join('');
                transContainer.innerHTML = `
                    <form onsubmit="app.handleStatusChange(event)">
                        <div class="form-group">
                            <select id="td-status-select" class="form-control">${options}</select>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Mover ticket</button>
                    </form>
                `;
            } else {
                transContainer.innerHTML = '<p class="text-dim" style="font-size:0.85rem;">No hay transiciones disponibles.</p>';
            }

            this._currentTicketData = ticket;

        } catch (error) {
            this.showToast('Error al cargar el ticket', 'error');
            this.navigate('ticket-board', {pid});
        }
    },

    handleStatusChange(e) {
        e.preventDefault();
        const estado = document.getElementById('td-status-select').value;
        this.changeTicketStatus(this.state.params.pid, this.state.params.tid, estado);
    },

    async handleReassign(e) {
        e.preventDefault();
        const pid = this.state.params.pid;
        const tid = this.state.params.tid;
        const assigned_to = document.getElementById('td-reassign-select').value;

        const data = {
            titulo: this._currentTicketData.titulo,
            descripcion: this._currentTicketData.descripcion,
            assigned_to: assigned_to || ''
        };

        try {
            await api.tickets.update(pid, tid, data);
            this.showToast('Responsable actualizado');
            this.init_ticketDetail();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
