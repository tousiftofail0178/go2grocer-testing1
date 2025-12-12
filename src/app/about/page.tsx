import React from 'react';
import Image from 'next/image';
import styles from '../static-pages.module.css';

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>About Go2Grocer</h1>
            <p className={styles.subtitle}>
                Making grocery shopping easier, faster, and fresher for the people of Chittagong.
            </p>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Our Story</h2>
                <p className={styles.text}>
                    Go2Grocer was founded with a simple mission: to save you time and deliver the freshest produce to your kitchen.
                    We realized that people in Chittagong needed a reliable online grocery service that understands local needs.
                </p>
                <p className={styles.text}>
                    Starting from a small warehouse in Nasirabad, we have grown to serve thousands of happy customers across the city.
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Our Mission</h2>
                <ul className={styles.list}>
                    <li><strong>Freshness First:</strong> We source directly from farmers and trusted suppliers.</li>
                    <li><strong>Fast Delivery:</strong> We value your time and strive to deliver within the promised window.</li>
                    <li><strong>Customer Happiness:</strong> Your satisfaction is our top priority.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>How We Operate</h2>
                <p className={styles.text}>
                    Our dark store model allows us to pick and pack your order in minutes.
                    Our fleet of dedicated riders ensures that your groceries reach you safely and quickly.
                </p>
            </div>
        </div>
    );
}
