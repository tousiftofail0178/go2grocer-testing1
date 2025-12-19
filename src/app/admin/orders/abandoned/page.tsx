"use client";

import React from 'react';
import styles from '../../admin.module.css';
import { ShoppingCart, X } from 'lucide-react';

export default function AbandonedCheckoutsPage() {
    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Abandoned checkouts</h1>
            </div>

            <div className={styles.contentContainer}>

                {/* Empty State Card */}
                <div className={styles.card} style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>

                    {/* Illustration Placeholder */}
                    <div style={{ position: 'relative', width: 100, height: 100, background: '#f0f0f0', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingCart size={40} color="#5c5f62" />
                        <div style={{ position: 'absolute', top: 0, right: 0, background: '#ff6f61', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={16} color="#fff" />
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Abandoned checkouts will show here</h2>
                    <p style={{ fontSize: '0.9rem', color: '#666', maxWidth: '400px', lineHeight: '1.4' }}>
                        See when customers put an item in their cart but don't check out. You can also email customers a link to their cart.
                    </p>

                </div>

                {/* Footer Section */}
                <div style={{ textAlign: 'center', borderTop: '1px solid #e1e3e5', paddingTop: '2rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Recover sales with your abandoned checkout email</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem', maxWidth: '600px', margin: '0 auto 1rem' }}>
                        An automated email is already created for you. Take a moment to review the email and make any additional adjustments to the design, messaging, or recipient list.
                    </p>
                    <button className={styles.secondaryBtn}>Review email</button>
                </div>

            </div>
        </div>
    );
}
