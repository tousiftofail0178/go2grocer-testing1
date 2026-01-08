"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../admin.module.css';
import {
    ArrowLeft, Printer, MoreHorizontal, MapPin,
    CreditCard, Mail, Phone, Edit, Copy
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { toast } from 'react-hot-toast';

interface OrderItems {
    id: number;
    name: string;
    quantity: number;
    price: number;
    total: number;
    image: string;
}

interface OrderDetails {
    id: string;
    date: string;
    email: string;
    phone: string;
    shippingAddress: string;
    billingAddress: string;
    status: string;
    paymentMethod: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    items: OrderItems[];
    customer: {
        name: string;
        ordersCount: number;
    };
}

export default function OrderDetailsPage() {
    const params = useParams();
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [isFulfilled, setIsFulfilled] = useState(false);
    const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!params.orderId) return;
            try {
                const res = await fetch(`/api/admin/orders/${params.orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                    setIsFulfilled(data.status === 'Fulfilled');
                }
            } catch (error) {
                console.error('Failed to fetch order', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [params.orderId]);

    const handleAction = (action: string) => {
        toast.success(`${action} functionality is coming soon!`);
    };

    const handleFulfill = () => {
        setIsFulfillModalOpen(true);
    };

    const confirmFulfillment = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/orders/${params.orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Fulfilled' })
            });

            if (res.ok) {
                setIsFulfilled(true);
                setIsFulfillModalOpen(false);
            } else {
                toast.error('Failed to update order');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Error updating order');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePostComment = () => {
        if (!comment.trim()) return;
        toast.success(`Comment posted: "${comment}"`);
        setComment('');
    };

    if (loading) return <div className={styles.pageHeader} style={{ padding: '2rem' }}>Loading order details...</div>;
    if (!order) return <div className={styles.pageHeader} style={{ padding: '2rem' }}>Order not found</div>;

    const formattedDate = new Date(order.date).toLocaleString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
    });

    return (
        <div>
            {/* Header */}
            <div className={styles.pageHeader} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    <Link href="/admin/orders" style={{ display: 'flex', alignItems: 'center', color: '#5c5f62', textDecoration: 'none' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className={styles.pageTitle}>#{order.id}</h1>
                    <span className={`${styles.badge} ${styles.grey}`}>Paid</span>
                    <span className={`${styles.badge} ${isFulfilled ? styles.success : styles.warning}`}>{isFulfilled ? 'Fulfilled' : order.status}</span>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <button className={styles.secondaryBtn} onClick={() => handleAction('Refund')}>Refund</button>
                        <button className={styles.secondaryBtn} onClick={() => handleAction('Edit')}>Edit</button>
                        <button className={styles.secondaryBtn} onClick={() => window.print()}>Print</button>
                        <button className={styles.secondaryBtn}>More actions <MoreHorizontal size={14} /></button>
                    </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#5c5f62', marginLeft: '2rem' }}>
                    {formattedDate} from Online Store
                </div>
            </div>

            <div className={styles.splitLayout}>

                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Unfulfilled Items Card */}
                    <div className={styles.card}>
                        <div className={styles.formHeader} style={{ justifyContent: 'space-between', borderBottom: 'none', paddingBottom: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className={`${styles.badge} ${isFulfilled ? styles.success : styles.warning}`} style={{ fontSize: '0.9rem' }}>
                                    {isFulfilled ? 'Fulfilled' : 'Unfulfilled'} ({order.items.length})
                                </span>
                            </div>
                            <MoreHorizontal size={16} color="#5c5f62" style={{ cursor: 'pointer' }} />
                        </div>
                        <div className={styles.formContent}>
                            <div className={styles.formSection}>
                                <div className={styles.inputField} style={{ background: '#fff', border: '1px solid #e1e3e5', color: '#333' }}>
                                    <MapPin size={16} /> Shipping
                                </div>
                            </div>

                            {order.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: idx > 0 ? '1px solid #eee' : 'none' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden', border: '1px solid #eee' }}>
                                            {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#007ace', cursor: 'pointer', textDecoration: 'underline' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>SKU: 12345</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.9rem' }}>৳{(item.price / 100).toFixed(2)} × {item.quantity}</div>
                                        <div style={{ fontWeight: 500 }}>৳{(item.total / 100).toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}

                            {!isFulfilled && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                                    <button className={styles.primaryBtn} onClick={handleFulfill}>Mark as fulfilled</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Card */}
                    <div className={styles.card}>
                        <div className={styles.formHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CreditCard size={16} /> Paid
                            </div>
                        </div>
                        <div className={styles.formContent}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                <span>Subtotal</span>
                                <span>{order.items.length} items</span>
                                <span>৳{(order.subtotal / 100).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                <span>Shipping</span>
                                <span>Standard</span>
                                <span>৳{(order.shipping / 100).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                <span>Tax</span>
                                <span>৳{(order.tax / 100).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                <span>Total</span>
                                <span>৳{(order.total / 100).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666', paddingTop: '0.5rem' }}>
                                <span>Paid by customer</span>
                                <span>৳{(order.total / 100).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className={styles.card}>
                        <div className={styles.formHeader}>Timeline</div>
                        <div className={styles.formContent}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ width: 40, height: 40, background: '#a66afe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#fff' }}>
                                    {order.customer.name.charAt(0)}
                                </div>
                                <div className={styles.inputField} style={{ flex: 1, marginTop: 0 }}>
                                    <input
                                        type="text"
                                        placeholder="Leave a comment..."
                                        style={{ border: 'none', background: 'none', width: '100%', outline: 'none' }}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                        <button
                                            className={styles.secondaryBtn}
                                            onClick={handlePostComment}
                                            disabled={!comment.trim()}
                                        >
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Notes */}
                    <div className={styles.card}>
                        <div className={styles.formHeader} style={{ justifyContent: 'space-between' }}>
                            Notes <Edit size={14} color="#5c5f62" style={{ cursor: 'pointer' }} onClick={() => handleAction('Edit Notes')} />
                        </div>
                        <div className={styles.formContent} style={{ color: '#666', fontSize: '0.9rem' }}>
                            No notes from customer
                        </div>
                    </div>

                    {/* Customer */}
                    <div className={styles.card}>
                        <div className={styles.formHeader} style={{ justifyContent: 'space-between' }}>
                            Customer
                        </div>
                        <div className={styles.formContent}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', color: '#007ace', cursor: 'pointer' }}>
                                {order.customer.name}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                                {order.customer.ordersCount} orders
                            </div>

                            <div style={{ borderTop: '1px solid #eee', margin: '0.5rem 0' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Contact information</span>
                                <Edit size={14} color="#5c5f62" style={{ cursor: 'pointer' }} />
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#007ace', marginBottom: '0.25rem' }}>{order.email}</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>{order.phone}</div>

                            <div style={{ borderTop: '1px solid #eee', margin: '1rem 0' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Shipping address</span>
                                <Edit size={14} color="#5c5f62" style={{ cursor: 'pointer' }} />
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>{order.shippingAddress}</div>

                            <div style={{ borderTop: '1px solid #eee', margin: '1rem 0' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Billing address</span>
                                <Edit size={14} color="#5c5f62" style={{ cursor: 'pointer' }} />
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>{order.billingAddress}</div>

                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isFulfillModalOpen}
                onClose={() => setIsFulfillModalOpen(false)}
                onConfirm={confirmFulfillment}
                title="Fulfill Order"
                message={
                    <div>
                        <p>Are you sure you want to mark this order as fulfilled?</p>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>This will update the fulfillment status to <strong>Fulfilled</strong>. This action cannot be undone.</p>
                    </div>
                }
                confirmText="Mark as Fulfilled"
                isLoading={isProcessing}
            />
        </div>
    );
}
