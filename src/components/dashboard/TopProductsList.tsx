"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import styles from './TopProductsList.module.css';

interface TopProduct {
    id: string;
    name: string;
    sales: number;
    revenue: number;
    image?: string;
}

export default function TopProductsList() {
    // Mock data - will be replaced with real data
    const topProducts: TopProduct[] = [
        { id: '1', name: 'Fresh Tomatoes', sales: 145, revenue: 7250 },
        { id: '2', name: 'Organic Carrots', sales: 128, revenue: 6400 },
        { id: '3', name: 'Green Lettuce', sales: 112, revenue: 5600 },
        { id: '4', name: 'Red Onions', sales: 98, revenue: 4900 },
        { id: '5', name: 'Fresh Milk', sales: 87, revenue: 4350 },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Top Products</h3>
                <Link href="/admin/products" className={styles.viewAllLink}>
                    View All <ArrowRight size={16} />
                </Link>
            </div>

            <div className={styles.productsList}>
                {topProducts.map((product) => (
                    <div key={product.id} className={styles.productItem}>
                        <div className={styles.icon}>
                            <Package size={20} color="#3b82f6" />
                        </div>

                        <div className={styles.productInfo}>
                            <p className={styles.productName}>{product.name}</p>
                            <p className={styles.productSales}>{product.sales} sales</p>
                        </div>

                        <div className={styles.productStats}>
                            <p className={styles.productRevenue}>৳{product.revenue.toLocaleString()}</p>
                            <div className={styles.progressBarContainer}>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${Math.min((product.sales / 150) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
