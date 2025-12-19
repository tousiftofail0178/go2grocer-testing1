"use client";

import React from 'react';
import styles from '../admin.module.css';
import { ShieldCheck, Info, ChevronRight, Printer } from 'lucide-react';

export default function FinancePage() {
    return (
        <div>
            <div className={styles.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className={styles.pageTitle}>Finance</h1>
                    <button style={{
                        background: '#e3e3e3', border: 'none', padding: '0.4rem 0.8rem',
                        borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#333'
                    }}>
                        Documents
                        <ChevronRight size={14} style={{ rotate: '90deg' }} />
                    </button>
                </div>
            </div>

            <div className={styles.contentContainer}>

                {/* Security Banner */}
                <div style={{
                    background: '#fff',
                    border: '1px solid #dcdcdc',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    gap: '1rem',
                    boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
                }}>
                    <div style={{ color: '#005bd3' }}>
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Add an extra layer of security</div>
                        <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '0.5rem' }}>
                            Turn on two-step authentication to use your account. <a href="#" style={{ color: '#005bd3', textDecoration: 'underline' }}>Learn more</a>
                        </div>
                        <button style={{
                            background: '#333', color: '#fff', border: 'none',
                            padding: '0.4rem 0.8rem', borderRadius: '4px',
                            fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer'
                        }}>
                            Set up two-step authentication
                        </button>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                        {/* Placeholder for device image */}
                        <div style={{ width: 80, height: 50, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', color: '#aaa' }}>
                            Device Img
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem', alignItems: 'start' }}>

                    {/* Left Column: Taxes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#333' }}>Taxes</div>

                        <div className={styles.card} style={{ padding: '0' }}>
                            <div style={{
                                padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                borderBottom: '1px solid #eee', cursor: 'pointer'
                            }}>
                                <span style={{ fontSize: '0.9rem' }}>Set up tax collection</span>
                                <ChevronRight size={16} color="#999" />
                            </div>
                            <div style={{
                                padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer'
                            }}>
                                <Printer size={18} color="#555" />
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Automated filing</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Inactive</div>
                                </div>
                                <ChevronRight size={16} color="#999" style={{ marginLeft: 'auto' }} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payouts */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Payout Balance Card */}
                        <div className={styles.card} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Payout balance</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Tk 0.00</div>
                                <div style={{ fontSize: '0.85rem', color: '#005bd3', marginTop: '0.5rem', cursor: 'pointer' }}>View payouts</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
                                    <div style={{ width: 16, height: 12, background: '#006a4e' }}></div> BDT
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>৳0.00</div>
                            </div>
                        </div>

                        {/* Manage Finances Card */}
                        <div className={styles.card} style={{
                            minHeight: '300px', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', textAlign: 'center'
                        }}>
                            {/* Placeholder generic illustration */}
                            <div style={{
                                width: 120, height: 80, background: '#e0f7fa', borderRadius: '50%',
                                marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <div style={{ width: 60, height: 40, background: '#00796b', borderRadius: 4 }}></div>
                            </div>

                            <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Manage your finances in Shopify</h2>
                            <p style={{ fontSize: '0.9rem', color: '#666', maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                                Set up Shopify Payments to get paid faster and offer a better checkout experience.
                            </p>
                            <button style={{
                                background: '#333', color: '#fff', border: 'none',
                                padding: '0.5rem 1rem', borderRadius: '4px',
                                fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer'
                            }}>
                                Activate Shopify Payments
                            </button>
                        </div>

                    </div>

                </div>

                <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#666' }}>
                    Learn more about <a href="#" style={{ textDecoration: 'underline', color: '#666' }}>Shopify Finance</a>
                </div>
            </div>
        </div>
    );
}
