"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { createB2BProduct } from '@/app/actions/createB2BProduct';
import styles from '../../admin.module.css';

interface Variant {
    id: string;
    skuBarcode: string;
    packSizeLabel: string;
    baseUnit: string;
    baseWeightGrams: number;
    costPrice: number;
    sellingPrice: number;
    stockQuantity: number;
}

export default function NewB2BProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Parent product data
    const [parentData, setParentData] = useState({
        name: '',
        categoryId: 0,
        baseImageUrl: '',
        descriptionHtml: ''
    });

    // Variants array
    const [variants, setVariants] = useState<Variant[]>([
        {
            id: crypto.randomUUID(),
            skuBarcode: '',
            packSizeLabel: '',
            baseUnit: 'kg',
            baseWeightGrams: 0,
            costPrice: 0,
            sellingPrice: 0,
            stockQuantity: 0
        }
    ]);

    const handleParentChange = (field: string, value: any) => {
        setParentData(prev => ({ ...prev, [field]: value }));
    };

    const handleVariantChange = (id: string, field: keyof Variant, value: any) => {
        setVariants(prev => prev.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
    };

    const addVariant = () => {
        setVariants(prev => [...prev, {
            id: crypto.randomUUID(),
            skuBarcode: '',
            packSizeLabel: '',
            baseUnit: 'kg',
            baseWeightGrams: 0,
            costPrice: 0,
            sellingPrice: 0,
            stockQuantity: 0
        }]);
    };

    const removeVariant = (id: string) => {
        if (variants.length === 1) {
            alert('At least one variant is required');
            return;
        }
        setVariants(prev => prev.filter(v => v.id !== id));
    };

    const calculateMargin = (cost: number, selling: number): number => {
        if (selling <= 0) return 0;
        return ((selling - cost) / selling) * 100;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await createB2BProduct({
                parent: {
                    name: parentData.name,
                    categoryId: parentData.categoryId || undefined,
                    baseImageUrl: parentData.baseImageUrl,
                    descriptionHtml: parentData.descriptionHtml || undefined
                },
                variants: variants.map(v => ({
                    skuBarcode: v.skuBarcode,
                    packSizeLabel: v.packSizeLabel,
                    baseUnit: v.baseUnit,
                    baseWeightGrams: Number(v.baseWeightGrams),
                    costPrice: Number(v.costPrice),
                    sellingPrice: Number(v.sellingPrice),
                    stockQuantity: Number(v.stockQuantity)
                }))
            });

            if (result.success) {
                router.push('/admin/products');
            } else {
                setError(result.error || 'Failed to create product');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <Link href="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#4A4A4A', textDecoration: 'none', marginBottom: '1rem' }}>
                    <ArrowLeft size={16} />
                    Back to Products
                </Link>
                <h1 className={styles.pageTitle}>Create B2B Product</h1>
                <p style={{ color: '#6d7175', marginTop: '0.5rem' }}>Create a product with multiple pack size variants</p>
            </div>

            <div className={styles.contentContainer}>
                <form onSubmit={handleSubmit}>
                    {/* Parent Product Section */}
                    <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
                        <div style={{ borderBottom: '1px solid #E0E3EB', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111' }}>Parent Product Information</h2>
                            <p style={{ fontSize: '0.875rem', color: '#6d7175', marginTop: '0.25rem' }}>Shared across all variants</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                            <div>
                                <label className={styles.label}>Product Name *</label>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    placeholder="e.g. Fresh Potato - Gol Alu"
                                    value={parentData.name}
                                    onChange={(e) => handleParentChange('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className={styles.label}>Category ID</label>
                                    <input
                                        type="number"
                                        className={styles.inputField}
                                        placeholder="Optional"
                                        value={parentData.categoryId || ''}
                                        onChange={(e) => handleParentChange('categoryId', parseInt(e.target.value) || 0)}
                                    />
                                </div>

                                <div>
                                    <label className={styles.label}>Base Image URL *</label>
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="/images/potato.jpg"
                                        value={parentData.baseImageUrl}
                                        onChange={(e) => handleParentChange('baseImageUrl', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={styles.label}>Description (HTML)</label>
                                <textarea
                                    className={styles.inputField}
                                    rows={3}
                                    placeholder="Optional product description"
                                    value={parentData.descriptionHtml}
                                    onChange={(e) => handleParentChange('descriptionHtml', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Variants Section */}
                    <div className={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E3EB', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111' }}>Product Variants</h2>
                                <p style={{ fontSize: '0.875rem', color: '#6d7175', marginTop: '0.25rem' }}>Add different pack sizes and pricing</p>
                            </div>
                            <button
                                type="button"
                                onClick={addVariant}
                                className={styles.primaryBtn}
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                                Add Variant
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {variants.map((variant, index) => {
                                const margin = calculateMargin(variant.costPrice, variant.sellingPrice);
                                const isLowMargin = margin < 5 && margin > 0;

                                return (
                                    <div key={variant.id} style={{ border: '1px solid #E0E3EB', borderRadius: '4px', padding: '1rem', background: isLowMargin ? '#fff5f5' : 'white' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4A4A4A' }}>Variant {index + 1}</h3>
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(variant.id)}
                                                style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', padding: '0.25rem' }}
                                                disabled={variants.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                            <div>
                                                <label className={styles.label} style={{ fontSize: '0.75rem' }}>SKU Barcode *</label>
                                                <input
                                                    type="text"
                                                    className={styles.inputField}
                                                    placeholder="POT-50KG"
                                                    value={variant.skuBarcode}
                                                    onChange={(e) => handleVariantChange(variant.id, 'skuBarcode', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className={styles.label} style={{ fontSize: '0.75rem' }}>Pack Size Label *</label>
                                                <input
                                                    type="text"
                                                    className={styles.inputField}
                                                    placeholder="50kg Sack"
                                                    value={variant.packSizeLabel}
                                                    onChange={(e) => handleVariantChange(variant.id, 'packSizeLabel', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className={styles.label} style={{ fontSize: '0.75rem' }}>Base Unit *</label>
                                                <select
                                                    className={styles.inputField}
                                                    value={variant.baseUnit}
                                                    onChange={(e) => handleVariantChange(variant.id, 'baseUnit', e.target.value)}
                                                    required
                                                >
                                                    <option value="kg">kg</option>
                                                    <option value="g">g</option>
                                                    <option value="pc">pc</option>
                                                    <option value="bottle">bottle</option>
                                                    <option value="liter">liter</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className={styles.label} style={{ fontSize: '0.75rem' }}>Weight (grams) *</label>
                                                <input
                                                    type="number"
                                                    className={styles.inputField}
                                                    placeholder="50000"
                                                    value={variant.baseWeightGrams || ''}
                                                    onChange={(e) => handleVariantChange(variant.id, 'baseWeightGrams', parseInt(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className={styles.label} style={{ fontSize: '0.75rem' }}>Cost Price (৳) *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className={styles.inputField}
                                                    placeholder="1100.00"
                                                    value={variant.costPrice || ''}
                                                    onChange={(e) => handleVariantChange(variant.id, 'costPrice', parseFloat(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className={styles.label} style={{ fontSize: '0.75rem' }}>Selling Price (৳) *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className={styles.inputField}
                                                    placeholder="1250.00"
                                                    value={variant.sellingPrice || ''}
                                                    onChange={(e) => handleVariantChange(variant.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className={styles.label} style={{ fontSize: '0.75rem' }}>Stock Quantity *</label>
                                                <input
                                                    type="number"
                                                    className={styles.inputField}
                                                    placeholder="450"
                                                    value={variant.stockQuantity || ''}
                                                    onChange={(e) => handleVariantChange(variant.id, 'stockQuantity', parseInt(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className={styles.label} style={{ fontSize: '0.75rem' }}>Margin</label>
                                                <div style={{
                                                    padding: '0.5rem',
                                                    background: isLowMargin ? '#ffebeb' : '#f1f2f4',
                                                    borderRadius: '4px',
                                                    fontWeight: 700,
                                                    color: isLowMargin ? '#c00' : '#24A148',
                                                    fontSize: '0.875rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginTop: '0.25rem'
                                                }}>
                                                    {isLowMargin && <AlertTriangle size={14} />}
                                                    {margin.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>

                                        {isLowMargin && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#ffebeb', borderRadius: '4px', fontSize: '0.75rem', color: '#c00', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <AlertTriangle size={12} />
                                                Warning: Margin below 5% - this will trigger procurement restrictions
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffebeb', border: '1px solid #ffcaca', borderRadius: '4px', color: '#c00' }}>
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Link href="/admin/products">
                            <button type="button" className={styles.secondaryBtn}>Cancel</button>
                        </Link>
                        <button
                            type="submit"
                            className={styles.primaryBtn}
                            disabled={isLoading}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Create Product
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
