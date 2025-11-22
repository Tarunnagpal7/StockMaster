const API_URL = import.meta.VITE_APP_URL || 'http://localhost:3001/api';

async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Handle unauthorized (logout)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || 'An error occurred');
    }

    return response.json();
}

export const api = {
    login: (credentials) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    signup: (data) => fetchWithAuth('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    resetOtp: (email) => fetchWithAuth('/auth/reset-otp', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (data) => fetchWithAuth('/auth/reset', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => fetchWithAuth('/auth/me'),
    register: (data) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    getProducts: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return fetchWithAuth(`/products?${queryString}`);
    },
    getProduct: (id) => fetchWithAuth(`/products/${id}`),
    getProductStock: (id) => fetchWithAuth(`/products/${id}/stock`),
    createProduct: (data) => fetchWithAuth('/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id, data) => fetchWithAuth(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id) => fetchWithAuth(`/products/${id}`, { method: 'DELETE' }),

    getWarehouses: () => fetchWithAuth('/warehouses'),
    createWarehouse: (data) => fetchWithAuth('/warehouses', { method: 'POST', body: JSON.stringify(data) }),

    getLocations: () => fetchWithAuth('/locations'),
    createLocation: (data) => fetchWithAuth('/locations', { method: 'POST', body: JSON.stringify(data) }),
    deleteLocation: (id) => fetchWithAuth(`/locations/${id}`, { method: 'DELETE' }),

    getUsers: () => fetchWithAuth('/users'),
    updateUser: (id, data) => fetchWithAuth(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    getTransactions: () => fetchWithAuth('/transactions'),
    createTransaction: (data) => fetchWithAuth('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    validateTransaction: (id) => fetchWithAuth(`/transactions/${id}/validate`, { method: 'POST' }),

    getDashboardStats: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return fetchWithAuth(`/dashboard?${queryString}`);
    },
};
