"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useOrderStore } from '@/store/useOrderStore';
import styles from './page.module.css';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');
    const { getOrder } = useOrderStore();
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        if (orderId) {
            const foundOrder = getOrder(orderId);
            if (foundOrder) {
                setOrder(foundOrder);
            }
        }
    }, [orderId, getOrder]);

    if (!orderId) {
        return (
            <div className={styles.container}>
                <p>Order not found.</p>
                <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.successIcon}>
                    <CheckCircle size={64} />
                </div>
                <h1 className={styles.title}>Thank You!</h1>
                <p className={styles.subtitle}>Your order has been placed successfully.</p>

                <div className={styles.orderInfo}>
                    <div className={styles.infoRow}>
                        <span>Order ID:</span>
                        <span className={styles.highlight}>#{orderId}</span>
                    </div>
                    {order && (
                        <>
                            <div className={styles.infoRow}>
                                <span>Date:</span>
                                <span>{order.date}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span>Total Amount:</span>
                                <span className={styles.highlight}>৳{order.total}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span>Payment Method:</span>
                                <span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.actions}>
                    <Button onClick={() => router.push('/shop')} icon={<ShoppingBag size={18} />}>
                        Continue Shopping
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/profile')} icon={<ArrowRight size={18} />}>
                        View Order History
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
