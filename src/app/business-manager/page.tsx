"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ShoppingBag, LogOut, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { getUserBusinesses } from '@/lib/actions/business';

interface Business {
    id: number;
    name: string;
    role: 'OWNER' | 'MANAGER';
}

export default function BusinessManagerDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Ensure component is mounted (client-side only)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Check if user is business manager
    useEffect(() => {
        if (!mounted) return;

        if (!user || user.role !== 'business_manager') {
            router.push('/');
        } else {
            fetchAssignedBusiness();
        }
    }, [user, router, mounted]);

    async function fetchAssignedBusiness() {
        try {
            setLoading(true);
            const result = await getUserBusinesses();

            if (result.success && result.businesses && result.businesses.length > 0) {
                // Managers should only have one business assigned
                setBusiness(result.businesses[0]);
                console.log('✅ Manager assigned to business:', result.businesses[0]);
            } else {
                console.log('⚠️ No business found for manager');
                setBusiness(null);
            }
        } catch (error) {
            console.error('Error fetching assigned business:', error);
            setBusiness(null);
        } finally {
            setLoading(false);
        }
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return null;
    }

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
                    {/* Loading State */}
                    {loading ? (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '3rem',
                            borderRadius: '0.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            textAlign: 'center'
                        }}>
                            <p style={{ color: '#6b7280' }}>Loading your assigned business...</p>
                        </div>
                    ) : business ? (
                        <>
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
                                        <p style={{ color: '#111827', fontSize: '1.125rem', fontWeight: 500 }}>{business.name}</p>
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Your Role</h3>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            backgroundColor: '#dbeafe',
                                            color: '#1e40af',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        }}>
                                            {business.role}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Business ID</h3>
                                        <p style={{ color: '#6b7280' }}>#{business.id}</p>
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
                                            Active
                                        </span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '0.375rem' }}>
                                    <p style={{ color: '#92400e', fontSize: '0.875rem' }}>
                                        <strong>Note:</strong> You have manager-level access to this business. Contact the business owner for administrative changes.
                                    </p>
                                </div>
                            </div>

                            {/* Actions Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                {/* Orders Section */}
                                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <ShoppingBag size={32} color="#3b82f6" />
                                        <div>
                                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Business Orders</h2>
                                            <p style={{ color: '#6b7280' }}>View and manage orders</p>
                                        </div>
                                    </div>

                                    <Link
                                        href="/dashboard/orders"
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

                                {/* Invoices Section */}
                                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <FileText size={32} color="#8b5cf6" />
                                        <div>
                                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Invoices</h2>
                                            <p style={{ color: '#6b7280' }}>View and download invoices</p>
                                        </div>
                                    </div>

                                    <Link
                                        href="/business-manager/invoices"
                                        style={{
                                            display: 'inline-block',
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: '#8b5cf6',
                                            color: 'white',
                                            borderRadius: '0.375rem',
                                            textDecoration: 'none',
                                            fontWeight: 500
                                        }}
                                    >
                                        View Invoices
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* No Business Assigned State */
                        <div style={{
                            backgroundColor: 'white',
                            padding: '3rem',
                            borderRadius: '0.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            textAlign: 'center'
                        }}>
                            <Building2 size={64} color="#d1d5db" style={{ margin: '0 auto 1rem auto' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                                No Business Assigned
                            </h2>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                                You are not currently assigned to any business.
                            </p>
                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#fef3c7',
                                borderRadius: '0.375rem',
                                border: '1px solid #f59e0b',
                                maxWidth: '500px',
                                margin: '0 auto'
                            }}>
                                <p style={{ color: '#92400e', fontSize: '0.875rem', margin: 0 }}>
                                    <strong>What to do:</strong> Contact your business owner to request assignment to a business. They can assign you through the manager account system.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Access Information */}
                    {business && (
                        <div style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            backgroundColor: '#eff6ff',
                            border: '1px solid #93c5fd',
                            borderRadius: '0.5rem'
                        }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e40af' }}>Manager Access Level</h3>
                            <ul style={{ color: '#1e40af', fontSize: '0.875rem', paddingLeft: '1.5rem' }}>
                                <li>View order history for {business.name}</li>
                                <li>Create shopping lists</li>
                                <li>Place orders on behalf of the business</li>
                                <li>Cannot modify business registration details</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
