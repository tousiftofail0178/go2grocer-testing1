

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import { User, BusinessEntity } from '@/lib/data';

// Basic Address interface
interface Address {
    id: string;
    label: string; // Home, Work, etc.
    fullAddress: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    addresses: Address[];
    selectedAddress: Address | null;
    businesses: BusinessEntity[];
    selectedBusiness: BusinessEntity | null;

    login: (phone: string) => Promise<void>;
    loginB2B: (userId: string, password: string) => Promise<void>;
    signup: (data: { name: string; email: string; phone: string }) => Promise<void>;
    signupB2B: (data: {
        businessName: string;
        userId: string;
        password: string;
        contactName: string;
        phone: string;
        email: string;
        address: string;
        bin?: string;
        tin?: string;
        vat?: string;
        bankName?: string;
        bankAccount?: string;
        bankBranch?: string;
    }) => Promise<void>;
    updateProfile: (data: { name: string; email: string }) => Promise<void>;
    verifyOtp: (phone: string, otp: string) => Promise<void>;
    logout: () => void;
    addAddress: (address: Address) => void;
    updateAddress: (address: Address) => void;
    selectAddress: (address: Address) => void;
    selectBusiness: (business: BusinessEntity) => void;
    registerBusiness: (business: Omit<BusinessEntity, 'id'>) => Promise<void>;
    sendBusinessRegistrationOtp: () => Promise<void>;
    verifyBusinessRegistrationOtp: (otp: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            addresses: [
                { id: '1', label: 'Home', fullAddress: 'Nasirabad, Chittagong' }
            ],
            selectedAddress: { id: '1', label: 'Home', fullAddress: 'Nasirabad, Chittagong' },
            businesses: [],
            selectedBusiness: null,

            addAddress: (address) => set((state) => ({
                addresses: [...state.addresses, address],
                selectedAddress: address // Auto-select new address
            })),

            updateAddress: (updatedAddress) => set((state) => ({
                addresses: state.addresses.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr),
                selectedAddress: state.selectedAddress?.id === updatedAddress.id ? updatedAddress : state.selectedAddress
            })),

            selectAddress: (address) => set({ selectedAddress: address }),

            selectBusiness: (business) => set({ selectedBusiness: business }),

            registerBusiness: async (business) => {
                set({ isLoading: true, error: null });
                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    set((state) => {
                        const newBusiness = { ...business, id: Date.now().toString() };
                        const isFirst = state.businesses.length === 0;
                        return {
                            isLoading: false,
                            businesses: [...state.businesses, newBusiness],
                            selectedBusiness: isFirst ? newBusiness : state.selectedBusiness
                        };
                    });
                } catch (error) {
                    set({ isLoading: false, error: 'Failed to register business' });
                    throw error;
                }
            },

            sendBusinessRegistrationOtp: async () => {
                set({ isLoading: true, error: null });
                try {
                    // Simulate API call to send OTP to user's registered phone
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    set({ isLoading: false });
                    console.log('OTP sent to registered phone');
                } catch (error) {
                    set({ isLoading: false, error: 'Failed to send OTP' });
                    throw error;
                }
            },

            verifyBusinessRegistrationOtp: async (otp) => {
                set({ isLoading: true, error: null });
                try {
                    // Simulate API verification
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    if (otp === '1234') { // Mock OTP
                        set({ isLoading: false });
                        return true;
                    } else {
                        throw new Error('Invalid OTP');
                    }
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Invalid OTP';
                    set({ isLoading: false, error: message });
                    return false;
                }
            },

            login: async (phone: string) => {
                set({ isLoading: true, error: null });
                try {
                    await authApi.login(phone);
                    set({ isLoading: false });
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to send OTP';
                    set({ isLoading: false, error: message });
                    throw error;
                }
            },

            signup: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    // Simulate signup API call
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    set({
                        user: {
                            id: 'new-user-' + Date.now(),
                            name: data.name,
                            phone: data.phone,
                            email: data.email,
                            role: 'consumer'
                        },
                        token: 'mock-jwt-token-signup',
                        isAuthenticated: true,
                        isLoading: false
                    });

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('token', 'mock-jwt-token-signup');
                    }
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to sign up';
                    set({ isLoading: false, error: message });
                    throw error;
                }
            },

            signupB2B: async (data: {
                businessName: string;
                userId: string;
                password: string;
                contactName: string;
                phone: string;
                email: string;
                address: string;
                bin?: string;
                tin?: string;
                vat?: string;
                bankName?: string;
                bankAccount?: string;
                bankBranch?: string;
            }) => {
                set({ isLoading: true, error: null });
                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    set({
                        user: {
                            id: 'new-b2b-' + Date.now(),
                            name: data.businessName, // Use business name as display name
                            phone: data.phone,
                            email: data.email,
                            role: 'b2b',
                            // b2bRole removed from input
                        },
                        token: 'mock-jwt-token-b2b-signup',
                        isAuthenticated: true,
                        isLoading: false
                    });

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('token', 'mock-jwt-token-b2b-signup');
                    }
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to register business';
                    set({ isLoading: false, error: message });
                    throw error;
                }
            },

            updateProfile: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    set(state => ({
                        user: state.user ? { ...state.user, ...data } : null,
                        isLoading: false
                    }));
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Failed to update profile';
                    set({ isLoading: false, error: message });
                    throw error;
                }
            },

            verifyOtp: async (phone: string, otp: string) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authApi.verifyOtp(phone, otp);
                    set({
                        user: data.user,
                        token: data.token || null,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    // Store token in localStorage for API interceptor
                    if (typeof window !== 'undefined' && data.token) {
                        localStorage.setItem('token', data.token);
                    }
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Invalid OTP';
                    set({ isLoading: false, error: message });
                    throw error;
                }
            },

            loginB2B: async (userId, password) => {
                set({ isLoading: true, error: null });
                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const validUsers: { [key: string]: { role: string, name: string } } = {
                        'G2G-001': { role: 'Admin', name: 'System Admin' },
                        'G2G-002': { role: 'Owner', name: 'Business Owner' },
                        'G2G-003': { role: 'Manager', name: 'Store Manager' },
                        'B2B_CLIENT_01': { role: 'b2b', name: 'B2B Client 01' } // Keep legacy for now
                    };

                    if (validUsers[userId] && password === '1234') {
                        set({
                            user: {
                                id: userId.toLowerCase().replace('-', ''),
                                name: validUsers[userId].name,
                                phone: '01000000000',
                                role: validUsers[userId].role.toLowerCase() as User['role']
                            },
                            token: `mock-jwt-token-${userId}`,
                            isAuthenticated: true,
                            isLoading: false
                        });
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('token', `mock-jwt-token-${userId}`);
                        }
                    } else if (userId === 'B2B_CLIENT_01' && password === 'password123') {
                        set({
                            user: {
                                id: 'b2b-01',
                                name: 'B2B Client 01',
                                phone: '01000000000',
                                role: 'b2b'
                            },
                            token: 'mock-jwt-token-b2b',
                            isAuthenticated: true,
                            isLoading: false
                        });
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('token', 'mock-jwt-token-b2b');
                        }
                    } else {
                        throw new Error('Invalid User ID or Password');
                    }
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Login failed';
                    set({ isLoading: false, error: message });
                    throw error;
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                addresses: state.addresses,
                selectedAddress: state.selectedAddress,
                businesses: state.businesses,
                selectedBusiness: state.selectedBusiness
            }),
        }
    )
);
