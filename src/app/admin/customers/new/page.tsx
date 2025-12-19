"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css';
import { ArrowLeft, Edit2 } from 'lucide-react';

export default function NewCustomerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        content: '',
        email: '',
        phone: '',
        marketingEmail: false,
        marketingSMS: false,
        address: {
            country: 'Belgium',
            address1: '',
            city: '',
            postalCode: ''
        },
        tax: {
            vatNumber: '',
            collectTax: false
        },
        notes: '',
        tags: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        // @ts-ignore
        const checked = e.target.checked;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                // @ts-ignore
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [name]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/admin/customers');
            }
        } catch (error) {
            console.error('Failed to create customer', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Link href="/admin/customers" style={{ color: '#666', textDecoration: 'none' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className={styles.pageTitle}>New customer</h1>
                </div>
            </div>

            <div className={styles.splitLayout}>
                {/* Left Column: Main Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Customer Overview */}
                    <div className={styles.card}>
                        <div className={styles.formSection}>
                            <h2 className={styles.cardTitle}>Customer overview</h2>

                            <div className={styles.inputGroup}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className={styles.label}>First name</label>
                                        <input
                                            className={styles.inputField}
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className={styles.label}>Last name</label>
                                        <input
                                            className={styles.inputField}
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Language</label>
                                <select
                                    className={styles.inputField}
                                    style={{ background: '#fff' }}
                                >
                                    <option>English [Default]</option>
                                    <option>French</option>
                                    <option>Dutch</option>
                                </select>
                                <div className={styles.helpText}>This customer will receive notifications in this language.</div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Email</label>
                                <input
                                    className={styles.inputField}
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Phone number</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ width: 80, border: '1px solid #ccc', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>🇧🇪</div>
                                    <input
                                        className={styles.inputField}
                                        name="phone"
                                        style={{ marginTop: 0 }}
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input type="checkbox" name="marketingEmail" checked={formData.marketingEmail} onChange={handleChange} />
                                    <span style={{ fontSize: '0.9rem' }}>Customer agreed to receive marketing emails.</span>
                                </label>
                                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input type="checkbox" name="marketingSMS" checked={formData.marketingSMS} onChange={handleChange} />
                                    <span style={{ fontSize: '0.9rem' }}>Customer agreed to receive SMS marketing text messages.</span>
                                </label>
                            </div>

                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#666' }}>
                                You should ask your customers for permission before you subscribe them to your marketing emails or SMS.
                            </div>
                        </div>
                    </div>

                    {/* Default Address */}
                    <div className={styles.card}>
                        <div className={styles.formSection}>
                            <h2 className={styles.cardTitle}>Default address</h2>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>The primary address of this customer</p>

                            <button type="button" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 4, background: '#fff', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <span>Add address</span>
                                <span>›</span>
                            </button>
                        </div>
                    </div>

                    {/* Tax Details */}
                    <div className={styles.card}>
                        <div className={styles.formSection}>
                            <h2 className={styles.cardTitle}>Tax details</h2>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>VAT number</label>
                                <input className={styles.inputField} name="tax.vatNumber" value={formData.tax.vatNumber} onChange={handleChange} />
                                <div className={styles.helpText}>Valid VAT numbers apply the <a href="#" style={{ color: '#007ace' }}>reverse charge</a> exemption</div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Tax settings</label>
                                <select className={styles.inputField} style={{ background: '#fff' }}>
                                    <option>Collect tax</option>
                                    <option>Don't collect tax</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                        <button type="submit" className={styles.primaryBtn} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                </div>

                {/* Right Column: Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div className={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label className={styles.label} style={{ marginBottom: 0 }}>Notes</label>
                            <Edit2 size={14} color="#666" style={{ cursor: 'pointer' }} />
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Notes are private and won't be shared with the customer.
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label className={styles.label} style={{ marginBottom: 0 }}>Tags</label>
                            <Edit2 size={14} color="#666" style={{ cursor: 'pointer' }} />
                        </div>
                        <input className={styles.inputField} placeholder="" name="tags" />
                    </div>

                </div>
            </div>
        </form>
    );
}
