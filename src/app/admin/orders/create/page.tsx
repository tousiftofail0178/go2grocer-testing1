"use client";

import React from 'react';
import Link from 'next/link';
import styles from '../../admin.module.css';
import {
    ChevronLeft,
    Search,
    PenLine,
    Globe,
    ArrowRightLeft,
    CreditCard
} from 'lucide-react';

export default function CreateOrderPage() {
    return (
        <div>
            {/* Header */}
            <div className={styles.pageHeader} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link href="/admin/orders" style={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                    <button style={{ background: 'none', border: '1px solid #dcdcdc', borderRadius: 4, padding: '0.4rem', cursor: 'pointer' }}>
                        <ChevronLeft size={16} />
                    </button>
                </Link>
                <h1 className={styles.pageTitle}>Create order</h1>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.splitLayout}>

                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Products */}
                        <div className={styles.formSection}>
                            <div className={styles.formHeader}>
                                Products
                            </div>
                            <div className={styles.formContent}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Search size={16} style={{ position: 'absolute', left: 10, top: 12, color: '#999' }} />
                                        <input
                                            type="text"
                                            placeholder="Search products"
                                            className={styles.inputField}
                                            style={{ marginTop: 0, paddingLeft: '2rem' }}
                                        />
                                    </div>
                                    <button className={styles.secondaryBtn}>Browse</button>
                                    <button className={styles.secondaryBtn}>Add custom item</button>
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className={styles.formSection}>
                            <div className={styles.formHeader}>
                                Payment
                            </div>
                            <div className={styles.formContent}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <div>Subtotal</div>
                                    <div>৳0.00</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                    <div>Add discount</div>
                                    <div>—</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                    <div>Add shipping or delivery</div>
                                    <div>—</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                    <div>Estimated tax ⓘ</div>
                                    <div>Not calculated</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #eee', fontWeight: 600 }}>
                                    <div>Total</div>
                                    <div>৳0.00</div>
                                </div>
                            </div>
                            <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#666', marginBottom: 0 }}>
                                Add a product to calculate total and view payment options
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Notes */}
                        <div className={styles.formSection}>
                            <div className={styles.formHeader}>
                                Notes
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><PenLine size={14} /></button>
                            </div>
                            <div className={styles.formContent}>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>No notes</div>
                            </div>
                        </div>

                        {/* Customer */}
                        <div className={styles.formSection}>
                            <div className={styles.formHeader}>
                                Customer
                            </div>
                            <div className={styles.formContent}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: 10, top: 12, color: '#999' }} />
                                    <input
                                        type="text"
                                        placeholder="Search or create a customer"
                                        className={styles.inputField}
                                        style={{ marginTop: 0, paddingLeft: '2rem' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Markets */}
                        <div className={styles.formSection}>
                            <div className={styles.formHeader}>
                                Markets
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><ArrowRightLeft size={14} /></button>
                            </div>
                            <div className={styles.formContent}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Globe size={16} color="#666" />
                                    <span className={styles.badge} style={{ background: '#ebebeb', color: '#333', marginLeft: 0 }}>Belgium</span>
                                </div>

                                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Currency</div>
                                <select className={styles.inputField} style={{ padding: '0.5rem' }}>
                                    <option>Taka (BDT ৳)</option>
                                </select>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className={styles.formSection}>
                            <div className={styles.formHeader}>
                                Tags
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><PenLine size={14} /></button>
                            </div>
                            <div className={styles.formContent}>
                                <input type="text" className={styles.inputField} style={{ marginTop: 0 }} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
