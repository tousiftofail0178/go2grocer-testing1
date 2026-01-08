"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import styles from './managers.module.css';
import { AddressFormFields, AddressData } from '@/components/forms/AddressFormFields';
import { toast } from 'react-hot-toast';

interface Manager {
    source: 'application' | 'profile';
    applicationId?: number;
    profileId?: number;
    userId?: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    status: string;
    businessName: string;
    roleType: string;
    appliedAt?: string;
}

export default function ManagersPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRequestModal, setShowRequestModal] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        businessId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
    });

    // Address State
    const [managerAddress, setManagerAddress] = useState<AddressData>({
        street: '',
        area: '',
        city: 'Chittagong',
        postalCode: '',
        customArea: ''
    });

    const [submitting, setSubmitting] = useState(false);

    // Ensure component is mounted (client-side only)
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!user) {
            router.push('/login');
            return;
        }
        fetchBusinessesAndManagers();
    }, [user, mounted]);

    const fetchBusinessesAndManagers = async () => {
        try {
            setLoading(true);

            if (!user?.id) {
                console.error('❌ No user ID available');
                return;
            }

            console.log(`🔍 Fetching managers for user ID: ${user.id}`);

            // ✅ FIXED: Use new unified endpoint that fetches ALL managers for this owner
            const mgrsResponse = await fetch(`/api/business-owner/managers?userId=${user.id}`);
            const mgrsData = await mgrsResponse.json();

            console.log('📦 Manager API Response:', mgrsData);
            console.log('📊 Manager count:', mgrsData.managers?.length || 0);

            if (mgrsData.managers) {
                setManagers(mgrsData.managers);
                console.log(`✅ Loaded ${mgrsData.managers.length} manager(s):`, mgrsData.managers);
            } else {
                console.warn('⚠️ No managers property in response');
            }

            // Still fetch businesses for the request form
            const bizResponse = await fetch(`/api/business-profile?userId=${user.id}`);
            const bizData = await bizResponse.json();

            if (bizData.businesses && bizData.businesses.length > 0) {
                setBusinesses(bizData.businesses);
                setFormData(prev => ({ ...prev, businessId: bizData.businesses[0].businessId.toString() }));
                console.log(`✅ Loaded ${bizData.businesses.length} business(es)`);
            }
        } catch (error) {
            console.error('❌ Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchManagersForBusiness = async (businessId: number) => {
        // This function is no longer needed since we fetch all managers at once
        // But keeping it for potential future use
        console.log('Managers already loaded for all businesses');
    };

    const handleBusinessChange = async (businessId: number) => {
        setSelectedBusinessId(businessId);
        await fetchManagersForBusiness(businessId);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (newAddress: AddressData) => {
        setManagerAddress(newAddress);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Unable to submit request. Please try again.');
            return;
        }

        // Validation
        if (!formData.businessId || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/business-profile/managers/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: parseInt(formData.businessId),
                    requestedByUserId: user.id,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    managerAddress, // Send structured address object
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('✅ Manager request submitted successfully! Awaiting admin approval.');
                setShowRequestModal(false);
                // Reset form
                setFormData({
                    businessId: businesses[0]?.businessId.toString() || '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    password: ''
                });
                setManagerAddress({
                    street: '',
                    area: '',
                    city: 'Chittagong',
                    postalCode: '',
                    customArea: ''
                });
            } else {
                toast.error(`❌ Error: ${data.error || 'Failed to submit request'}`);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('An error occurred while submitting the request');
        } finally {
            setSubmitting(false);
        }
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Manager Accounts</h1>
                    {businesses.length > 1 ? (
                        <div className={styles.businessSelector}>
                            <label>Select Business:</label>
                            <select
                                value={selectedBusinessId || ''}
                                onChange={(e) => handleBusinessChange(parseInt(e.target.value))}
                                className={styles.businessDropdown}
                            >
                                {businesses.map((biz) => (
                                    <option key={biz.businessId} value={biz.businessId}>
                                        {biz.businessName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <p className={styles.subtitle}>
                            Business: {businesses[0]?.businessName || 'N/A'}
                        </p>
                    )}
                </div>
                <button
                    className={styles.primaryButton}
                    onClick={() => setShowRequestModal(true)}
                >
                    <Plus size={20} />
                    Request New Manager
                </button>
            </div>

            {managers.length === 0 ? (
                <div className={styles.emptyState}>
                    <User size={48} className={styles.emptyIcon} />
                    <h3>No managers yet</h3>
                    <p>Request a manager account to help manage your business</p>
                </div>
            ) : (
                <div className={styles.managerGrid}>
                    {managers.map((manager, idx) => (
                        <div key={`manager-${manager.source}-${manager.applicationId || manager.profileId}-${idx}`} className={styles.managerCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.managerIcon}>
                                    <User size={24} />
                                </div>
                                <div className={styles.headerInfo}>
                                    <h3 className={styles.managerName}>
                                        {manager.firstName} {manager.lastName}
                                    </h3>
                                    <p className={styles.role}>Store Manager</p>
                                </div>
                                {manager.status === 'verified' || manager.status === 'approved' ? (
                                    <div className={`${styles.statusBadge} ${styles.badgeVerified}`}>
                                        <CheckCircle size={14} />
                                        Verified
                                    </div>
                                ) : manager.status === 'pending' ? (
                                    <div className={`${styles.statusBadge} ${styles.badgePending}`}>
                                        <Clock size={14} />
                                        Pending
                                    </div>
                                ) : (
                                    <div className={`${styles.statusBadge} ${styles.badgeRejected}`}>
                                        <XCircle size={14} />
                                        Rejected
                                    </div>
                                )}
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Assigned To:</span>
                                    <span className={styles.value}>
                                        {manager.businessName}
                                        {manager.businessName === 'Pending Setup' && (
                                            <span className={styles.pendingBadge}> ⏳ Business Pending</span>
                                        )}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <Mail size={16} />
                                    <span className={styles.value}>{manager.email}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <Phone size={16} />
                                    <span className={styles.value}>{manager.phoneNumber}</span>
                                </div>
                            </div>
                            <div className={styles.cardFooter}>
                                <button className={styles.editButton}>Edit Profile</button>
                                <button className={styles.removeButton}>Remove Access</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showRequestModal && (
                <div className={styles.modalOverlay} onClick={() => setShowRequestModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>Request Manager Account</h2>
                        <p className={styles.modalSubtitle}>
                            Submit a request for admin approval. The manager will be able to login
                            once approved.
                        </p>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Select Business *</label>
                                <select
                                    name="businessId"
                                    value={formData.businessId}
                                    onChange={handleChange}
                                    required
                                    className={styles.selectInput}
                                >
                                    <option value="">Choose a business...</option>
                                    {businesses.map((biz) => (
                                        <option key={biz.businessId} value={biz.businessId}>
                                            {biz.businessName}
                                        </option>
                                    ))}
                                </select>
                                <small>Select which business this manager will work for</small>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john.doe@company.com"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="01712345678"

                                    required
                                />
                            </div>

                            <AddressFormFields
                                prefix="manager"
                                data={managerAddress}
                                onChange={handleAddressChange}
                            />

                            <div className={styles.formGroup}>
                                <label>Initial Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Secure password"
                                    required
                                />
                                <small>The manager will use this to login after approval</small>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={() => setShowRequestModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.primaryButton}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
