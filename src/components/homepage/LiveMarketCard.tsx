"use client";

import { useState, useEffect } from 'react';
import { Wheat } from 'lucide-react';
import styles from '@/app/b2b-styles.module.css';

interface HeroProduct {
    globalProductId: number;
    name: string;
    skuBarcode: string | null;
    sellingPrice: string;
    packSizeLabel: string | null;
    stockQuantity: number | null;
}

interface LiveMarketCardProps {
    initialProduct: HeroProduct | null;
}

export function LiveMarketCard({ initialProduct }: LiveMarketCardProps) {
    const [products, setProducts] = useState<HeroProduct[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentProduct, setCurrentProduct] = useState<HeroProduct | null>(initialProduct);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch featured products on mount
    useEffect(() => {
        async function fetchProducts() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/products?limit=10');
                const data = await response.json();
                if (data && data.length > 0) {
                    setProducts(data);
                    setCurrentProduct(data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProducts();
    }, []);

    // Rotate products every 60 seconds
    useEffect(() => {
        if (products.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % products.length;
                setCurrentProduct(products[nextIndex]);
                return nextIndex;
            });
        }, 60000); // 60 seconds

        return () => clearInterval(interval);
    }, [products]);

    const displayProduct = currentProduct || initialProduct;

    if (!displayProduct) {
        return null;
    }

    return (
        <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
                <div>
                    <div className={styles.heroCardLabel}>LIVE MARKET RATE</div>
                    <div className={styles.heroCardPrice}>
                        ৳{Number(displayProduct.sellingPrice).toLocaleString()}
                    </div>
                    <div className={styles.heroCardUnit}>
                        Per {displayProduct.packSizeLabel || '50kg Sack'}
                    </div>
                </div>
                <div className={styles.heroCardIcon}>
                    <Wheat size={32} />
                </div>
            </div>
            <div className={styles.heroCardProgress}>
                <div className={styles.heroCardProgressBar}></div>
            </div>
            <div className={styles.heroCardFooter}>
                <span>STOCK: {displayProduct.stockQuantity && displayProduct.stockQuantity > 0 ? 'AVAILABLE' : 'HIGH'}</span>
                <span>SKU: {displayProduct.skuBarcode || 'N/A'}</span>
            </div>

            {/* Rotation indicator */}
            {products.length > 0 && (
                <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#a7f3d0'
                }}>
                    <span style={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '200px'
                    }}>
                        {displayProduct.name}
                    </span>
                    <span>{currentIndex + 1} / {products.length}</span>
                </div>
            )}
        </div>
    );
}
