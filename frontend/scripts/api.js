// ============================================
// API CLIENT - Comunicacion con el backend
// ============================================

// Detectar entorno
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

const API_URL = isProduction
    ? 'https://backend-incidencias-caninas.onrender.com/api'
    : 'http://localhost:5000/api';

// Configuracion base para fetch
const api = {
    // GET
    get: async (endpoint, token = null) => {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers
        });
        return await response.json();
    },

    // POST (sin archivos)
    post: async (endpoint, data, token = null) => {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    // POST con FormData (para archivos)
    postFormData: async (endpoint, formData, token = null) => {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });
        return await response.json();
    },

    // PUT
    put: async (endpoint, data, token = null) => {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    // DELETE
    delete: async (endpoint, token = null) => {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers
        });
        return await response.json();
    }
};