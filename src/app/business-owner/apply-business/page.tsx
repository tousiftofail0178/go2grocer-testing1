"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Save, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './apply.module.css';
import { AddressFormFields, AddressData } from '@/components/forms/AddressFormFields';
import { toast } from 'react-hot-toast';

export default function ApplyBusinessPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [formData, setFormData] = useState({
        businessName: '',
        legalName: '',
        email: '',
        phoneNumber: '',
        // address field removed, replaced by businessAddress state
        tradeLicenseNumber: '',
        taxCertificateNumber: '',
        licenseExpiryDate: '',
    });

    const [businessAddress, setBusinessAddress] = useState<AddressData>({
        street: '',
        area: '',
        city: 'Chittagong',
        postalCode: '',
        customArea: ''
    });

    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddressChange = (field: keyof AddressData, value: string) => {
        setBusinessAddress(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please log in to register a business');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/admin/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    businessAddress, // Send structured address object
                    ownerId: user.id, // Will be converted to numeric ID by API
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('✅ Business registration submitted successfully! Awaiting admin approval.');
                router.push('/business-owner/applications');
            } else {
                toast.error(`❌ Error: ${data.error || 'Failed to submit registration'}`);
            }
        } catch (error) {
            console.error('Error submitting registration:', error);
            toast.error('An error occurred while submitting your registration');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <Building2 size={48} className={styles.headerIcon} />
                    <div>
                        <h1 className={styles.title}>Register New Business</h1>
                        <p className={styles.subtitle}>
                            Apply to add a new business to the Go2Grocer platform
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => router.back()}
                >
                    <X size={20} />
                    Cancel
                </button>
            </div>

            <div className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Business Information</h2>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Business Name *</label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    placeholder="e.g., ABC Grocery Store"
                                    required
                                />
                                <small>The name your customers will see</small>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Legal Name *</label>
                                <input
                                    type="text"
                                    name="legalName"
                                    value={formData.legalName}
                                    onChange={handleChange}
                                    placeholder="e.g., ABC Grocery Limited"
                                    required
                                />
                                <small>Official registered business name</small>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Business Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="contact@business.com"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="01712345678"
                                    required
                                />
                            </div>
                        </div>

                        {/* Replace textarea with AddressFormFields */}
                        <AddressFormFields
                            prefix="business"
                            data={businessAddress}
                            onChange={handleAddressChange}
                        />
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Legal Documents</h2>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Trade License Number *</label>
                                <input
                                    type="text"
                                    name="tradeLicenseNumber"
                                    value={formData.tradeLicenseNumber}
                                    onChange={handleChange}
                                    placeholder="TL-123456"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Tax Certificate Number *</label>
                                <input
                                    type="text"
                                    name="taxCertificateNumber"
                                    value={formData.taxCertificateNumber}
                                    onChange={handleChange}
                                    placeholder="TAX-123456"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>License Expiry Date *</label>
                            <input
                                type="date"
                                name="licenseExpiryDate"
                                value={formData.licenseExpiryDate}
                                onChange={handleChange}
                                required
                            />
                            <small>When your trade license expires</small>
                        </div>
                    </div>

                    <div className={styles.infoBox}>
                        <strong>Note:</strong> All business registrations require admin approval before activation.
                        You will be notified once your application is reviewed.
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => router.back()}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={submitting}
                        >
                            <Save size={20} />
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
