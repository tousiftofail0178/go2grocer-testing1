import React from 'react';
import { MapPin, Clock, Truck } from 'lucide-react';
import { DELIVERY_AREAS } from '@/lib/data';
import styles from '../static-pages.module.css';

export default function DeliveryInfoPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Delivery Information</h1>
            <p className={styles.subtitle}>
                We deliver fresh groceries to your doorstep in Chittagong. Check our coverage areas and delivery times below.
            </p>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Delivery Areas</h2>
                <p className={styles.text}>Currently, we are serving the following areas in Chittagong:</p>
                <ul className={styles.list}>
                    {DELIVERY_AREAS.map((area) => (
                        <li key={area}>{area}</li>
                    ))}
                </ul>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Delivery Times & Fees</h2>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <Clock className={styles.highlight} size={32} />
                        <h3 className={styles.cardTitle}>Express Delivery</h3>
                        <p className={styles.text}>Get your order in 30-60 minutes.</p>
                        <p className={styles.text}><strong>Fee: ৳60</strong> (Free for orders above ৳3000)</p>
                    </div>
                    <div className={styles.card}>
                        <Truck className={styles.highlight} size={32} />
                        <h3 className={styles.cardTitle}>Standard Delivery</h3>
                        <p className={styles.text}>Choose a convenient time slot.</p>
                        <p className={styles.text}><strong>Fee: ৳40</strong> (Free for orders above ৳3000)</p>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Delivery Policy</h2>
                <p className={styles.text}>
                    We ensure that your products are handled with care and delivered fresh.
                    If you are not satisfied with the quality of any item, you can return it immediately
                    to the delivery person for a full refund or replacement.
                </p>
            </div>
        </div>
    );
}
