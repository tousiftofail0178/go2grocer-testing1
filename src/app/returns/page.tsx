import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ReturnsPage() {
    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} />
                Back to Home
            </Link>

            <h1 className={styles.title}>Returns & Refunds Policy</h1>

            <div className={styles.content}>
                <p>At Go2Grocer, we are committed to providing you with the best quality groceries. If you are not completely satisfied with your purchase, we are here to help.</p>

                <h2>1. Returns</h2>
                <p>You have 24 hours to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.</p>

                <h2>2. Perishable Goods</h2>
                <p>Perishable goods such as vegetables, fruits, meat, and dairy products cannot be returned unless they were received in a damaged or spoiled condition. Please inspect these items immediately upon delivery.</p>

                <h2>3. Refunds</h2>
                <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
                <p>If your return is approved, we will initiate a refund to your original method of payment (or store credit if preferred). You will receive the credit within a certain amount of days, depending on your card issuer's policies.</p>

                <h2>4. Contact Us</h2>
                <p>If you have any questions on how to return your item to us, contact us at support@go2grocer.com or call +880 1234 567890.</p>
            </div>
        </div>
    );
}
