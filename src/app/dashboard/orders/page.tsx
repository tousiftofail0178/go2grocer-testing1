'use client';

import { useState, useEffect } from 'react';
import { getBusinessOrders } from '@/lib/actions/orders';
import { BusinessContextSwitcher } from '@/components/lists/BusinessContextSwitcher';
import { Eye } from 'lucide-react';

interface Order {
    id: number;
    reference_number: string;
    created_at: Date;
    total_amount: string;
    status: string;
    placed_by_name: string;
    item_count: number;
}

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch orders when business changes
    useEffect(() => {
        if (selectedBusinessId) {
            loadOrders(selectedBusinessId);
        }
    }, [selectedBusinessId]);

    async function loadOrders(businessId: number) {
        setLoading(true);
        const result = await getBusinessOrders(businessId);

        if (result && result.success && result.orders) {
            setOrders(result.orders);
        } else {
            console.error('Failed to load orders:', result?.error || 'Unknown error');
            setOrders([]); // Set to empty array to prevent crash
        }

        setLoading(false);
    }

    function formatDate(dateString: Date) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function getStatusColor(status: string) {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'delivered':
            case 'completed':
                return { bg: '#d1fae5', text: '#065f46' };
            case 'processing':
            case 'confirmed':
                return { bg: '#bfdbfe', text: '#1e40af' };
            case 'pending':
                return { bg: '#fef3c7', text: '#92400e' };
            case 'cancelled':
            case 'rejected':
                return { bg: '#fee2e2', text: '#991b1b' };
            default:
                return { bg: '#f3f4f6', text: '#374151' };
        }
    }

    return (
        <div style={{
            padding: '2rem',
            maxWidth: '1400px',
            margin: '0 auto',
            position: 'relative' // For modal context
        }}>
            {/* Header */}
            <div style={{
                marginBottom: '2rem'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 0.5rem 0'
                }}>
                    Order History
                </h1>
                <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                }}>
                    Bestelgeschiedenis - View and manage past orders
                </p>
            </div>

            <div style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
            }}>
                <BusinessContextSwitcher
                    onSelect={(businessId) => setSelectedBusinessId(businessId)}
                />
            </div>

            {/* Orders Table */}
            {!selectedBusinessId ? (
                <div style={{
                    padding: '4rem',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        margin: 0
                    }}>
                        Please select a business to view order history
                    </p>
                </div>
            ) : loading ? (
                <div style={{
                    padding: '4rem',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        margin: 0
                    }}>
                        Loading orders...
                    </p>
                </div>
            ) : orders.length === 0 ? (
                <div style={{
                    padding: '4rem',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        margin: 0
                    }}>
                        No past orders found for this business.
                    </p>
                </div>
            ) : (
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr style={{
                                backgroundColor: '#f9fafb',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Order #
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Date
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Placed By
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Status
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'right',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Total
                                </th>
                                <th style={{
                                    padding: '1rem',
                                    textAlign: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => {
                                const statusColor = getStatusColor(order.status);
                                return (
                                    <tr
                                        key={order.id}
                                        style={{
                                            borderBottom: index !== orders.length - 1 ? '1px solid #e5e7eb' : 'none',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                                            {order.reference_number}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#374151' }}>
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#374151' }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 500 }}>{order.placed_by_name}</p>
                                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                                                    {order.item_count} {order.item_count === 1 ? 'product' : 'products'}
                                                </p>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.375rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: statusColor.bg,
                                                color: statusColor.text,
                                                textTransform: 'capitalize'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                                            ৳ {Number(order.total_amount).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setIsModalOpen(true);
                                                }}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    backgroundColor: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; }}
                                            >
                                                <Eye size={16} />
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            width: '100%',
                            maxWidth: '700px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                                    {selectedOrder.reference_number}
                                </h2>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                                    Placed on {formatDate(selectedOrder.created_at)}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {/* X Icon (Simple SVG since lucide import mismatch possible) */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '1.5rem' }}>
                            {/* Delivery Address */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                    Delivery Address
                                </h3>
                                <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                    <p style={{ margin: 0, color: '#111827', fontWeight: 500 }}>
                                        {selectedOrder.shippingAddress?.address || 'N/A'}
                                    </p>
                                    <p style={{ margin: '0.25rem 0 0 0', color: '#4b5563', fontSize: '0.875rem' }}>
                                        {selectedOrder.shippingAddress?.area ? `${selectedOrder.shippingAddress.area}, ` : ''}
                                        {selectedOrder.shippingAddress?.city || ''}
                                    </p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                    Items ({selectedOrder.item_count})
                                </h3>
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                            <tr>
                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Product</th>
                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#4b5563' }}>Qty</th>
                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#4b5563' }}>Price</th>
                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#4b5563' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                selectedOrder.items.map((item: any, idx: number) => (
                                                    <tr key={idx} style={{ borderBottom: idx !== selectedOrder.items.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                                                        <td style={{ padding: '0.75rem 1rem', color: '#111827' }}>{item.productName}</td>
                                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#4b5563' }}>{item.quantity}</td>
                                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#4b5563' }}>৳{Number(item.unitPrice).toFixed(2)}</td>
                                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 500, color: '#111827' }}>৳{Number(item.totalPrice).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No item details available.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Payment Status</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: 700, color: '#14532d' }}>
                                        {selectedOrder.paymentStatus ? selectedOrder.paymentStatus.toUpperCase() : 'UNPAID'}
                                    </p>
                                </div>
                                <div>
                                    {/* Placeholder Upload Button */}
                                    <button style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #10b981',
                                        color: '#10b981',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: 'not-allowed', // Placeholder
                                        opacity: 0.7
                                    }}>
                                        Upload Proof (Coming Soon)
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    padding: '0.625rem 1.25rem',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
