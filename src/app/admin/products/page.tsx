"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Loader2, Package, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { getGroupedProducts, getVariantsByGroupId, deleteProductGroup } from '@/app/actions/products';
import styles from '../admin.module.css';

interface GroupedProduct {
    variantGroupId: number;
    name: string;
    baseImageUrl: string;
    categoryId: number | null;
    variantCount: number;
    minPrice: number | string; // Postgres returns as string
    maxPrice: number | string; // Postgres returns as string
    totalStock: number;
}

interface Variant {
    globalProductId: number;
    skuBarcode: string | null;
    packSizeLabel: string | null;
    costPrice: string | null;
    sellingPrice: string | null;
    stockQuantity: number | null;
    baseWeightGrams: number;
}

export default function AdminProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<GroupedProduct[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
    const [groupVariants, setGroupVariants] = useState<Map<number, Variant[]>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setIsLoading(true);
        const res = await getGroupedProducts();
        if (res.success && res.products) {
            setProducts(res.products as GroupedProduct[]);
        }
        setIsLoading(false);
    };

    const toggleExpand = async (groupId: number) => {
        const newExpanded = new Set(expandedGroups);

        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
        } else {
            newExpanded.add(groupId);

            // Fetch variants if not already loaded
            if (!groupVariants.has(groupId)) {
                const res = await getVariantsByGroupId(groupId);
                if (res.success && res.variants) {
                    setGroupVariants(new Map(groupVariants.set(groupId, res.variants as Variant[])));
                }
            }
        }

        setExpandedGroups(newExpanded);
    };

    const handleDelete = async (groupId: number) => {
        if (!confirm('Are you sure you want to delete this product and all its variants?')) {
            return;
        }

        setIsDeleting(groupId);
        const res = await deleteProductGroup(groupId);
        if (res.success) {
            setProducts(products.filter(p => p.variantGroupId !== groupId));
        } else {
            alert('Failed to delete product');
        }
        setIsDeleting(null);
    };

    const calculateMargin = (cost: string | null, selling: string | null): number => {
        const c = parseFloat(cost || '0');
        const s = parseFloat(selling || '0');
        if (s <= 0) return 0;
        return ((s - c) / s) * 100;
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={32} style={{ color: '#24A148' }} />
            </div>
        );
    }

    return (
        <div>
            <div className={styles.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className={styles.pageTitle}>B2B Products</h1>
                        <p style={{ color: '#6d7175', marginTop: '0.5rem', fontSize: '0.875rem' }}>Manage products with variant grouping</p>
                    </div>
                    <Link href="/admin/products/new">
                        <button className={styles.primaryBtn}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={16} />
                                Add Product
                            </div>
                        </button>
                    </Link>
                </div>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.card}>
                    {/* Filter Bar */}
                    <div className={styles.filterBar}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                            <input
                                type="text"
                                placeholder="Filter products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.inputField}
                                style={{ paddingLeft: '2rem', marginTop: 0 }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}></th>
                                    <th style={{ width: '35%' }}>Product</th>
                                    <th>Variants</th>
                                    <th>Price Range</th>
                                    <th>Total Stock</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#6d7175' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: 48, height: 48, background: '#f1f2f4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Package size={24} color="#999" />
                                                </div>
                                                <p>No products found matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const isExpanded = expandedGroups.has(product.variantGroupId);
                                        const variants = groupVariants.get(product.variantGroupId) || [];

                                        return (
                                            <React.Fragment key={product.variantGroupId}>
                                                {/* Parent Row */}
                                                <tr style={{ background: isExpanded ? '#f9fafb' : 'white' }}>
                                                    <td>
                                                        <button
                                                            onClick={() => toggleExpand(product.variantGroupId)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                                                        >
                                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            {product.baseImageUrl ? (
                                                                <img
                                                                    src={product.baseImageUrl}
                                                                    alt={product.name}
                                                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, background: '#f4f4f4', border: '1px solid #eee' }}
                                                                />
                                                            ) : (
                                                                <div style={{ width: 40, height: 40, background: '#eee', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                                                    <Package size={20} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div style={{ fontWeight: 500, color: '#303030' }}>{product.name}</div>
                                                                <div style={{ fontSize: '0.75rem', color: '#6d7175', marginTop: '0.125rem' }}>Group ID: {product.variantGroupId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={styles.badge} style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                                                            {product.variantCount} {product.variantCount === 1 ? 'variant' : 'variants'}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: 500 }}>
                                                        ৳{Number(product.minPrice || 0).toFixed(2)} - ৳{Number(product.maxPrice || 0).toFixed(2)}
                                                    </td>
                                                    <td style={{ fontWeight: 500 }}>{product.totalStock} units</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => handleDelete(product.variantGroupId)}
                                                                className={styles.secondaryBtn}
                                                                style={{ padding: '0.4rem', lineHeight: 0, borderColor: '#ffccc7', color: '#d00' }}
                                                                title="Delete"
                                                                disabled={isDeleting === product.variantGroupId}
                                                            >
                                                                {isDeleting === product.variantGroupId ? (
                                                                    <Loader2 size={16} className="animate-spin" />
                                                                ) : (
                                                                    <Trash2 size={16} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded Variants */}
                                                {isExpanded && variants.length > 0 && (
                                                    <tr>
                                                        <td colSpan={6} style={{ padding: 0, background: '#fafbfc' }}>
                                                            <table style={{ width: '100%', fontSize: '0.875rem', marginLeft: '3rem' }}>
                                                                <thead>
                                                                    <tr style={{ background: '#f1f2f4' }}>
                                                                        <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600, color: '#4A4A4A', fontSize: '0.75rem' }}>SKU</th>
                                                                        <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600, color: '#4A4A4A', fontSize: '0.75rem' }}>Pack Size</th>
                                                                        <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600, color: '#4A4A4A', fontSize: '0.75rem' }}>Cost</th>
                                                                        <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600, color: '#4A4A4A', fontSize: '0.75rem' }}>Selling</th>
                                                                        <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600, color: '#4A4A4A', fontSize: '0.75rem' }}>Margin</th>
                                                                        <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600, color: '#4A4A4A', fontSize: '0.75rem' }}>Stock</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {variants.map((variant) => {
                                                                        const margin = calculateMargin(variant.costPrice, variant.sellingPrice);
                                                                        const isLowMargin = margin < 5 && margin > 0;

                                                                        return (
                                                                            <tr key={variant.globalProductId} style={{ borderBottom: '1px solid #E0E3EB', background: isLowMargin ? '#fff5f5' : 'white' }}>
                                                                                <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>{variant.skuBarcode}</td>
                                                                                <td style={{ padding: '0.5rem' }}>{variant.packSizeLabel}</td>
                                                                                <td style={{ padding: '0.5rem' }}>৳{parseFloat(variant.costPrice || '0').toFixed(2)}</td>
                                                                                <td style={{ padding: '0.5rem', fontWeight: 600 }}>৳{parseFloat(variant.sellingPrice || '0').toFixed(2)}</td>
                                                                                <td style={{ padding: '0.5rem', fontWeight: 700, color: isLowMargin ? '#c00' : '#24A148' }}>
                                                                                    {margin.toFixed(2)}%
                                                                                </td>
                                                                                <td style={{ padding: '0.5rem' }}>{variant.stockQuantity}</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Placeholder */}
                    <div style={{ padding: '1rem', borderTop: '1px solid #e1e3e5', display: 'flex', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#6d7175' }}>Showing {filteredProducts.length} product groups</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
