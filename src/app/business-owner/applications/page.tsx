"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Clock, CheckCircle, XCircle, Mail, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './applications.module.css';

interface Application {
    id: number;
    businessName: string;
    legalName: string;
    email: string;
    phone: string;
    bin: string;
    tin: string;
    status: string;
    registeredDate: string;
}

export default function ApplicationsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!user) {
            router.push('/login');
            return;
        }
        fetchApplications();
    }, [user, mounted]);

    const fetchApplications = async () => {
        try {
            setLoading(true);

            if (!user?.id) {
                console.error('No user ID available');
                return;
            }

            // ✅ FIXED: Use dedicated business owner endpoint with user filtering
            const response = await fetch(`/api/business-owner/applications?userId=${user.id}`);
            const data = await response.json();

            if (data.registrations) {
                setApplications(data.registrations);
                console.log(`✅ Loaded ${data.registrations.length} application(s)`);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return <CheckCircle size={20} className={styles.statusIconVerified} />;
            case 'pending':
                return <Clock size={20} className={styles.statusIconPending} />;
            case 'rejected':
                return <XCircle size={20} className={styles.statusIconRejected} />;
            default:
                return <Clock size={20} className={styles.statusIconPending} />;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusClass = status === 'verified' ? styles.badgeVerified :
            status === 'pending' ? styles.badgePending :
                styles.badgeRejected;

        return (
            <div className={`${styles.statusBadge} ${statusClass}`}>
                {getStatusIcon(status)}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        );
    };

    if (!mounted) return null;

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading your applications...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>My Applications</h1>
                    <p className={styles.subtitle}>Track your business registration applications</p>
                </div>
                <button
                    className={styles.primaryButton}
                    onClick={() => router.push('/business-owner/apply-business')}
                >
                    <Building2 size={20} />
                    New Application
                </button>
            </div>

            {applications.length === 0 ? (
                <div className={styles.emptyState}>
                    <Building2 size={64} className={styles.emptyIcon} />
                    <h3>No applications yet</h3>
                    <p>Submit your first business registration application</p>
                    <button
                        className={styles.primaryButton}
                        onClick={() => router.push('/business-owner/apply-business')}
                    >
                        Apply Now
                    </button>
                </div>
            ) : (
                <div className={styles.applicationsList}>
                    {applications.map((app) => (
                        <div key={app.id} className={styles.applicationCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.businessIcon}>
                                    <Building2 size={24} />
                                </div>
                                <div className={styles.headerInfo}>
                                    <h3 className={styles.businessName}>{app.businessName}</h3>
                                    <p className={styles.legalName}>{app.legalName}</p>
                                </div>
                                {getStatusBadge(app.status)}
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <Mail size={16} />
                                        <span>{app.email}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Phone size={16} />
                                        <span>{app.phone}</span>
                                    </div>
                                </div>

                                <div className={styles.metaInfo}>
                                    <small>Trade License: {app.bin}</small>
                                    <small>Tax Certificate: {app.tin}</small>
                                    <small>Applied: {new Date(app.registeredDate).toLocaleDateString()}</small>
                                </div>
                            </div>

                            {app.status === 'pending' && (
                                <div className={styles.pendingNote}>
                                    <Clock size={14} />
                                    Awaiting admin review
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
