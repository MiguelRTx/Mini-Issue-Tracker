const API_URL = 'http://localhost:3000/api';

const api = {
    getToken() {
        return localStorage.getItem('authToken');
    },

    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Ocurrió un error');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    auth: {
        login: (credentials) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
        register: (data) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
        getUsers: () => api.request('/auth/users')
    },

    projects: {
        getAll: () => api.request('/projects'),
        getOne: (id) => api.request(`/projects/${id}`),
        create: (data) => api.request('/projects', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => api.request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => api.request(`/projects/${id}`, { method: 'DELETE' }),
        addMember: (projectId, email) => api.request(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ email }) }),
        removeMember: (projectId, memberId) => api.request(`/projects/${projectId}/members/${memberId}`, { method: 'DELETE' })
    },

    tickets: {
        getBoard: (projectId) => api.request(`/projects/${projectId}/tickets`),
        getOne: (projectId, ticketId) => api.request(`/projects/${projectId}/tickets/${ticketId}`),
        create: (projectId, data) => api.request(`/projects/${projectId}/tickets`, { method: 'POST', body: JSON.stringify(data) }),
        update: (projectId, ticketId, data) => api.request(`/projects/${projectId}/tickets/${ticketId}`, { method: 'PUT', body: JSON.stringify(data) }),
        changeStatus: (projectId, ticketId, estado) => api.request(`/projects/${projectId}/tickets/${ticketId}/status`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
        delete: (projectId, ticketId) => api.request(`/projects/${projectId}/tickets/${ticketId}`, { method: 'DELETE' })
    }
};
