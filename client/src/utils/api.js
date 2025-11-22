import axios from 'axios';

const API_URL = import.meta.VITE_APP_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('token', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error.response?.data || error);
    }
);

export const api = {
    login: (credentials) => apiClient.post('/auth/login', credentials).then(res => res.data),
    signup: (data) => apiClient.post('/auth/signup', data).then(res => res.data),
    resetOtp: (email) => apiClient.post('/auth/reset-otp', { email }).then(res => res.data),
    resetPassword: (data) => apiClient.post('/auth/reset', data).then(res => res.data),
    getMe: () => apiClient.get('/auth/me').then(res => res.data),
    register: (data) => apiClient.post('/auth/register', data).then(res => res.data),

    getProducts: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return apiClient.get(`/products?${queryString}`).then(res => res.data);
    },
    getProduct: (id) => apiClient.get(`/products/${id}`).then(res => res.data),
    getProductStock: (id) => apiClient.get(`/products/${id}/stock`).then(res => res.data),
    createProduct: (data) => apiClient.post('/products', data).then(res => res.data),
    updateProduct: (id, data) => apiClient.put(`/products/${id}`, data).then(res => res.data),
    deleteProduct: (id) => apiClient.delete(`/products/${id}`).then(res => res.data),

    getWarehouses: () => apiClient.get('/warehouses').then(res => res.data),
    createWarehouse: (data) => apiClient.post('/warehouses', data).then(res => res.data),

    getLocations: () => apiClient.get('/locations').then(res => res.data),
    createLocation: (data) => apiClient.post('/locations', data).then(res => res.data),
    deleteLocation: (id) => apiClient.delete(`/locations/${id}`).then(res => res.data),

    getUsers: () => apiClient.get('/users').then(res => res.data),
    updateUser: (id, data) => apiClient.put(`/users/${id}`, data).then(res => res.data),

    getTransactions: () => fetchWithAuth('/transactions'),
    createTransaction: (data) => fetchWithAuth('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    validateTransaction: (id) => fetchWithAuth(`/transactions/${id}/validate`, { method: 'POST' }),
    createReorder: (productId, warehouseId) => fetchWithAuth(`/transactions/reorder/${productId}/${warehouseId}`, { method: 'POST' }),
    updateTransaction: (id, data) => fetchWithAuth(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    completeTransaction: (id) => fetchWithAuth(`/transactions/${id}/complete`, { method: 'POST' }),

    getDashboardStats: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return apiClient.get(`/dashboard?${queryString}`).then(res => res.data);
    },
    getDashboardGraphData: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return apiClient.get(`/dashboard/graph?${queryString}`).then(res => res.data);
    },

    // Generic methods
    get: (url, config) => apiClient.get(url, config),
    post: (url, data, config) => apiClient.post(url, data, config),
    put: (url, data, config) => apiClient.put(url, data, config),
    delete: (url, config) => apiClient.delete(url, config),
};
