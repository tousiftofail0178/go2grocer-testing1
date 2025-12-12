"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Gift, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './page.module.css';

export default function LoyaltyPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [showSuccess, setShowSuccess] = React.useState(false);

    const handleJoin = () => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/loyalty');
            return;
        }
        setShowSuccess(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>Go2Points Loyalty Program</h1>
                    <p className={styles.subtitle}>
                        Earn points on every order and redeem them for exclusive discounts and free products.
                    </p>
                    <Button
                        size="default"
                        className={styles.joinBtn}
                        onClick={handleJoin}
                    >
                        Join for Free
                    </Button>
                </div>
                <div className={styles.heroIcon}>
                    <Star size={120} fill="#FFCE3A" stroke="#FFCE3A" />
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.iconWrapper}><TrendingUp size={32} /></div>
                    <h3 className={styles.cardTitle}>Earn Points</h3>
                    <p className={styles.cardText}>Get 1 Point for every ৳100 spent. Look out for double points days!</p>
                </div>
                <div className={styles.card}>
                    <div className={styles.iconWrapper}><Gift size={32} /></div>
                    <h3 className={styles.cardTitle}>Redeem Rewards</h3>
                    <p className={styles.cardText}>Use your points to pay for orders or unlock special reward items.</p>
                </div>
                <div className={styles.card}>
                    <div className={styles.iconWrapper}><Star size={32} /></div>
                    <h3 className={styles.cardTitle}>VIP Tiers</h3>
                    <p className={styles.cardText}>Reach Gold tier to get free delivery on all orders and priority support.</p>
                </div>
            </div>

            <div className={styles.tiersSection}>
                <h2 className={styles.sectionTitle}>Membership Tiers</h2>
                <div className={styles.tiersGrid}>
                    <div className={styles.tierCard}>
                        <h3 className={styles.tierName}>Bronze</h3>
                        <p className={styles.tierRequirement}>0 - 500 Points</p>
                        <ul className={styles.tierBenefits}>
                            <li>Earn 1x Points</li>
                            <li>Standard Support</li>
                        </ul>
                    </div>
                    <div className={`${styles.tierCard} ${styles.silverTier}`}>
                        <h3 className={styles.tierName}>Silver</h3>
                        <p className={styles.tierRequirement}>500 - 2000 Points</p>
                        <ul className={styles.tierBenefits}>
                            <li>Earn 1.5x Points</li>
                            <li>Priority Delivery Slots</li>
                        </ul>
                    </div>
                    <div className={`${styles.tierCard} ${styles.goldTier}`}>
                        <h3 className={styles.tierName}>Gold</h3>
                        <p className={styles.tierRequirement}>2000+ Points</p>
                        <ul className={styles.tierBenefits}>
                            <li>Earn 2x Points</li>
                            <li>Free Delivery</li>
                            <li>VIP Support</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--white)',
                        padding: '2rem',
                        borderRadius: '1.5rem',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        position: 'relative',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            marginBottom: '1.5rem',
                            display: 'inline-flex',
                            padding: '1rem',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)'
                        }}>
                            <Star size={48} className={styles.highlight} fill="var(--primary-green)" />
                        </div>

                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-black)' }}>Welcome to Go2Points!</h3>
                        <p style={{ color: 'var(--text-grey)', lineHeight: 1.5, marginBottom: '2rem' }}>
                            You are now a member. Start earning points on your next order!
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                            <Button fullWidth onClick={() => router.push('/profile')}>View My Points</Button>
                            <button
                                onClick={() => setShowSuccess(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-grey)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    fontSize: '0.9375rem'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
