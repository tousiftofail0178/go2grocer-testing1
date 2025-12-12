import React from 'react';
import Image from 'next/image';
import { Smartphone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export default function AppDownloadPage() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Order Groceries 2x Faster</h1>
                <p className={styles.subtitle}>
                    Download the Go2Grocer app for the best experience. Live tracking, exclusive deals, and personalized suggestions.
                </p>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <CheckCircle size={20} className={styles.checkIcon} />
                        <span>Real-time Order Tracking</span>
                    </div>
                    <div className={styles.feature}>
                        <CheckCircle size={20} className={styles.checkIcon} />
                        <span>Save your favorites</span>
                    </div>
                    <div className={styles.feature}>
                        <CheckCircle size={20} className={styles.checkIcon} />
                        <span>App-only discounts</span>
                    </div>
                </div>

                <div className={styles.buttons}>
                    <Button size="default" className={styles.storeBtn}>Google Play</Button>
                    <Button size="default" className={styles.storeBtn}>App Store</Button>
                </div>
            </div>

            <div className={styles.imageWrapper}>
                <div className={styles.phoneMockup}>
                    <Image
                        src="/images/app-mockup.png"
                        alt="Go2Grocer App"
                        width={300}
                        height={600}
                        className={styles.phoneImage}
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
