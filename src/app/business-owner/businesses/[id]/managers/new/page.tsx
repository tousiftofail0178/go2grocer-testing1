"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './new.module.css';
import { toast } from 'react-hot-toast';

export default function NewManagerPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuthStore();
    const businessId = params.id as string;

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        initialPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/business-profile/managers/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    businessId: parseInt(businessId),
                    requestedByUserId: user?.id,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('✅ Manager request submitted! Awaiting admin approval.');
                router.push('/business-owner');
            } else {
                setError(data.error || 'Failed to submit manager request');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Add New Manager</h1>
                <p>Create a manager account for Business ID: {businessId}</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formGroup}>
                    <label>First Name *</label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Last Name *</label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Email *</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Phone Number *</label>
                    <input
                        type="tel"
                        placeholder="+8801712345678"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Initial Password *</label>
                    <input
                        type="password"
                        value={formData.initialPassword}
                        onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                        required
                        minLength={6}
                    />
                    <small>Manager will use this password for first login</small>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? 'Submitting...' : 'Submit Manager Request'}
                    </button>
                </div>

                <div className={styles.note}>
                    <strong>Note:</strong> This request will be sent to admin for approval.
                    The manager account will be created once approved.
                </div>
            </form>
        </div>
    );
}
