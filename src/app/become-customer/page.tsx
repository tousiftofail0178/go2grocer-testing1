import React from 'react';
import Link from 'next/link';
import { UserPlus, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function BecomeCustomerPage() {
    return (
        <main className={styles.container}>
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>
                    Welcome to Go2Grocer <span style={{ color: 'black' }}>Business</span>
                </h1>
                <p className={styles.heroSubtitle}>
                    Join thousands of businesses saving time and money with our premium wholesale service.
                </p>
            </section>

            <div className={styles.contentWrapper}>
                {/* CTA Section - Moved Top */}
                <div className={styles.ctaSection}>
                    <h2 className={styles.ctaTitle}>Ready to grow your business?</h2>
                    <p className={styles.ctaText}>
                        Create your account today and experience the difference.
                    </p>
                    <Link href="/signup" className={styles.registerButton}>
                        Register Business Now <ArrowRight style={{ display: 'inline', marginLeft: '0.5rem' }} size={20} />
                    </Link>
                </div>

                <div className={styles.stepsGrid}>
                    {/* Step 1 */}
                    <div className={styles.stepCard}>
                        <div className={styles.stepIcon}>
                            <UserPlus size={32} />
                        </div>
                        <h3 className={styles.stepTitle}>1. Register Online</h3>
                        <p className={styles.stepDesc}>
                            Complete the business registration form in just 2 minutes. Choose between Owner or Manager roles.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className={styles.stepCard}>
                        <div className={styles.stepIcon}>
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className={styles.stepTitle}>2. Get Verified</h3>
                        <p className={styles.stepDesc}>
                            We verify your business details to ensure a secure B2B environment. Owner accounts are manually approved.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className={styles.stepCard}>
                        <div className={styles.stepIcon}>
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className={styles.stepTitle}>3. Start Saving</h3>
                        <p className={styles.stepDesc}>
                            Access exclusive wholesale pricing, bulk discounts, and priority delivery slots immediately.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom CTA Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                <Link href="/signup" className={styles.registerButton}>
                    Register Business Now <ArrowRight style={{ display: 'inline', marginLeft: '0.5rem' }} size={20} />
                </Link>
            </div>
        </main>
    );
}
