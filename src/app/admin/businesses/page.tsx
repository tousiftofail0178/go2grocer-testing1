"use client";

import React, { useState, useEffect } from 'react';
import {
    Building2,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Plus,
    Edit,
    Trash2,
    X,
    Trophy
} from 'lucide-react';
import styles from './businesses.module.css';
import { toast } from 'react-hot-toast';

interface User {
    id: number;
    email: string;
    name?: string;
    role: string;
}

interface Business {
    id: number;
    businessName: string;
    legalName: string;
    email: string;
    phone: string;
    tradeLicense: string;
    taxCertificate: string;
    expiryDate: string;
    status: 'pending' | 'verified' | 'rejected';
    verifiedAt: string | null;
    userId: number;
    totalOrders: number;
    totalRevenue: number;
    joinDate: string;
}

interface Metrics {
    totalBusinesses: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
}

interface FormData {
    userId: number | '';
    businessName: string;
    legalName: string;
    phoneNumber: string;
    email: string;
    tradeLicenseNumber: string;
    taxCertificateNumber: string;
    expiryDate: string;
}

export default function BusinessesPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [topPerformers, setTopPerformers] = useState<Business[]>([]);
    const [metrics, setMetrics] = useState<Metrics>({
        totalBusinesses: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
    });
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState<FormData>({
        userId: '',
        businessName: '',
        legalName: '',
        phoneNumber: '',
        email: '',
        tradeLicenseNumber: '',
        taxCertificateNumber: '',
        expiryDate: '',
    });

    useEffect(() => {
        fetchBusinesses();
        fetchUsers();
    }, []);

    const fetchBusinesses = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/businesses');
            const data = await response.json();

            if (response.ok) {
                setBusinesses(data.businesses || []);
                setMetrics(data.metrics || {});
                setTopPerformers(data.topPerformers || []);
            }
        } catch (error) {
            console.error('Error fetching businesses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();

            if (response.ok) {
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleOpenModal = (business?: Business) => {
        if (business) {
            setEditingBusiness(business);
            setFormData({
                userId: business.userId,
                businessName: business.businessName,
                legalName: business.legalName,
                phoneNumber: business.phone,
                email: business.email,
                tradeLicenseNumber: business.tradeLicense,
                taxCertificateNumber: business.taxCertificate,
                expiryDate: business.expiryDate,
            });
        } else {
            setEditingBusiness(null);
            setFormData({
                userId: '',
                businessName: '',
                legalName: '',
                phoneNumber: '',
                email: '',
                tradeLicenseNumber: '',
                taxCertificateNumber: '',
                expiryDate: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBusiness(null);
        setErrorMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        setErrorMessage('');

        console.log('Submitting form data:', formData);

        try {
            if (editingBusiness) {
                // Update existing business
                console.log('Updating business:', editingBusiness.id);
                const response = await fetch(`/api/admin/businesses/${editingBusiness.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();
                console.log('Update response:', data);

                if (response.ok) {
                    await fetchBusinesses();
                    handleCloseModal();
                    toast.success('Business updated successfully!');
                } else {
                    setErrorMessage(data.error || 'Failed to update business');
                }
            } else {
                // Create new business
                console.log('Creating new business...');
                const response = await fetch('/api/admin/businesses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();
                console.log('Create response:', data);

                if (response.ok) {
                    await fetchBusinesses();
                    handleCloseModal();
                    toast.success('Business created successfully!');
                } else {
                    setErrorMessage(data.error || 'Failed to create business');
                }
            }
        } catch (error) {
            console.error('Error saving business:', error);
            setErrorMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/businesses/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchBusinesses();
            }
        } catch (error) {
            console.error('Error deleting business:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div>Loading businesses...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>Business Entities</h1>
                    <button className={styles.addButton} onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Add Business
                    </button>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Total Businesses</span>
                            <div className={styles.statIcon}>
                                <Building2 size={20} />
                            </div>
                        </div>
                        <div className={styles.statValue}>{metrics.totalBusinesses}</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Total Revenue</span>
                            <div className={styles.statIcon}>
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <div className={styles.statValue}>{formatCurrency(metrics.totalRevenue)}</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Total Orders</span>
                            <div className={styles.statIcon}>
                                <ShoppingCart size={20} />
                            </div>
                        </div>
                        <div className={styles.statValue}>{metrics.totalOrders}</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Avg. Order Value</span>
                            <div className={styles.statIcon}>
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className={styles.statValue}>{formatCurrency(metrics.averageOrderValue)}</div>
                    </div>
                </div>
            </div>

            {/* Top Performers */}
            {topPerformers.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Trophy size={24} style={{ display: 'inline', marginRight: '0.5rem', color: '#f59e0b' }} />
                        Top Performing Businesses
                    </h2>
                    <div className={styles.topPerformersList}>
                        {topPerformers.map((business, index) => (
                            <div key={business.id} className={styles.performerItem}>
                                <div className={styles.performerRank}>#{index + 1}</div>
                                <div className={styles.performerInfo}>
                                    <div className={styles.performerName}>{business.businessName}</div>
                                    <div className={styles.performerStats}>
                                        <span>{business.totalOrders} orders</span>
                                        <span>•</span>
                                        <span>AOV: {formatCurrency(business.totalRevenue / (business.totalOrders || 1))}</span>
                                    </div>
                                </div>
                                <div className={styles.performerRevenue}>
                                    {formatCurrency(business.totalRevenue)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Businesses Table */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>All Businesses ({businesses.length})</h2>

                {businesses.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Building2 size={48} className={styles.emptyStateIcon} />
                        <div className={styles.emptyStateTitle}>No businesses yet</div>
                        <div className={styles.emptyStateText}>
                            Get started by adding your first business entity.
                        </div>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead className={styles.tableHeader}>
                            <tr>
                                <th>Business Name</th>
                                <th>Contact</th>
                                <th>License</th>
                                <th>Status</th>
                                <th>Orders</th>
                                <th>Revenue</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {businesses.map((business) => (
                                <tr key={business.id} className={styles.tableRow}>
                                    <td>
                                        <div className={styles.businessName}>{business.businessName}</div>
                                        <div className={styles.businessEmail}>{business.legalName}</div>
                                    </td>
                                    <td>
                                        <div>{business.email}</div>
                                        <div className={styles.businessEmail}>{business.phone}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem' }}>{business.tradeLicense}</div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${business.status === 'verified' ? styles.statusVerified :
                                            business.status === 'pending' ? styles.statusPending :
                                                styles.statusRejected
                                            }`}>
                                            {business.status}
                                        </span>
                                    </td>
                                    <td>{business.totalOrders}</td>
                                    <td>{formatCurrency(business.totalRevenue)}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={`${styles.actionButton} ${styles.editButton}`}
                                                onClick={() => handleOpenModal(business)}
                                                title="Edit business"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => handleDelete(business.id)}
                                                title="Delete business"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editingBusiness ? 'Edit Business' : 'Add New Business'}
                            </h3>
                            <button className={styles.closeButton} onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                {errorMessage && (
                                    <div style={{
                                        padding: '1rem',
                                        background: '#fee2e2',
                                        color: '#991b1b',
                                        borderRadius: '6px',
                                        marginBottom: '1rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        ❌ {errorMessage}
                                    </div>
                                )}
                                <div className={styles.formGrid}>
                                    {!editingBusiness && (
                                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                            <label className={styles.label}>
                                                Select User<span className={styles.required}>*</span>
                                            </label>
                                            <select
                                                className={styles.select}
                                                value={formData.userId}
                                                onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) || '' })}
                                                required
                                            >
                                                <option value="">Choose a user...</option>
                                                {users.map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.email} - {user.role} {user.name ? `(${user.name})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            Business Name<span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            required
                                            placeholder="Enter business name"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            Legal Name<span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.legalName}
                                            onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                                            required
                                            placeholder="Enter legal name"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            Email<span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="email"
                                            className={styles.input}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            placeholder="business@example.com"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            Phone<span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            className={styles.input}
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            required
                                            placeholder="+8801712345678"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            Trade License<span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.tradeLicenseNumber}
                                            onChange={(e) => setFormData({ ...formData, tradeLicenseNumber: e.target.value })}
                                            required
                                            placeholder="Enter license number"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            Tax Certificate<span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.taxCertificateNumber}
                                            onChange={(e) => setFormData({ ...formData, taxCertificateNumber: e.target.value })}
                                            required
                                            placeholder="Enter certificate number"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            Expiry Date<span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className={styles.input}
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelButton} onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : (editingBusiness ? 'Update Business' : 'Create Business')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
