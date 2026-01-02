"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, FileText, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function BusinessOwnerDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);
    const [stats, setStats] = React.useState({
        activeBusinesses: 0,
        pendingApplications: 0,
        totalManagers: 0,
        loading: true,
    });

    // Ensure component is mounted (client-side only)
    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Check if user is business owner
    React.useEffect(() => {
        if (!mounted) return;

        if (!user || user.role !== 'business_owner') {
            router.push('/');
        } else {
            fetchDashboardData();
        }
    }, [user, router, mounted]);

    const fetchDashboardData = async () => {
        try {
            if (!user?.id) {
                console.error('No user ID available');
                return;
            }

            // ✅ FIXED: Use new unified stats endpoint
            const statsResponse = await fetch(`/api/business-owner/stats?userId=${user.id}`);
            const statsData = await statsResponse.json();

            if (statsData.success && statsData.stats) {
                setStats({
                    activeBusinesses: statsData.stats.verifiedBusinesses || 0,
                    pendingApplications: statsData.stats.pendingApplications || 0,
                    totalManagers: statsData.stats.managers || 0,
                    loading: false,
                });
                console.log('✅ Dashboard stats loaded:', statsData.stats);
            } else {
                console.error('Failed to load stats:', statsData);
                setStats(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    // Prevent hydration mismatch by not rendering until mounted
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
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Business Owner Dashboard</h1>
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
                    {/* Quick Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Building2 size={32} color="#10b981" />
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                        {stats.loading ? '...' : stats.activeBusinesses}
                                    </div>
                                    <div style={{ color: '#6b7280' }}>Active Businesses</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <FileText size={32} color="#3b82f6" />
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                        {stats.loading ? '...' : stats.pendingApplications}
                                    </div>
                                    <div style={{ color: '#6b7280' }}>Pending Applications</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Users size={32} color="#8b5cf6" />
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                        {stats.loading ? '...' : stats.totalManagers}
                                    </div>
                                    <div style={{ color: '#6b7280' }}>Managers</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* My Businesses */}
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>My Businesses</h2>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                                View and manage your registered businesses
                            </p>
                            <Link
                                href="/business-owner/businesses"
                                style={{
                                    display: 'inline-block',
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    borderRadius: '0.375rem',
                                    textDecoration: 'none',
                                    fontWeight: 500
                                }}
                            >
                                View Businesses
                            </Link>
                        </div>

                        {/* Apply for New Business */}
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Register New Business</h2>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                                Apply to add a new business to the platform
                            </p>
                            <Link
                                href="/business-owner/apply-business"
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
                                Apply Now
                            </Link>
                        </div>

                        {/* Business Applications */}
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Application Status</h2>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                                Track your business registration applications
                            </p>
                            <Link
                                href="/business-owner/applications"
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
                                View Applications
                            </Link>
                        </div>

                        {/* Manager Accounts */}
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Manager Accounts</h2>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                                Request manager accounts for your businesses
                            </p>
                            <Link
                                href="/business-owner/managers"
                                style={{
                                    display: 'inline-block',
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    borderRadius: '0.375rem',
                                    textDecoration: 'none',
                                    fontWeight: 500
                                }}
                            >
                                Manage Managers
                            </Link>
                        </div>

                        {/* Business Invoices */}
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Business Invoices</h2>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                                View and manage invoices for all your businesses
                            </p>
                            <Link
                                href="/business-owner/invoices"
                                style={{
                                    display: 'inline-block',
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#06b6d4',
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

                    {/* Information Notice */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #93c5fd',
                        borderRadius: '0.5rem'
                    }}>
                        <p style={{ color: '#1e40af', fontSize: '0.875rem' }}>
                            <strong>Note:</strong> All business registrations and manager account requests require approval from G2G Admin before being activated.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
