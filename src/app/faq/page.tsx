import React from 'react';
import styles from '../static-pages.module.css';

export default function FAQPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Frequently Asked Questions</h1>
            <p className={styles.subtitle}>
                Find answers to common questions about ordering, delivery, and payments.
            </p>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Ordering & Account</h2>
                <div className={styles.text}>
                    <strong>How do I place an order?</strong>
                    <p>Simply browse our website or app, add items to your cart, and proceed to checkout. You can pay via Cash on Delivery or Digital Payments.</p>
                </div>
                <div className={styles.text}>
                    <strong>Do I need an account to order?</strong>
                    <p>Yes, you need to sign up with your phone number to track your orders and earn loyalty points.</p>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Delivery</h2>
                <div className={styles.text}>
                    <strong>How long does delivery take?</strong>
                    <p>We offer Express Delivery (30-60 mins) in selected areas and Standard Delivery slots throughout the day.</p>
                </div>
                <div className={styles.text}>
                    <strong>What is the delivery fee?</strong>
                    <p>Standard delivery fee is ৳40. Express delivery is ৳60. Free delivery on orders above specific amounts.</p>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Returns & Refunds</h2>
                <div className={styles.text}>
                    <strong>Can I return items?</strong>
                    <p>Yes, you can return items at the time of delivery if you are not satisfied with the quality. We have a &quot;no questions asked&quot; return policy for fresh items.</p>
                </div>
            </div>
        </div>
    );
}
