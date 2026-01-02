"use client";

import React, { useState, useEffect } from 'react';
import { XCircle, Building2, Mail, Phone, Calendar, AlertCircle, RotateCcw } from 'lucide-react';
import styles from '../registrations.module.css';

interface RejectedRegistration {
    id: number;
    userId: number;
    businessName: string;
    legalName: string;
    email: string;
    phone: string;
    status: string;
    registeredDate: string;
    rejectionReason: string;
    reviewedAt: string;
}

export default function RejectedApplicationsPage() {
    const [registrations, setRegistrations] = useState<RejectedRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [reopening, setReopening] = useState<number | null>(null);

    useEffect(() => {
        fetchRejectedRegistrations();
    }, []);

    const fetchRejectedRegistrations = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/registrations?status=rejected');
            const data = await response.json();

            if (response.ok) {
                setRegistrations(data.registrations || []);
            } else {
                console.error('Failed to fetch rejected registrations:', data.error);
            }
        } catch (error) {
            console.error('Error fetching rejected registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleReopen = async (registrationId: number, businessName: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to reopen the application for "${businessName}"?\n\nThis will move it back to Pending Registrations.`
        );

        if (!confirmed) return;

        try {
            setReopening(registrationId);
            const response = await fetch(`/api/admin/registrations/${registrationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reopen' }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`✅ ${businessName} has been reopened and moved back to Pending Registrations.`);
                // Remove from rejected list
                setRegistrations(prev => prev.filter(r => r.id !== registrationId));
            } else {
                alert(`❌ Error: ${data.error || 'Failed to reopen application'}`);
            }
        } catch (error) {
            console.error('Error reopening application:', error);
            alert('❌ An error occurred while reopening the application');
        } finally {
            setReopening(null);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Rejected Applications</h1>
                <p className={styles.subtitle}>
                    Applications that were returned to business owners for corrections
                </p>
            </div>

            {registrations.length === 0 ? (
                <div className={styles.emptyState}>
                    <XCircle size={48} className={styles.emptyIcon} />
                    <h3>No Rejected Applications</h3>
                    <p>All applications are either pending or have been approved.</p>
                </div>
            ) : (
                <div className={styles.registrationsGrid}>
                    {registrations.map((registration) => (
                        <div
                            key={registration.id}
                            className={styles.registrationCard}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.businessInfo}>
                                    <Building2 size={24} className={styles.businessIcon} />
                                    <div>
                                        <h3 className={styles.businessName}>{registration.businessName}</h3>
                                        <p className={styles.legalName}>{registration.legalName}</p>
                                    </div>
                                </div>
                                <span className={styles.statusBadgeRejected}>
                                    <XCircle size={14} />
                                    Rejected
                                </span>
                            </div>

                            <div className={styles.cardDetails}>
                                <div className={styles.detailRow}>
                                    <Mail size={16} />
                                    <span>{registration.email}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <Phone size={16} />
                                    <span>{registration.phone}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <Calendar size={16} />
                                    <span>Registered: {formatDate(registration.registeredDate)}</span>
                                </div>
                                {registration.reviewedAt && (
                                    <div className={styles.detailRow}>
                                        <Calendar size={16} />
                                        <span>Rejected: {formatDate(registration.reviewedAt)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Rejection Reason Display */}
                            <div className={styles.rejectionReasonBox}>
                                <div className={styles.rejectionReasonHeader}>
                                    <AlertCircle size={16} />
                                    <strong>Admin Note:</strong>
                                </div>
                                <p className={styles.rejectionReasonText}>
                                    {registration.rejectionReason || 'No reason provided'}
                                </p>
                            </div>

                            {/* Reopen Action */}
                            <div className={styles.cardActions}>
                                <button
                                    onClick={() => handleReopen(registration.id, registration.businessName)}
                                    className={styles.reopenButton}
                                    disabled={reopening === registration.id}
                                >
                                    <RotateCcw size={16} />
                                    {reopening === registration.id ? 'Reopening...' : 'Reopen Application'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
