import { create } from 'zustand';

interface UIState {
    isCartOpen: boolean;
    isMobileMenuOpen: boolean;
    toggleCart: () => void;
    toggleMobileMenu: () => void;
    closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isCartOpen: false,
    isMobileMenuOpen: false,
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    closeAll: () => set({ isCartOpen: false, isMobileMenuOpen: false }),
}));
