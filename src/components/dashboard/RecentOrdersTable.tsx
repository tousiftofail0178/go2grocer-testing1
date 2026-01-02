"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import styles from './RecentOrdersTable.module.css';

interface Order {
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: 'pending' | 'processing' | 'fulfilled' | 'cancelled';
    date: string;
}

export default function RecentOrdersTable() {
    // Mock data - will be replaced with real data
    const recentOrders: Order[] = [
        { id: '1', orderNumber: '#1024', customer: 'Farhan Ahmed', total: 1200, status: 'pending', date: 'Today at 4:30 pm' },
        { id: '2', orderNumber: '#1023', customer: 'Rubaba Islam', total: 450, status: 'processing', date: 'Today at 2:15 pm' },
        { id: '3', orderNumber: '#1022', customer: 'Sarah Khan', total: 850, status: 'fulfilled', date: 'Yesterday' },
        { id: '4', orderNumber: '#1021', customer: 'Ahmed Ali', total: 320, status: 'fulfilled', date: 'Yesterday' },
        { id: '5', orderNumber: '#1020', customer: 'Nadia Rahman', total: 670, status: 'cancelled', date: '2 days ago' },
    ];

    const getStatusBadge = (status: Order['status']) => {
        const config = {
            pending: { className: styles.statusPending, icon: Clock },
            processing: { className: styles.statusProcessing, icon: Loader2 },
            fulfilled: { className: styles.statusFulfilled, icon: CheckCircle2 },
            cancelled: { className: styles.statusCancelled, icon: XCircle },
        };

        const { className, icon: Icon } = config[status];
        return (
            <span className={`${styles.statusBadge} ${className}`}>
                <Icon size={14} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Recent Orders</h3>
                <Link href="/admin/orders" className={styles.viewAllLink}>
                    View All <ArrowRight size={16} />
                </Link>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map((order) => (
                            <tr key={order.id}>
                                <td>
                                    <Link href={`/admin/orders/${order.id}`} className={styles.orderLink}>
                                        {order.orderNumber}
                                    </Link>
                                </td>
                                <td>
                                    <p className={styles.customerName}>{order.customer}</p>
                                </td>
                                <td>
                                    <p className={styles.orderTotal}>৳{order.total.toLocaleString()}</p>
                                </td>
                                <td>
                                    {getStatusBadge(order.status)}
                                </td>
                                <td>
                                    <p className={styles.orderDate}>{order.date}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
