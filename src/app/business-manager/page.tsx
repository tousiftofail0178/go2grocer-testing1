"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ShoppingBag, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function BusinessManagerDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    // Check if user is business manager
    React.useEffect(() => {
        if (!user || user.role !== 'business_manager') {
            router.push('/');
        }
    }, [user, router]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <header style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e7eb',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Business Manager Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span>{user?.name}</span>
                    <button
                        onClick={() => {
                            logout();
                            router.push('/');
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            backgroundColor: 'white'
                        }}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ padding: '2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Assigned Business Card */}
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <Building2 size={32} color="#10b981" />
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Your Assigned Business</h2>
                                <p style={{ color: '#6b7280' }}>View and manage your business</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Business Name</h3>
                                <p style={{ color: '#6b7280' }}>Business's Business</p>
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Legal Name</h3>
                                <p style={{ color: '#6b7280' }}>Business Manager LLC</p>
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Status</h3>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: '#d1fae5',
                                    color: '#065f46',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}>
                                    Verified
                                </span>
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Contact</h3>
                                <p style={{ color: '#6b7280' }}>manager@business.com</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '0.375rem' }}>
                            <p style={{ color: '#92400e', fontSize: '0.875rem' }}>
                                <strong>Note:</strong> You have read-only access to business details. Contact the business owner to request changes.
                            </p>
                        </div>
                    </div>

                    {/* Orders Section */}
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <ShoppingBag size={32} color="#3b82f6" />
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Business Orders</h2>
                                <p style={{ color: '#6b7280' }}>View orders for your assigned business</p>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                            <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>No orders yet</p>
                            <p style={{ fontSize: '0.875rem' }}>Orders placed for your business will appear here</p>
                        </div>

                        <Link
                            href="/business-manager/orders"
                            style={{
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                borderRadius: '0.375rem',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}
                        >
                            View All Orders
                        </Link>
                    </div>

                    {/* Access Information */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #93c5fd',
                        borderRadius: '0.5rem'
                    }}>
                        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e40af' }}>Manager Access Level</h3>
                        <ul style={{ color: '#1e40af', fontSize: '0.875rem', paddingLeft: '1.5rem' }}>
                            <li>View business details (read-only)</li>
                            <li>View orders for assigned business</li>
                            <li>Cannot modify business information</li>
                            <li>Cannot access other businesses</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
