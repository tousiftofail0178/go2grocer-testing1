"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Star } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { QuantitySelector } from './QuantitySelector';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './ProductCard.module.css';
import { Product } from '@/lib/data';

interface ProductCardProps {
    product: Product;
    onAdd?: (product: Product) => void;
    quantity?: number;
    onUpdateQuantity?: (quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAdd,
    quantity = 0,
    onUpdateQuantity
}) => {
    const { isAuthenticated } = useAuthStore();
    const discountPercentage = (product.originalPrice && product.price)
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className={styles.card}>
            <Link href={`/product/${product.id}`} className={styles.imageWrapper}>
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                {discountPercentage > 0 && (
                    <div className={styles.badgeWrapper}>
                        <Badge variant="danger">{discountPercentage}% OFF</Badge>
                    </div>
                )}
            </Link>

            <div className={styles.content}>
                <div className={styles.header}>
                    <Link href={`/product/${product.id}`} className={styles.nameLink}>
                        <h3 className={styles.name} title={product.name}>{product.name}</h3>
                    </Link>
                    <span className={styles.weight}>{product.weight}</span>
                </div>

                <div className={styles.rating}>
                    <Star size={12} fill="#FFCE3A" stroke="#FFCE3A" />
                    <span>{product.rating}</span>
                </div>

                <div className={styles.footer}>
                    {/* Show price if: (1) Price exists AND (2) [Not hidden OR User is authenticated] */}
                    {product.price !== undefined && (!product.isPriceHidden || isAuthenticated) ? (
                        <>
                            <div className={styles.priceWrapper}>
                                <span className={styles.price}>৳{product.price}</span>
                                {product.originalPrice && (
                                    <span className={styles.originalPrice}>৳{product.originalPrice}</span>
                                )}
                            </div>
                            <div className={styles.action}>
                                {quantity > 0 ? (
                                    <QuantitySelector
                                        quantity={quantity}
                                        onIncrease={() => onUpdateQuantity?.(quantity + 1)}
                                        onDecrease={() => onUpdateQuantity?.(quantity - 1)}
                                        size="small"
                                    />
                                ) : (
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        className={styles.addButton}
                                        onClick={() => onAdd?.(product)}
                                        disabled={!product.inStock}
                                    >
                                        <Plus size={16} />
                                        Add
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link href="/login" style={{ width: '100%' }}>
                            <Button
                                variant="secondary"
                                size="small"
                                fullWidth
                                style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                            >
                                Login for Price
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};
