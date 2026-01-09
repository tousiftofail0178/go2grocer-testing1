"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProductCard } from '@/components/ui/ProductCard';
import { productApi } from '@/lib/api';
import { Product, Category } from '@/lib/data';
import { useCartStore } from '@/store/useCartStore';
import styles from './page.module.css';

export default function ShopPage() {
    return (
        <React.Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={40} color="var(--primary-green)" /></div>}>
            <ShopContent />
        </React.Suspense>
    );
}

function ShopContent() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category'); // Get category from URL

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter State
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [onSaleOnly, setOnSaleOnly] = useState(false);
    // Initialize with URL category if present
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        categoryQuery ? [categoryQuery] : []
    );
    const [sortBy, setSortBy] = useState('popular');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    // Cart store
    const { items, addItem, updateQuantity } = useCartStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    fetch('/api/products').then(res => res.json()),
                    fetch('/api/categories').then(res => res.json())
                ]);
                setProducts(productsData);
                setFilteredProducts(productsData);
                setCategories(categoriesData);
            } catch (err) {
                console.error('Failed to fetch shop data:', err);
                setError('Failed to load products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Sync URL category with state when navigation occurs
    useEffect(() => {
        if (categoryQuery) {
            setSelectedCategories([categoryQuery]);
        } else {
            setSelectedCategories([]);
        }
    }, [categoryQuery]);

    // Effect to apply filters sorting whenever filter state changes
    useEffect(() => {
        let result = [...products];

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(query));
        }

        // Category Filter - use categoryId instead of slug
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(String(p.categoryId || p.category)));
        }

        // Price Filter
        if (minPrice) {
            result = result.filter(p => (p.price || 0) >= Number(minPrice));
        }
        if (maxPrice) {
            result = result.filter(p => (p.price || 0) <= Number(maxPrice));
        }

        // Availability Filter
        if (inStockOnly) {
            result = result.filter(p => p.inStock);
        }

        if (onSaleOnly) {
            result = result.filter(p => (p.discount && p.discount > 0) || (p.originalPrice && p.originalPrice > (p.price || 0)));
        }

        // Sort Logic
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-high':
                result.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'newest':
                // Assuming newer items have higher IDs or appear later if no date field
                // For now, let's reverse the default order as a proxy for "newest" if we don't have dates
                // Or if we have a real "isNew" flag, we could prioritize that, but standard sort usually expects timestamps.
                // Let's rely on ID string comparison for now if they are chronological, or just reverse.
                result.reverse();
                break;
            case 'popular':
            default:
                // Default order (usually what came from API)
                break;
        }

        setFilteredProducts(result);
    }, [products, minPrice, maxPrice, inStockOnly, onSaleOnly, selectedCategories, searchQuery, sortBy]);

    const handleCategoryChange = (slug: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(slug)) {
                return prev.filter(c => c !== slug);
            } else {
                return [...prev, slug];
            }
        });
    };

    const handleApplyFilters = () => {
        // Now handled by useEffect for automatic updates or can force re-render if needed
        // but state approach is cleaner. We keep this if manual "Apply" is strictly preferred for inputs.
    };

    if (isLoading) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary-green)" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Mobile Filter Toggle */}
            <div className={styles.mobileFilterBar}>
                <Button variant="secondary" fullWidth icon={<Filter size={16} />}>
                    Filters
                </Button>
                <div className={styles.sortWrapper}>
                    <select
                        className={styles.sortSelect}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="popular">Sort by: Popular</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest First</option>
                    </select>
                </div>
            </div>

            <div className={styles.layout}>
                {/* Sidebar Filters */}
                <aside className={styles.sidebar}>
                    <div className={styles.filterSection}>
                        <h3 className={styles.filterTitle}>Categories</h3>
                        <div className={styles.filterList}>
                            {categories.map((category) => (
                                <label key={category.categoryId} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={selectedCategories.includes(String(category.categoryId))}
                                        onChange={() => handleCategoryChange(String(category.categoryId))}
                                    />
                                    <span>{category.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h3 className={styles.filterTitle}>Price Range</h3>
                        <div className={styles.priceInputs}>
                            <Input
                                placeholder="Min"
                                type="number"
                                className={styles.priceInput}
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span className={styles.priceSeparator}>-</span>
                            <Input
                                placeholder="Max"
                                type="number"
                                className={styles.priceInput}
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="secondary"
                            size="small"
                            fullWidth
                            onClick={handleApplyFilters}
                        >
                            Apply
                        </Button>
                    </div>

                    <div className={styles.filterSection}>
                        <h3 className={styles.filterTitle}>Availability</h3>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={inStockOnly}
                                onChange={(e) => setInStockOnly(e.target.checked)}
                            />
                            <span>In Stock Only</span>
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={onSaleOnly}
                                onChange={(e) => setOnSaleOnly(e.target.checked)}
                            />
                            <span>On Sale</span>
                        </label>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={styles.main}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>All Products</h1>
                        <div className={styles.desktopSort}>
                            <span className={styles.sortLabel}>Sort by:</span>
                            <select
                                className={styles.sortSelect}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="popular">Popular</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.grid}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => {
                                const cartItem = items.find(item => item.id === product.id);
                                return (
                                    <ProductCard
                                        key={product.globalProductId}
                                        product={{
                                            ...product,
                                            id: String(product.globalProductId),
                                            name: product.name,
                                            // FIX: Use baseImageUrl and provide a fallback
                                            image: product.baseImageUrl ? product.baseImageUrl : "/images/placeholder.jpg",
                                            price: Number(product.sellingPrice),
                                            unit: product.packSizeLabel || product.baseUnit,
                                            // Default values for missing fields
                                            discount: 0,
                                            rating: 5
                                        }}
                                        onAdd={(p) => addItem({ ...product, ...p } as any)}
                                        quantity={cartItem?.quantity || 0}
                                        onUpdateQuantity={(qty) => updateQuantity(product.id, qty)}
                                    />
                                );
                            })
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                                <p>No products match your price range.</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.pagination}>
                        <Button variant="secondary">Load More</Button>
                    </div>
                </main>
            </div>
        </div>
    );
}
