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

    getSubLocations: () => apiClient.get('/sublocations').then(res => res.data),
    createSubLocation: (data) => apiClient.post('/sublocations', data).then(res => res.data),
    deleteSubLocation: (id) => apiClient.delete(`/sublocations/${id}`).then(res => res.data),

    getUsers: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return apiClient.get(`/users?${queryString}`).then(res => res.data);
    },
    updateUser: (id, data) => apiClient.put(`/users/${id}`, data).then(res => res.data),

    getTransactions: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return apiClient.get(`/transactions?${queryString}`).then(res => res.data);
    },
    createTransaction: (data) => apiClient.post('/transactions', data).then(res => res.data),
    validateTransaction: (id) => apiClient.post(`/transactions/${id}/validate`).then(res => res.data),
    createReorder: (productId, warehouseId) => apiClient.post(`/transactions/reorder/${productId}/${warehouseId}`).then(res => res.data),
    updateTransaction: (id, data) => apiClient.put(`/transactions/${id}`, data).then(res => res.data),
    completeTransaction: (id) => apiClient.post(`/transactions/${id}/complete`).then(res => res.data),

    getDashboardStats: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return apiClient.get(`/dashboard?${queryString}`).then(res => res.data);
    },
    getDashboardGraphData: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return apiClient.get(`/dashboard/graph?${queryString}`).then(res => res.data);
    },
    getDashboardPieChartData: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return apiClient.get(`/dashboard/pie-chart?${queryString}`).then(res => res.data);
    },

    // Generic methods
    get: (url, config) => apiClient.get(url, config),
    post: (url, data, config) => apiClient.post(url, data, config),
    put: (url, data, config) => apiClient.put(url, data, config),
    delete: (url, config) => apiClient.delete(url, config),
};
