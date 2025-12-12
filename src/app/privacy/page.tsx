import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function PrivacyPage() {
    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} />
                Back to Home
            </Link>

            <h1 className={styles.title}>Privacy Policy</h1>

            <div className={styles.content}>
                <p>At Go2Grocer, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our mobile application.</p>

                <h2>1. Information We Collect</h2>
                <p>We collect information that you provide directly to us when you register an account, make a purchase, or contact customer support. This may include:</p>
                <ul>
                    <li>Name and contact information (email, phone number)</li>
                    <li>Delivery address</li>
                    <li>Payment information (processed securely by third-party providers)</li>
                    <li>Business details (for B2B clients)</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                    <li>Process and deliver your orders</li>
                    <li>Manage your account and provide customer support</li>
                    <li>Send you order updates and promotional communications (you can opt-out)</li>
                    <li>Improve our services and website functionality</li>
                </ul>

                <h2>3. Information Sharing</h2>
                <p>We do not sell your personal information. We may share your information with:</p>
                <ul>
                    <li>Delivery partners to fulfill your orders</li>
                    <li>Service providers who assist our business operations</li>
                    <li>Law enforcement if required by law</li>
                </ul>

                <h2>4. Data Security</h2>
                <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

                <h2>5. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us at support@go2grocer.com.</p>
            </div>
        </div>
    );
}
