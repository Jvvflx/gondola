import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    register: async (name: string, email: string, password: string, tenantName: string) => {
        const response = await api.post('/auth/register', { name, email, password, tenantName });
        return response.data;
    },
};

// Metrics API
export const metricsAPI = {
    getDashboard: async () => {
        const response = await api.get('/api/metrics/dashboard');
        return response.data.data;
    },
    getRuptureAlerts: async () => {
        const response = await api.get('/api/metrics/rupture');
        return response.data.data;
    },
    getExcessAlerts: async () => {
        const response = await api.get('/api/metrics/excess');
        return response.data.data;
    },
    getValidityAlerts: async () => {
        const response = await api.get('/api/metrics/validity');
        return response.data.data;
    },
    getSalesHistory: async (days: number = 30) => {
        const response = await api.get(`/api/metrics/sales-history?days=${days}`);
        return response.data.data;
    },
};

// AI API
export const aiAPI = {
    getPromotionSuggestions: async () => {
        const response = await api.post('/api/ai/suggestions');
        return response.data.data;
    },
    getInsights: async () => {
        const response = await api.get('/api/ai/insights');
        return response.data.data;
    },
};
