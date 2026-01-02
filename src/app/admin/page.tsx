"use client";

import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import MetricCard from '@/components/dashboard/MetricCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';
import TopProductsList from '@/components/dashboard/TopProductsList';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        // Check authentication
        if (!user) {
            router.push('/login');
            return;
        }

        // Update time every second
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }));
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, [user, router]);

    // Mock metrics - these will be replaced with real data from API
    const metrics = {
        revenue: {
            total: 24500,
            trend: { value: 12.5, isPositive: true }
        },
        orders: {
            total: 18,
            trend: { value: 8.3, isPositive: true }
        },
        customers: {
            total: 32,
            subtitle: 'Currently online'
        },
        products: {
            total: 156,
            lowStock: 8
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.welcomeText}>
                        <h1>Welcome back, {user?.name || 'Admin'}! 👋</h1>
                        <p>{currentTime}</p>
                    </div>
                    <QuickActions />
                </div>
            </div>

            {/* Key Metrics */}
            <div className={styles.metricsGrid}>
                <MetricCard
                    title="Total Revenue"
                    value={`Tk ${metrics.revenue.total.toLocaleString()}`}
                    icon={DollarSign}
                    trend={metrics.revenue.trend}
                    iconColor="#10b981"
                    iconBgColor="#d1fae5"
                    onClick={() => router.push('/admin/analytics')}
                />
                <MetricCard
                    title="Total Orders"
                    value={metrics.orders.total}
                    icon={ShoppingCart}
                    trend={metrics.orders.trend}
                    subtitle="4 to fulfill"
                    iconColor="#3b82f6"
                    iconBgColor="#dbeafe"
                    onClick={() => router.push('/admin/orders')}
                />
                <MetricCard
                    title="Active Sessions"
                    value={metrics.customers.total}
                    icon={Users}
                    subtitle={metrics.customers.subtitle}
                    iconColor="#8b5cf6"
                    iconBgColor="#ede9fe"
                    onClick={() => router.push('/admin/customers')}
                />
                <MetricCard
                    title="Products"
                    value={metrics.products.total}
                    icon={Package}
                    subtitle={`${metrics.products.lowStock} low stock items`}
                    iconColor="#f59e0b"
                    iconBgColor="#fef3c7"
                    onClick={() => router.push('/admin/products')}
                />
            </div>

            {/* Charts Section */}
            <div className={styles.chartsSection}>
                {/* Sales Overview Chart - Placeholder */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Sales Overview</h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Monthly revenue trends</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                                Daily
                            </button>
                            <button style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', backgroundColor: 'transparent', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                                Weekly
                            </button>
                            <button style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', backgroundColor: 'transparent', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                                Monthly
                            </button>
                        </div>
                    </div>

                    <div style={{ height: '16rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)', borderRadius: '0.5rem', border: '2px dashed #e5e7eb' }}>
                        <div style={{ textAlign: 'center' }}>
                            <TrendingUp size={48} color="#9ca3af" style={{ margin: '0 auto 0.5rem auto' }} />
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500, margin: 0 }}>Sales Chart Coming Soon</p>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Integrate with Recharts or Chart.js</p>
                        </div>
                    </div>
                </div>

                {/* Order Status Breakdown */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Order Status</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Current order distribution</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fde68a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: '#f59e0b' }}></div>
                                <span style={{ fontWeight: 500, color: '#111827' }}>Pending</span>
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>5</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: '#3b82f6' }}></div>
                                <span style={{ fontWeight: 500, color: '#111827' }}>Processing</span>
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>8</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '0.5rem', border: '1px solid #a7f3d0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: '#10b981' }}></div>
                                <span style={{ fontWeight: 500, color: '#111827' }}>Fulfilled</span>
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>4</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: '#ef4444' }}></div>
                                <span style={{ fontWeight: 500, color: '#111827' }}>Cancelled</span>
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>1</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className={styles.bottomSection}>
                <RecentOrdersTable />
                <TopProductsList />
            </div>

            {/* Low Stock Alert */}
            {metrics.products.lowStock > 0 && (
                <div className={styles.alertBox}>
                    <AlertCircle color="#c2410c" size={20} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                    <div className={styles.alertText}>
                        <p>Low Stock Alert</p>
                        <p>
                            {metrics.products.lowStock} products are running low on stock.
                            <a href="/admin/products">View products</a>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
