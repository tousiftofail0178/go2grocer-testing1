import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/lib/data';

export interface Order {
    id: string;
    date: string;
    items: CartItem[];
    total: number;
    deliveryFee: number;
    status: 'Processing' | 'Delivered' | 'Cancelled';
    shippingAddress: {
        address: string;
        area: string;
        city: string;
        phone: string;
        name: string;
    };
    paymentMethod: string;
}

interface OrderState {
    orders: Order[];
    addOrder: (order: Order) => void;
    getOrder: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            orders: [],
            addOrder: (order) => set((state) => ({
                orders: [order, ...state.orders]
            })),
            getOrder: (id) => get().orders.find((o) => o.id === id)
        }),
        {
            name: 'order-storage',
        }
    )
);
