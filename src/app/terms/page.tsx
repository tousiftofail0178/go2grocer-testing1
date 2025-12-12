import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function TermsPage() {
    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} />
                Back to Home
            </Link>

            <h1 className={styles.title}>Terms & Conditions</h1>

            <div className={styles.content}>
                <p>Welcome to Go2Grocer! These terms and conditions outline the rules and regulations for the use of Go2Grocer's Website and Mobile Application.</p>

                <h2>1. Introduction</h2>
                <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Go2Grocer if you do not agree to take all of the terms and conditions stated on this page.</p>

                <h2>2. Cookies</h2>
                <p>We employ the use of cookies. By accessing Go2Grocer, you agreed to use cookies in agreement with the Go2Grocer's Privacy Policy.</p>

                <h2>3. License</h2>
                <p>Unless otherwise stated, Go2Grocer and/or its licensors own the intellectual property rights for all material on Go2Grocer. All intellectual property rights are reserved. You may access this from Go2Grocer for your own personal use subjected to restrictions set in these terms and conditions.</p>

                <h2>4. User Accounts</h2>
                <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

                <h2>5. Product Description</h2>
                <p>We attempt to be as accurate as possible. However, we do not warrant that product descriptions or other content of this site is accurate, complete, reliable, current, or error-free.</p>

                <h2>6. Pricing</h2>
                <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>

                <h2>7. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at support@go2grocer.com.</p>
            </div>
        </div>
    );
}
