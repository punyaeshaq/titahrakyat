import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authApi = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.access_token) {
            localStorage.setItem('auth_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (name: string, email: string, password: string, password_confirmation: string) => {
        const response = await api.post('/auth/register', { name, email, password, password_confirmation });
        if (response.data.access_token) {
            localStorage.setItem('auth_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: async () => {
        try { await api.post('/auth/logout'); }
        finally { localStorage.removeItem('auth_token'); localStorage.removeItem('user'); }
    },

    me: async () => (await api.get('/auth/me')).data,
    getStoredUser: () => { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; },
    isAuthenticated: () => !!localStorage.getItem('auth_token'),
    changePassword: async (data: any) => (await api.post('/auth/change-password', data)).data,
};

// Articles API
export const articlesApi = {
    getAll: async (params?: { status?: string; category?: string; featured?: boolean; breaking?: boolean; search?: string; per_page?: number; page?: number }) =>
        (await api.get('/articles', { params })).data,
    getAdminAll: async (params?: { page?: number; per_page?: number; search?: string; status?: string; category?: string }) =>
        (await api.get('/admin/articles', { params })).data,
    getBySlug: async (slug: string) => (await api.get(`/articles/${slug}`)).data,
    create: async (data: any) => (await api.post('/articles', data)).data,
    update: async (id: string, data: any) => (await api.put(`/articles/${id}`, data)).data,
    delete: async (id: string) => (await api.delete(`/articles/${id}`)).data,
};

// Categories API (full CRUD)
export const categoriesApi = {
    getAll: async () => (await api.get('/categories')).data,
    getById: async (id: string) => (await api.get(`/categories/${id}`)).data,
    create: async (data: { id?: string; label: string; color: string }) => (await api.post('/categories', data)).data,
    update: async (id: string, data: { label?: string; color?: string }) => (await api.put(`/categories/${id}`, data)).data,
    delete: async (id: string) => (await api.delete(`/categories/${id}`)).data,
};

// Comments API (public and admin)
export const commentsApi = {
    getByArticle: async (articleId: string) => (await api.get(`/articles/${articleId}/comments`)).data,
    create: async (articleId: string, data: { name: string; email: string; content: string }) =>
        (await api.post(`/articles/${articleId}/comments`, data)).data,
    // Admin endpoints
    getAll: async () => (await api.get('/admin/comments')).data,
    approve: async (id: string) => (await api.post(`/comments/${id}/approve`)).data,
    delete: async (id: string) => (await api.delete(`/comments/${id}`)).data,
};

// Breaking News API
export const breakingNewsApi = {
    getAll: async () => (await api.get('/breaking-news')).data,
    create: async (text: string) => (await api.post('/breaking-news', { text })).data,
    update: async (id: string, data: { text?: string; is_active?: boolean }) => (await api.put(`/breaking-news/${id}`, data)).data,
    delete: async (id: string) => (await api.delete(`/breaking-news/${id}`)).data,
};

// Settings API
export const settingsApi = {
    getAll: async () => (await api.get('/settings')).data,
    update: async (settings: Record<string, string>) => (await api.put('/settings', { settings })).data,
    getEditorialStaff: async () => (await api.get('/settings/editorial-staff')).data,
    getSocialLinks: async () => (await api.get('/settings/social-links')).data,
};

// Editorial Staff API
export const editorialStaffApi = {
    getAll: async () => (await api.get('/editorial-staff')).data,
    create: async (data: { name: string; position: string; photo_url?: string; sort_order?: number }) =>
        (await api.post('/editorial-staff', data)).data,
    update: async (id: string, data: any) => (await api.put(`/editorial-staff/${id}`, data)).data,
    delete: async (id: string) => (await api.delete(`/editorial-staff/${id}`)).data,
};

// Social Links API
export const socialLinksApi = {
    getAll: async () => (await api.get('/social-links')).data,
    create: async (data: { platform: string; url: string; icon?: string; sort_order?: number }) =>
        (await api.post('/social-links', data)).data,
    update: async (id: string, data: any) => (await api.put(`/social-links/${id}`, data)).data,
    delete: async (id: string) => (await api.delete(`/social-links/${id}`)).data,
};

// Videos API (full CRUD)
export const videosApi = {
    getAll: async (params?: { featured?: boolean; page?: number }) => (await api.get('/videos', { params })).data,
    getById: async (id: string) => (await api.get(`/videos/${id}`)).data,
    create: async (data: { title: string; description?: string; youtube_url: string; thumbnail_url?: string; is_featured?: boolean }) =>
        (await api.post('/videos', data)).data,
    update: async (id: string, data: any) => (await api.put(`/videos/${id}`, data)).data,
    delete: async (id: string) => (await api.delete(`/videos/${id}`)).data,
};

// Activity Logs API
export const activityLogsApi = {
    getAll: async (limit?: number) => (await api.get('/activity-logs', { params: { limit } })).data,
};

// Users API (admin)
export const usersApi = {
    getAll: async () => (await api.get('/admin/users')).data,
    create: async (data: any) => (await api.post('/admin/users', data)).data,
    updateRole: async (id: string, role: string) => (await api.put(`/admin/users/${id}/role`, { role })).data,
    delete: async (id: string) => (await api.delete(`/admin/users/${id}`)).data,
};

// Upload API
export const uploadApi = {
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return (await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
    },
};

