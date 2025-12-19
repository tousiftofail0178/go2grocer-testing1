"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import {
    Search,
    Filter,
    ArrowUpDown,
    Plus,
    Upload,
    MoreHorizontal
} from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    email: string;
    subscription: string;
    location: string;
    orders: number;
    spent: string;
    initial: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch('/api/admin/customers');
                if (res.ok) {
                    const data = await res.json();
                    setCustomers(data);
                }
            } catch (error) {
                console.error('Failed to fetch customers', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    // Filter Logic
    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedCustomers(filteredCustomers.map(c => c.id));
        } else {
            setSelectedCustomers([]);
        }
    };

    const handleSelectCustomer = (id: string) => {
        setSelectedCustomers(prev => {
            if (prev.includes(id)) return prev.filter(cId => cId !== id);
            return [...prev, id];
        });
    };

    return (
        <div>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Customers</h1>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={styles.secondaryBtn}
                        onClick={() => setShowImportModal(true)}
                    >
                        Export
                    </button>
                    <button
                        className={styles.secondaryBtn}
                        onClick={() => setShowImportModal(true)}
                    >
                        Import
                    </button>
                    <Link href="/admin/customers/new">
                        <button className={styles.primaryBtn}>Add customer</button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className={styles.contentContainer}>

                {/* Summary Card (Optional, matching style if needed, but going for table view as primary) */}
                {/* User screenshot shows "1 customer" "0% of your customer base" summary bar logic, which is nice. */}
                <div className={styles.card} style={{ padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.9rem', color: '#666' }}>
                    <div><strong style={{ color: '#000' }}>{customers.length}</strong> customers</div>
                    <div>0% of your customer base</div>
                </div>

                <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Filter Bar */}
                    <div className={styles.filterBar}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#999' }} />
                            <input
                                type="text"
                                placeholder="Search customers"
                                className={styles.inputField}
                                style={{ paddingLeft: '2rem', marginTop: 0 }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className={styles.filterBtn}><Filter size={16} /></button>
                        <button className={styles.filterBtn}><ArrowUpDown size={16} /></button>
                    </div>

                    {/* Table */}
                    <div className={styles.tableContainer}>
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading...</div>
                        ) : filteredCustomers.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center' }}>
                                <div style={{ marginBottom: '1rem', color: '#666' }}>
                                    <div style={{ width: 60, height: 60, background: '#f1f1f1', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: 30, height: 30, background: '#ccc', borderRadius: '50%' }}></div>
                                    </div>
                                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#000', marginBottom: '0.5rem' }}>No customers found</h2>
                                    <p>Try changing the filters or search term</p>
                                </div>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={{ width: 40 }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={filteredCustomers.length > 0 && selectedCustomers.length === filteredCustomers.length}
                                            />
                                        </th>
                                        <th>Customer name</th>
                                        <th>Email subscription</th>
                                        <th>Location</th>
                                        <th>Orders</th>
                                        <th style={{ textAlign: 'right' }}>Amount spent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map(customer => (
                                        <tr key={customer.id} className={selectedCustomers.includes(customer.id) ? styles.selectedRow : ''}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCustomers.includes(customer.id)}
                                                    onChange={() => handleSelectCustomer(customer.id)}
                                                />
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {/* Avatar / Initial */}
                                                    <div style={{
                                                        width: 24, height: 24, background: '#e1e3e5', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.75rem', fontWeight: 600, color: '#666'
                                                    }}>
                                                        {customer.initial}
                                                    </div>
                                                    <Link href={`/admin/customers/${customer.id}`} style={{ fontWeight: 600, color: '#000', textDecoration: 'none' }} className="hover:underline">
                                                        {customer.name}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.badge} ${customer.subscription === 'Subscribed' ? styles.success : styles.grey}`}>
                                                    {customer.subscription}
                                                </span>
                                            </td>
                                            <td>{customer.location}</td>
                                            <td>{customer.orders} orders</td>
                                            <td style={{ textAlign: 'right' }}>{customer.spent}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #eee' }}>
                        Learn more about customers
                    </div>
                </div>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className={styles.card} style={{ width: 500, padding: 0 }}>
                        <div className={styles.formHeader}>
                            Import customers by CSV
                            <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div className={styles.formContent}>
                            <div style={{
                                border: '1px dashed #ccc', borderRadius: '4px', padding: '3rem 2rem',
                                textAlign: 'center', marginBottom: '1.5rem', cursor: 'pointer',
                                background: '#fafafa'
                            }}>
                                <button className={styles.secondaryBtn} style={{ background: '#fff' }}>+ Add file</button>
                            </div>

                            <a href="#" style={{ color: '#007ace', fontSize: '0.9rem', textDecoration: 'none' }}>Download a sample CSV</a>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                <button className={styles.secondaryBtn} onClick={() => setShowImportModal(false)}>Cancel</button>
                                <button className={styles.primaryBtn} disabled>Import customers</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
