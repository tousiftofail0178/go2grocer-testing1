"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ChevronRight, Loader2, Minus, Plus, Package, CheckCircle, XCircle, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SaveToListModal } from '@/components/lists/SaveToListModal';
import styles from './page.module.css';

interface Product {
    globalProductId: number;
    skuBarcode: string;
    name: string;
    baseImageUrl: string;
    sellingPrice: string;
    costPrice: string;
    packSizeLabel: string;
    baseUnit: string;
    stockQuantity: number;
    categoryId: number;
    categoryName?: string;
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isListModalOpen, setIsListModalOpen] = useState(false);

    const { addItem, items } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const cartItem = items.find(item => item.id === String(product?.globalProductId));

    useEffect(() => {
        async function fetchProduct() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/products/${params.id}`);

                if (!response.ok) {
                    throw new Error('Product not found');
                }

                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load product');
            } finally {
                setIsLoading(false);
            }
        }

        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    const handleAddToCart = () => {
        if (!product) return;

        addItem({
            id: String(product.globalProductId),
            name: product.name,
            price: Number(product.sellingPrice),
            image: product.baseImageUrl || '/images/placeholder.jpg',
            weight: product.packSizeLabel || product.baseUnit || 'N/A',
            unit: product.packSizeLabel || product.baseUnit,
            rating: 5,
            category: product.categoryName || 'Product',
            inStock: product.stockQuantity > 0,
        });
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Loader2 className="animate-spin" size={48} color="var(--primary-green)" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={styles.error}>
                <h1 className={styles.errorTitle}>Product Not Found</h1>
                <p className={styles.errorText}>{error || 'This product does not exist.'}</p>
                <Button onClick={() => router.push('/shop')}>Back to Shop</Button>
            </div>
        );
    }

    const sellingPrice = Number(product.sellingPrice);
    const costPrice = Number(product.costPrice);
    const discount = costPrice > sellingPrice ? Math.round(((costPrice - sellingPrice) / costPrice) * 100) : 0;
    const isInStock = product.stockQuantity > 0;

    return (
        <div className={styles.container}>
            {/* Breadcrumb */}
            <div className={styles.breadcrumb}>
                <Link href="/">Home</Link>
                <span className={styles.breadcrumbSeparator}>›</span>
                <Link href="/shop">Shop</Link>
                <span className={styles.breadcrumbSeparator}>›</span>
                <span>{product.name}</span>
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
                {/* Image Section */}
                <div className={styles.imageSection}>
                    <div className={styles.mainImage}>
                        <Image
                            src={product.baseImageUrl || '/images/placeholder.jpg'}
                            alt={product.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                        />
                        {discount > 0 && (
                            <div className={styles.badge}>
                                <Badge variant="warning">{discount}% OFF</Badge>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                    {product.categoryName && (
                        <div className={styles.category}>{product.categoryName}</div>
                    )}

                    <h1 className={styles.title}>{product.name}</h1>

                    <div className={styles.packSize}>
                        <Package size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        {product.packSizeLabel || product.baseUnit}
                    </div>

                    <div className={styles.rating}>
                        <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} fill="#FFB800" color="#FFB800" />
                            ))}
                        </div>
                        <span className={styles.ratingText}>(5.0)</span>
                    </div>

                    {/* Price Section */}
                    <div className={styles.priceSection}>
                        <div className={styles.priceRow}>
                            <span className={styles.currentPrice}>৳{sellingPrice.toFixed(0)}</span>
                            {discount > 0 && (
                                <span className={styles.originalPrice}>৳{costPrice.toFixed(0)}</span>
                            )}
                        </div>
                        {discount > 0 && (
                            <div className={styles.savings}>
                                You save ৳{(costPrice - sellingPrice).toFixed(0)} ({discount}% off)
                            </div>
                        )}
                    </div>

                    <div className={styles.sku}>
                        SKU: <strong>{product.skuBarcode}</strong>
                    </div>

                    {/* Conditional Rendering Based on Authentication */}
                    {isAuthenticated ? (
                        <>
                            {/* Stock Info - Only for logged-in users */}
                            <div className={styles.stockInfo}>
                                {isInStock ? (
                                    <>
                                        <CheckCircle size={20} color="#10b981" />
                                        <span className={styles.inStock}>In Stock ({product.stockQuantity} units available)</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={20} color="#dc2626" />
                                        <span className={styles.outOfStock}>Out of Stock</span>
                                    </>
                                )}
                            </div>

                            {/* Actions - Only for logged-in users */}
                            <div className={styles.actions}>
                                <div className={styles.quantityControls}>
                                    <button
                                        className={styles.quantityButton}
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className={styles.quantity}>{quantity}</span>
                                    <button
                                        className={styles.quantityButton}
                                        onClick={() => setQuantity(quantity + 1)}
                                        disabled={!isInStock || quantity >= product.stockQuantity}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={handleAddToCart}
                                    disabled={!isInStock}
                                    className={styles.addToCartButton}
                                >
                                    Add to Cart
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsListModalOpen(true)}
                                    className={styles.addToListButton}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        border: '2px solid #d1d5db',
                                        backgroundColor: 'white',
                                        color: '#374151'
                                    }}
                                >
                                    <BookmarkPlus size={20} />
                                    Add to List
                                </Button>
                            </div>

                            {cartItem && (
                                <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid var(--primary-green)' }}>
                                    <strong style={{ color: 'var(--primary-green)' }}>
                                        ✓ {cartItem.quantity} {cartItem.quantity > 1 ? 'units' : 'unit'} in cart
                                    </strong>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Guest Access Box - For non-logged-in users */
                        <div className={styles.guestAccessBox}>
                            <h3 className={styles.guestAccessHeading}>Login to order</h3>
                            <p className={styles.guestAccessText}>
                                Please log in or create an account to view stock availability and place orders.
                            </p>
                            <div className={styles.guestAccessActions}>
                                <Link href="/login" style={{ flex: 1 }}>
                                    <Button variant="secondary" style={{ width: '100%' }}>
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/become-customer" style={{ flex: 1 }}>
                                    <Button variant="primary" style={{ width: '100%' }}>
                                        Register
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className={styles.description}>
                <h2 className={styles.sectionTitle}>Product Description</h2>
                <p className={styles.descriptionText}>
                    Premium quality {product.name.toLowerCase()} sourced directly from trusted suppliers.
                    Perfect for wholesale distribution and bulk orders. This product is packed in {product.packSizeLabel || product.baseUnit}
                    for convenient handling and storage.
                </p>
                <p className={styles.descriptionText}>
                    Our B2B platform ensures competitive pricing, reliable stock availability, and fast delivery
                    to meet your business needs.
                </p>
            </div>

            {/* Add to List Modal */}
            <SaveToListModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                productId={product.globalProductId}
            />
        </div>
    );
}
