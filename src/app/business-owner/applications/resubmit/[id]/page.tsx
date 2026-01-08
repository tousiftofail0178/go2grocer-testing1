"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/db';
import { businessApplications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import styles from './resubmit.module.css';
import { toast } from 'react-hot-toast';

interface ResubmitFormProps {
    applicationId: number;
    userId: number;
}

export default function ResubmitApplicationPage({
    params
}: {
    params: { id: string }
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        legalName: '',
        email: '',
        phoneNumber: '',
        address: '',
        tradeLicenseNumber: '',
        taxCertificateNumber: '',
        bin: '',
        tin: '',
        vat: '',
        bankName: '',
        bankAccount: '',
        bankBranch: '',
    });

    useEffect(() => {
        fetchApplicationData();
    }, []);

    const fetchApplicationData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/business-profile/applications/${params.id}`);
            const data = await response.json();

            if (response.ok && data.application) {
                const app = data.application;
                setFormData({
                    businessName: app.businessName || '',
                    legalName: app.legalName || '',
                    email: app.email || '',
                    phoneNumber: app.phoneNumber || '',
                    address: app.address || '',
                    tradeLicenseNumber: app.tradeLicenseNumber || '',
                    taxCertificateNumber: app.taxCertificateNumber || '',
                    bin: app.bin || '',
                    tin: app.tin || '',
                    vat: app.vat || '',
                    bankName: app.bankName || '',
                    bankAccount: app.bankAccount || '',
                    bankBranch: app.bankBranch || '',
                });
            }
        } catch (error) {
            console.error('Error fetching application:', error);
            toast.error('Failed to load application data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch(`/api/business-profile/applications/${params.id}/resubmit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('✅ Application resubmitted successfully! It will be reviewed by our admin team.');
                router.push('/business-owner/dashboard');
            } else {
                toast.error(`❌ Error: ${data.error || 'Failed to resubmit application'}`);
            }
        } catch (error) {
            console.error('Error resubmitting application:', error);
            toast.error('❌ An error occurred while resubmitting');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading application data...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Resubmit Business Application</h1>
                <p className={styles.subtitle}>
                    Please update the required information and resubmit for review
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Business Information */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Business Information</h2>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Business Name *</label>
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Legal Name *</label>
                            <input
                                type="text"
                                name="legalName"
                                value={formData.legalName}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone Number *</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.label}>Business Address *</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={styles.textarea}
                                rows={3}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* License & Tax Information */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>License & Tax Information</h2>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Trade License Number *</label>
                            <input
                                type="text"
                                name="tradeLicenseNumber"
                                value={formData.tradeLicenseNumber}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tax Certificate Number *</label>
                            <input
                                type="text"
                                name="taxCertificateNumber"
                                value={formData.taxCertificateNumber}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>BIN</label>
                            <input
                                type="text"
                                name="bin"
                                value={formData.bin}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>TIN</label>
                            <input
                                type="text"
                                name="tin"
                                value={formData.tin}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>VAT Number</label>
                            <input
                                type="text"
                                name="vat"
                                value={formData.vat}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                {/* Banking Information */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Banking Information</h2>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Bank Name</label>
                            <input
                                type="text"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Account Number</label>
                            <input
                                type="text"
                                name="bankAccount"
                                value={formData.bankAccount}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Branch</label>
                            <input
                                type="text"
                                name="bankBranch"
                                value={formData.bankBranch}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={styles.cancelButton}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={submitting}
                    >
                        {submitting ? 'Resubmitting...' : 'Resubmit Application'}
                    </button>
                </div>
            </form>
        </div>
    );
}
