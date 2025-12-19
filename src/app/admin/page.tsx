"use client";

import React from 'react';
import styles from './admin.module.css';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Home</h1>
            </div>

            <div className={styles.contentContainer}>

                {/* Metric Cards */}
                <div className={styles.cardGrid}>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Total Sales</div>
                        <div className={styles.cardValue}>Tk 24,500.00</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                            +12% from yesterday
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className={styles.cardTitle}>Total Orders</div>
                            <span className={styles.badge}>5 new</span>
                        </div>
                        <div className={styles.cardValue}>18</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                            4 to fulfill
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Active Sessions</div>
                        <div className={styles.cardValue}>32</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                            Currently online
                        </div>
                    </div>
                </div>

                {/* Setup Guide / Getting Started */}
                <div className={styles.setupGuide}>
                    <div className={styles.guideHeader}>
                        <h2 className={styles.guideTitle}>Setup Guide</h2>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#666' }}>
                            Use this personalized guide to get your store up and running.
                        </p>
                    </div>
                    <div className={styles.guideContent}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* Step 1 - Done */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', opacity: 0.6 }}>
                                <CheckCircle2 color="green" size={24} />
                                <div>
                                    <div style={{ fontWeight: 500, textDecoration: 'line-through' }}>Add your first product</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>You've added products to your store.</div>
                                </div>
                            </div>

                            {/* Step 2 - Active */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px dashed #999', flexShrink: 0 }}></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>Customize your online store</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666', margin: '0.25rem 0' }}>
                                        Choose a theme and add your logo, colors, and images to reflect your brand.
                                    </div>
                                    <button style={{
                                        marginTop: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        background: '#1a1a1a',
                                        color: '#fff',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}>
                                        Customize theme
                                    </button>
                                </div>
                            </div>

                            {/* Step 3 - Pending */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #e1e3e5', flexShrink: 0 }}></div>
                                <div>
                                    <div style={{ fontWeight: 500, color: '#444' }}>Add a custom domain</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className={styles.card}>
                    <div className={styles.cardTitle} style={{ marginBottom: '1rem' }}>Recent Orders</div>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '0.5rem', fontSize: '0.85rem', color: '#666' }}>Order</th>
                                <th style={{ padding: '0.5rem', fontSize: '0.85rem', color: '#666' }}>Date</th>
                                <th style={{ padding: '0.5rem', fontSize: '0.85rem', color: '#666' }}>Customer</th>
                                <th style={{ padding: '0.5rem', fontSize: '0.85rem', color: '#666' }}>Total</th>
                                <th style={{ padding: '0.5rem', fontSize: '0.85rem', color: '#666' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '0.75rem 0.5rem' }}>#1024</td>
                                <td style={{ padding: '0.75rem 0.5rem', color: '#666' }}>Today at 4:30 pm</td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>Farhan Ahmed</td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>Tk 1,200.00</td>
                                <td style={{ padding: '0.75rem 0.5rem' }}><span className={styles.badge} style={{ background: '#fff4e5', color: '#663c00' }}>Pending</span></td>
                            </tr>
                            <tr>
                                <td style={{ padding: '0.75rem 0.5rem' }}>#1023</td>
                                <td style={{ padding: '0.75rem 0.5rem', color: '#666' }}>Yesterday</td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>Rubaba Islam</td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>Tk 450.00</td>
                                <td style={{ padding: '0.75rem 0.5rem' }}><span className={styles.badge} style={{ background: '#fff4e5', color: '#663c00' }}>Pending</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
