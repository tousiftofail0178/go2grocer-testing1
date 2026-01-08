"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, Building2, Mail, Phone, Calendar, User, Shield } from 'lucide-react';
import styles from './registrations.module.css';
import { toast } from 'react-hot-toast';

interface Registration {
    id: number;
    userId: number;
    businessName: string;
    legalName: string;
    email: string;
    phone: string;
    bin: string;
    tin: string;
    tradeLicense: string;
    taxCertificate: string;
    status: string;
    registeredDate: string;
    userEmail: string;
    currentRole: string;
    isVerified: boolean;
    isUserVerified: boolean;
}

export default function RegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [detailViewRegistration, setDetailViewRegistration] = useState<Registration | null>(null);
    const [selectedRole, setSelectedRole] = useState<'business_owner' | 'business_manager'>('business_owner');
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [approvedUserId, setApprovedUserId] = useState('');
    // Rejection modal states
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectingRegistration, setRejectingRegistration] = useState<Registration | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/registrations');
            const data = await response.json();

            if (response.ok) {
                setRegistrations(data.registrations || []);
            } else {
                console.error('Failed to fetch registrations:', data.error);
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRegistration) return;

        setIsProcessing(true);
        try {
            const response = await fetch(`/api/admin/registrations/${selectedRegistration.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approve',
                    role: selectedRole,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Close modal first
                setSelectedRegistration(null);

                // Show success message
                toast.success(`✅ ${selectedRegistration.businessName} has been approved successfully!`);

                // Refresh list
                await fetchRegistrations();
            } else {
                const errorMsg = data.details || data.error || 'Failed to approve registration';
                toast.error(`❌ Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Error approving registration:', error);
            toast.error('❌ An error occurred while approving the registration');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectClick = (registration: Registration) => {
        setRejectingRegistration(registration);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const confirmReject = async () => {
        if (!rejectingRegistration) return;

        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch(`/api/admin/registrations/${rejectingRegistration.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reject',
                    reason: rejectionReason,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setRejectModalOpen(false);
                setRejectionReason('');
                setRejectingRegistration(null);
                toast.success(`✅ ${rejectingRegistration.businessName} application has been rejected. Email notification sent.`);
                fetchRegistrations();
            } else {
                toast.error(`❌ Error: ${data.error || 'Failed to reject application'}`);
            }
        } catch (error) {
            console.error('Error rejecting registration:', error);
            toast.error('❌ An error occurred while rejecting the registration');
        } finally {
            setIsProcessing(false);
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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Business Registrations</h1>
                <p className={styles.subtitle}>Review and approve business account requests</p>
            </div>

            {successMessage && (
                <div className={styles.successBanner}>
                    <CheckCircle size={20} />
                    <div>
                        <p>{successMessage}</p>
                        {approvedUserId && (
                            <p className={styles.userId}>
                                <strong>User ID for login:</strong> {approvedUserId}
                            </p>
                        )}
                    </div>
                    <button onClick={() => { setSuccessMessage(''); setApprovedUserId(''); }}>×</button>
                </div>
            )}

            {loading && (
                <div className={styles.loading}>
                    <Clock className={styles.spinner} size={48} />
                    <p>Loading registrations...</p>
                </div>
            )}

            {!loading && registrations.length === 0 && (
                <div className={styles.emptyState}>
                    <Building2 size={64} className={styles.emptyIcon} />
                    <h3>No Pending Registrations</h3>
                    <p>All business registration requests have been processed.</p>
                </div>
            )}

            {!loading && registrations.length > 0 && (
                <div className={styles.registrationsGrid}>
                    {registrations.map((registration) => (
                        <div
                            key={registration.id}
                            className={styles.registrationCard}
                            onClick={() => setDetailViewRegistration(registration)}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.businessInfo}>
                                    <Building2 size={24} className={styles.businessIcon} />
                                    <div>
                                        <h3 className={styles.businessName}>{registration.businessName}</h3>
                                        <p className={styles.legalName}>{registration.legalName}</p>
                                    </div>
                                </div>
                                <span className={styles.statusBadge}>
                                    <Clock size={14} />
                                    Pending
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
                            </div>

                            <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                                <button
                                    className={styles.approveButton}
                                    onClick={() => setSelectedRegistration(registration)}
                                    disabled={isProcessing}
                                >
                                    <CheckCircle size={18} />
                                    Approve
                                </button>
                                <button
                                    className={styles.rejectButton}
                                    onClick={() => handleRejectClick(registration)}
                                    disabled={isProcessing}
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Detail View Modal */}
            {detailViewRegistration && (
                <div className={styles.modalOverlay} onClick={() => setDetailViewRegistration(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Registration Details</h2>
                            <button className={styles.closeButton} onClick={() => setDetailViewRegistration(null)}></button>
                        </div>

                        <div className={styles.modalBody}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>Customer Information</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Email:</strong><br /><span style={{ fontSize: '0.9375rem' }}>{detailViewRegistration.email}</span></div>
                                        <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Phone:</strong><br /><span style={{ fontSize: '0.9375rem' }}>{detailViewRegistration.phone}</span></div>
                                        <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>User ID:</strong><br /><span style={{ fontSize: '0.9375rem' }}>#{detailViewRegistration.userId}</span></div>
                                        <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Registered:</strong><br /><span style={{ fontSize: '0.9375rem' }}>{formatDate(detailViewRegistration.registeredDate)}</span></div>
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>Business Information</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Business Name:</strong><br /><span style={{ fontSize: '0.9375rem' }}>{detailViewRegistration.businessName}</span></div>
                                        <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Legal Name:</strong><br /><span style={{ fontSize: '0.9375rem' }}>{detailViewRegistration.legalName}</span></div>
                                        <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Business Email:</strong><br /><span style={{ fontSize: '0.9375rem' }}>{detailViewRegistration.email}</span></div>
                                        <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Business Phone:</strong><br /><span style={{ fontSize: '0.9375rem' }}>{detailViewRegistration.phone}</span></div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>Tax & License Information</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>BIN Number:</strong><br /><span style={{ fontSize: '0.9375rem' }}>{detailViewRegistration.bin || 'Not provided'}</span></div>
                                    <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>TIN Number:</strong><br /><span style={{ fontSize: '0.9375rem' }}>{detailViewRegistration.tin || 'Not provided'}</span></div>
                                    <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Trade License:</strong><br /><span style={{ fontSize: '0.9375rem' }}>{detailViewRegistration.tradeLicense || 'Not provided'}</span></div>
                                    <div><strong style={{ color: '#6b7280', fontSize: '0.875rem' }}>Tax Certificate:</strong><br /><span style={{ fontSize: '0.9375rem' }}>{detailViewRegistration.taxCertificate || 'Not provided'}</span></div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#fbbf24', color: '#92400e', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600' }}>
                                    <Clock size={18} />
                                    Pending Approval
                                </span>
                                <p style={{ marginTop: '0.75rem', color: '#92400e', fontSize: '0.875rem' }}>This registration is awaiting admin review and approval.</p>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.approveButton}
                                onClick={() => {
                                    setDetailViewRegistration(null);
                                    setSelectedRegistration(detailViewRegistration);
                                }}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <CheckCircle size={18} />
                                Approve This Registration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {selectedRegistration && (
                <div className={styles.modalOverlay} onClick={() => setSelectedRegistration(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Approve Registration</h2>
                            <button className={styles.closeButton} onClick={() => setSelectedRegistration(null)}>×</button>
                        </div>

                        <div className={styles.modalBody}>
                            <p className={styles.modalInfo}>
                                You are about to approve <strong>{selectedRegistration.businessName}</strong>
                            </p>

                            {/* ✅ SMART APPROVAL: Check if user is already a VERIFIED business owner */}
                            {selectedRegistration.currentRole === 'business_owner' && selectedRegistration.isUserVerified ? (
                                /* Case A: Existing Business Owner - Show verification message  */
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: '#d1fae5',
                                    borderRadius: '8px',
                                    border: '1px solid #10b981',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <CheckCircle size={20} style={{ color: '#065f46', flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <p style={{ margin: 0, color: '#065f46', fontWeight: '600', fontSize: '0.9375rem' }}>
                                                ✅ Verified Owner Found
                                            </p>
                                            <p style={{ margin: '0.5rem 0 0 0', color: '#047857', fontSize: '0.875rem' }}>
                                                This business will be added to the account of <strong>{selectedRegistration.userEmail}</strong>.
                                                The owner can manage multiple businesses with the same login credentials.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Case B: New Applicant - Show role selection */
                                <>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            <Shield size={18} />
                                            Select User Role
                                        </label>
                                        <select
                                            className={styles.select}
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value as 'business_owner' | 'business_manager')}
                                        >
                                            <option value="business_owner">Business Owner</option>
                                            <option value="business_manager">Business Manager</option>
                                        </select>
                                        <p className={styles.helpText}>
                                            This determines their access level and permissions in the system.
                                        </p>
                                    </div>

                                    <div className={styles.userIdPreview}>
                                        <User size={18} />
                                        <div>
                                            <span className={styles.label}>User ID for Login:</span>
                                            <span className={styles.userId}>{selectedRegistration.userEmail}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setSelectedRegistration(null)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleApprove}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Confirm Approval'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {rejectModalOpen && rejectingRegistration && (
                <div className={styles.modalOverlay} onClick={() => setRejectModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Reject Application for {rejectingRegistration.businessName}?</h2>
                            <button className={styles.closeButton} onClick={() => setRejectModalOpen(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <p className={styles.modalDescription}>
                                Please provide a reason for rejection. The business owner will receive an email notification with this feedback.
                            </p>
                            <textarea
                                className={styles.rejectionTextarea}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g., Invalid Tax ID number, blurred documents, missing trade license..."
                                rows={5}
                                autoFocus
                            />
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setRejectModalOpen(false)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmRejectButton}
                                onClick={confirmReject}
                                disabled={isProcessing || !rejectionReason.trim()}
                            >
                                <XCircle size={18} />
                                {isProcessing ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
