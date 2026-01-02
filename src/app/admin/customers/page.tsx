"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, UserPlus, Mail, Phone, Calendar, Award, X, User, Shield } from 'lucide-react';
import styles from './customers.module.css';

interface Customer {
    id: number;
    userId: number;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string | null;
    loyaltyPoints: number;
    totalOrders: number;
    totalSpent: number;
    joinDate: string;
    status: string;
    role: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, [searchTerm]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const url = `/api/customers${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setCustomers(data.customers || []);
            } else {
                console.error('Failed to fetch customers:', data.error);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Customers</h1>
                <Link href="/admin/customers/new" className={styles.addButton}>
                    <UserPlus size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Add Customer
                </Link>
            </div>

            {/* Search */}
            <div className={styles.controls}>
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className={styles.loading}>
                    <p>Loading customers...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && customers.length === 0 && (
                <div className={styles.emptyState}>
                    <UserPlus className={styles.emptyIcon} size={64} />
                    <h3 className={styles.emptyTitle}>No customers yet</h3>
                    <p className={styles.emptyText}>
                        {searchTerm
                            ? `No customers found matching "${searchTerm}"`
                            : 'Get started by adding your first customer'}
                    </p>
                    {!searchTerm && (
                        <Link href="/admin/customers/new" className={styles.addButton}>
                            Add Your First Customer
                        </Link>
                    )}
                </div>
            )}

            {/* Customers Grid */}
            {!loading && customers.length > 0 && (
                <div className={styles.customersGrid}>
                    {customers.map((customer) => (
                        <div key={customer.id} className={styles.customerCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.avatar}>
                                    {getInitials(customer.name)}
                                </div>
                                <div className={styles.cardInfo}>
                                    <h3 className={styles.customerName}>{customer.name}</h3>
                                    <p className={styles.customerEmail}>
                                        <Mail size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                        {customer.email}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.cardDetails}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>User ID</span>
                                    <span className={styles.detailValue}>
                                        <User size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                        #{customer.userId}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Role</span>
                                    <span className={styles.detailValue}>
                                        <Shield size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle', color: '#8b5cf6' }} />
                                        {customer.role || 'consumer'}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Phone</span>
                                    <span className={styles.detailValue}>
                                        <Phone size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                        {customer.phone}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Loyalty Points</span>
                                    <span className={styles.detailValue}>
                                        <Award size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle', color: '#f59e0b' }} />
                                        {customer.loyaltyPoints}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Joined</span>
                                    <span className={styles.detailValue}>
                                        <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                        {formatDate(customer.joinDate)}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Status</span>
                                    <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                                        {customer.status}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.cardActions}>
                                <button
                                    className={styles.actionButton}
                                    onClick={() => setSelectedCustomer(customer)}
                                >
                                    View Details
                                </button>
                                <Link
                                    href={`/admin/customers/${customer.id}/edit`}
                                    className={styles.actionButton}
                                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    Edit
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className={styles.modalOverlay} onClick={() => setSelectedCustomer(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Customer Details</h2>
                            <button className={styles.closeButton} onClick={() => setSelectedCustomer(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalSection}>
                                <h3>Personal Information</h3>
                                <div className={styles.modalGrid}>
                                    <div>
                                        <span className={styles.detailLabel}>Full Name</span>
                                        <p>{selectedCustomer.name}</p>
                                    </div>
                                    <div>
                                        <span className={styles.detailLabel}>Email</span>
                                        <p>{selectedCustomer.email}</p>
                                    </div>
                                    <div>
                                        <span className={styles.detailLabel}>Phone</span>
                                        <p>{selectedCustomer.phone}</p>
                                    </div>
                                    <div>
                                        <span className={styles.detailLabel}>Date of Birth</span>
                                        <p>{formatDate(selectedCustomer.dateOfBirth)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalSection}>
                                <h3>Account Information</h3>
                                <div className={styles.modalGrid}>
                                    <div>
                                        <span className={styles.detailLabel}>User ID</span>
                                        <p>#{selectedCustomer.userId}</p>
                                    </div>
                                    <div>
                                        <span className={styles.detailLabel}>Role</span>
                                        <p style={{ textTransform: 'capitalize' }}>{selectedCustomer.role || 'consumer'}</p>
                                    </div>
                                    <div>
                                        <span className={styles.detailLabel}>Status</span>
                                        <p style={{ textTransform: 'capitalize' }}>{selectedCustomer.status}</p>
                                    </div>
                                    <div>
                                        <span className={styles.detailLabel}>Joined</span>
                                        <p>{formatDate(selectedCustomer.joinDate)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalSection}>
                                <h3>Activity</h3>
                                <div className={styles.modalGrid}>
                                    <div>
                                        <span className={styles.detailLabel}>Loyalty Points</span>
                                        <p>{selectedCustomer.loyaltyPoints}</p>
                                    </div>
                                    <div>
                                        <span className={styles.detailLabel}>Total Orders</span>
                                        <p>{selectedCustomer.totalOrders}</p>
                                    </div>
                                    <div>
                                        <span className={styles.detailLabel}>Total Spent</span>
                                        <p>৳{selectedCustomer.totalSpent.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <Link
                                href={`/admin/customers/${selectedCustomer.id}/edit`}
                                className={styles.editButtonLarge}
                            >
                                Edit Customer
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
