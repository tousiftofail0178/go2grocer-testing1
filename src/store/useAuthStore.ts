

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
    updateBusiness: (id: string, data: Partial<BusinessEntity>) => Promise<void>;
    sendBusinessRegistrationOtp: () => Promise<void>;
    verifyBusinessRegistrationOtp: (otp: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
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

            updateBusiness: async (id, data) => {
                set({ isLoading: true, error: null });
                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    set(state => ({
                        businesses: state.businesses.map(b => b.id === id ? { ...b, ...data } : b),
                        isLoading: false
                    }));
                    // If the updated business was selected, update it
                    const currentSelected = get().selectedBusiness;
                    if (currentSelected?.id === id) {
                        set(state => ({
                            selectedBusiness: { ...currentSelected, ...data }
                        }));
                    }
                } catch (error: unknown) {
                    set({ error: (error as Error).message, isLoading: false });
                    throw error;
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
            }) => {
                set({ isLoading: true, error: null });
                try {
                    // Import dynamically to avoid server-on-client issues if not careful, 
                    // though Next.js handles 'use server' imports well usually.
                    const { registerB2BUser } = await import('@/app/actions/auth');

                    const result = await registerB2BUser({
                        businessName: data.businessName,
                        userId: data.userId,
                        password: data.password,
                        phone: data.phone,
                        email: data.email,
                        role: 'owner', // Defaulting for signup form
                    });

                    if (!result.success || !result.user) {
                        throw new Error(result.error);
                    }

                    set({
                        user: result.user,
                        token: `mock-jwt-token-${result.user.id}`,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('token', `mock-jwt-token-${result.user.id}`);
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
                    const currentUser = get().user;
                    if (!currentUser) throw new Error('No user logged in');

                    // Call Server Action
                    const { updateUserProfile } = await import('@/app/actions/auth');
                    const result = await updateUserProfile(currentUser.id.toString(), data);

                    if (!result.success) throw new Error(result.error);

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
                    // Call Server Action for DB user lookup/creation
                    const { verifyOtpUser } = await import('@/app/actions/auth');

                    // Simulate OTP check (mock 123456 as per api.ts or 1234 as per modal?)
                    // The previous authApi had 123456. The modal has 1234. Let's support both or just assume valid for now since we don't have SMS.
                    // Ideally check OTP first. 
                    if (otp !== '1234' && otp !== '123456') throw new Error('Invalid OTP');

                    const result = await verifyOtpUser(phone);

                    if (!result.success || !result.user) {
                        throw new Error(result.error || 'Verification failed');
                    }

                    // Mock token since we aren't doing real JWT yet
                    const token = `mock-token-${result.user.id}`;

                    set({
                        user: result.user,
                        token: token,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('token', token);
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
                    const { authenticateUser } = await import('@/app/actions/auth');
                    const result = await authenticateUser(userId, password);

                    if (result.success && result.user) {
                        // Map DB businesses to BusinessEntity (transform id to string)
                        const mappedBusinesses: BusinessEntity[] = (result.businesses || []).map((b: any) => ({
                            id: b.id.toString(),
                            name: b.name,
                            address: b.address,
                            phone: b.phone,
                            tin: b.tin || undefined,
                            bin: b.bin || undefined,
                        }));

                        set({
                            user: result.user,
                            businesses: mappedBusinesses,
                            token: `mock-jwt-token-${result.user.id}`,
                            isAuthenticated: true,
                            isLoading: false
                        });
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('token', `mock-jwt-token-${result.user.id}`);
                        }
                    } else {
                        throw new Error(result.error || 'Invalid User ID or Password');
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
