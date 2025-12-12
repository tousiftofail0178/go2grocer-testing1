import axios, { AxiosRequestConfig } from 'axios';
import { Product, Category, User, CartItem, categories, products } from './data';

export interface LoginResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: User;
}

export interface OrderData {
    items: CartItem[];
    total: number;
    deliveryFee: number;
    shippingAddress: {
        address: string;
        area: string;
        city: string;
    };
    paymentMethod: string;
    deliveryTime: string;
}

// Use environment variable or default to localhost for now
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to inject JWT token
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: async (phone: string): Promise<LoginResponse> => {
        // Mock response for now if no backend
        if (!process.env.NEXT_PUBLIC_API_URL) {
            return { success: true, message: 'OTP sent' };
        }
        const response = await api.post('/auth/login', { phone });
        return response.data;
    },
    verifyOtp: async (phone: string, otp: string) => {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            // Mock success for dev code 123456
            if (otp === '123456') {
                return {
                    token: 'mock-jwt-token',
                    user: { id: 1, name: 'Test User', phone }
                };
            }
            throw new Error('Invalid OTP');
        }
        const response = await api.post('/auth/verify', { phone, otp });
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },
};

export const productApi = {
    getCategories: async () => {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return categories;
        }
        const response = await api.get('/categories');
        return response.data;
    },
    getProducts: async (params?: Record<string, string | number | boolean>) => {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            await new Promise(resolve => setTimeout(resolve, 300));
            // Basic filtering/sorting mock
            let result = [...products];
            if (params?.limit) {
                result = result.slice(0, Number(params.limit));
            }
            return result;
        }
        const response = await api.get('/products', { params });
        return response.data;
    },
    getProduct: async (id: string) => {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return products.find(p => p.id.toString() === id.toString()) || null;
        }
        const response = await api.get(`/products/${id}`);
        return response.data;
    },
};

export const cartApi = {
    syncCart: async (items: CartItem[]) => {
        const response = await api.post('/cart/sync', { items });
        return response.data;
    },
};

export const orderApi = {
    createOrder: async (orderData: OrderData) => {
        // Mock success for now if no backend
        if (!process.env.NEXT_PUBLIC_API_URL) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
            return { success: true, orderId: Math.floor(Math.random() * 10000) };
        }
        const response = await api.post('/orders', orderData);
        return response.data;
    },
    getOrders: async () => {
        // Mock data if no backend
        if (!process.env.NEXT_PUBLIC_API_URL) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return [
                { id: 101, date: '2023-11-20', total: 1250, status: 'Delivered', items: 5 },
                { id: 102, date: '2023-11-15', total: 450, status: 'Processing', items: 2 },
            ];
        }
        const response = await api.get('/orders');
        return response.data;
    },
};

export default api;
