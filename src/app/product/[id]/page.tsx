"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/ui/ProductCard';
import { productApi } from '@/lib/api';
import { Product } from '@/lib/data';
import { useCartStore } from '@/store/useCartStore';
import { generateProductSchema } from '@/lib/seo';
import styles from './page.module.css';

export default function ProductPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addItem, items, updateQuantity } = useCartStore();

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const productData = await productApi.getProduct(id);
                setProduct(productData);

                // Fetch similar products (mock logic: fetch all and slice)
                const allProducts = await productApi.getProducts();
                const productsList = Array.isArray(allProducts) ? allProducts : allProducts.data || [];
                setSimilarProducts(productsList.slice(0, 4));
            } catch (err) {
                console.error('Failed to fetch product:', err);
                // Fallback to mock data
                const { products } = await import('@/lib/data');
                const found = products.find(p => p.id.toString() === id) || products[0];
                setProduct(found);
                setSimilarProducts(products.slice(1, 5));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (isLoading) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary-green)" />
            </div>
        );
    }

    if (!product) return <div>Product not found</div>;

    const productSchema = generateProductSchema({
        name: product.name,
        price: product.price || 0,
        image: product.image,
        rating: product.rating,
        reviewCount: 128,
        availability: 'InStock',
    });

    return (
        <>
            <Script
                id="product-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <div className={styles.container}>
                <div className={styles.topSection}>
                    {/* Left: Image Gallery */}
                    <div className={styles.gallery}>
                        <div className={styles.mainImageWrapper}>
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className={styles.mainImage}
                                priority
                            />
                            {product.discount && (
                                <div className={styles.badgeWrapper}>
                                    <Badge variant="danger" className={styles.discountBadge}>{product.discount}% OFF</Badge>
                                </div>
                            )}
                        </div>
                        <div className={styles.thumbnails}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`${styles.thumbnail} ${i === 1 ? styles.activeThumbnail : ''}`}>
                                    <Image
                                        src={product.image}
                                        alt={`${product.name} view ${i}`}
                                        fill
                                        className={styles.thumbnailImage}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className={styles.info}>
                        <div className={styles.header}>
                            <h1 className={styles.title}>{product.name}</h1>
                            <div className={styles.meta}>
                                <div className={styles.rating}>
                                    <div className={styles.stars}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={16}
                                                fill={star <= Math.floor(product.rating) ? "#FFCE3A" : "none"}
                                                stroke={star <= Math.floor(product.rating) ? "#FFCE3A" : "#E0E3EB"}
                                            />
                                        ))}
                                    </div>
                                    <span className={styles.ratingCount}>(128 reviews)</span>
                                </div>
                                <span className={styles.sku}>SKU: G2G-{product.id.toString().toUpperCase()}</span>
                            </div>
                        </div>

                        <div className={styles.priceSection}>
                            <div className={styles.prices}>
                                {product.price !== undefined ? (
                                    <>
                                        <span className={styles.currentPrice}>৳{product.price}</span>
                                        {product.originalPrice && (
                                            <span className={styles.originalPrice}>৳{product.originalPrice}</span>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ padding: '0.5rem 0' }}>
                                        <Link href="/login">
                                            <Button variant="secondary">
                                                Sign up/Login for Price
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <span className={styles.taxInfo}>Inclusive of all taxes</span>
                        </div>

                        <div className={styles.variantSection}>
                            <span className={styles.label}>Pack Size:</span>
                            <div className={styles.variants}>
                                <button className={`${styles.variant} ${styles.activeVariant}`}>{product.weight}</button>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            {product.price !== undefined ? (
                                <>
                                    <div className={styles.quantityControl}>
                                        <button className={styles.qtyBtn}><Minus size={18} /></button>
                                        <span className={styles.qtyValue}>1</span>
                                        <button className={styles.qtyBtn}><Plus size={18} /></button>
                                    </div>
                                    <Button
                                        className={styles.addToCartBtn}
                                        fullWidth
                                        onClick={() => product && addItem(product)}
                                    >
                                        Add to Cart
                                    </Button>
                                </>
                            ) : (
                                <div style={{ width: '100%' }}>
                                    {/* Placeholder or alternative CTA if needed, but the login button is above */}
                                    {/* Maybe duplicate the login button or leave empty to rely on the price section CTA */}
                                    <Link href="/login" style={{ width: '100%' }}>
                                        <Button fullWidth>Login to Order</Button>
                                    </Link>
                                </div>
                            )}
                            <button className={styles.wishlistBtn}><Heart size={20} /></button>
                        </div>

                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <Truck size={20} className={styles.featureIcon} />
                                <div className={styles.featureText}>
                                    <span className={styles.featureTitle}>Fast Delivery</span>
                                    <span className={styles.featureDesc}>30-60 mins in Nasirabad</span>
                                </div>
                            </div>
                            <div className={styles.feature}>
                                <ShieldCheck size={20} className={styles.featureIcon} />
                                <div className={styles.featureText}>
                                    <span className={styles.featureTitle}>Quality Guarantee</span>
                                    <span className={styles.featureDesc}>100% organic & fresh</span>
                                </div>
                            </div>
                            <div className={styles.feature}>
                                <RefreshCw size={20} className={styles.featureIcon} />
                                <div className={styles.featureText}>
                                    <span className={styles.featureTitle}>Easy Returns</span>
                                    <span className={styles.featureDesc}>No questions asked return</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className={styles.tabsSection}>
                    <div className={styles.tabs}>
                        <button className={`${styles.tab} ${styles.activeTab}`}>Description</button>
                        <button className={styles.tab}>Nutrition Facts</button>
                        <button className={styles.tab}>Reviews (128)</button>
                    </div>
                    <div className={styles.tabContent}>
                        <p>
                            Fresh and organic {product.name} sourced directly from local farmers in Chittagong.
                            Perfect for your daily cooking needs. We ensure the highest quality and freshness
                            delivered right to your doorstep.
                        </p>
                        <ul className={styles.detailsList}>
                            <li><strong>Origin:</strong> Chittagong, Bangladesh</li>
                            <li><strong>Storage:</strong> Keep in a cool, dry place</li>
                            <li><strong>Shelf Life:</strong> 3-4 days</li>
                        </ul>
                    </div>
                </div>

                {/* Similar Products */}
                <section className={styles.similarSection}>
                    <h2 className={styles.sectionTitle}>You May Also Like</h2>
                    <div className={styles.similarGrid}>
                        {similarProducts.map((item) => {
                            const cartItem = items.find(ci => ci.id === item.id);
                            return (
                                <ProductCard
                                    key={item.id}
                                    product={item}
                                    onAdd={addItem}
                                    quantity={cartItem?.quantity || 0}
                                    onUpdateQuantity={(q) => updateQuantity(item.id, q)}
                                />
                            );
                        })}
                    </div>
                </section>
            </div>
        </>
    );
}
