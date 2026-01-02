"use client";

import React, { useState } from 'react';
import { Shield, Truck, CheckCircle, Copy, AlertTriangle, Lock, Box } from 'lucide-react';
import styles from './procurement.module.css';

// --- Types ---
export interface ProcurementProduct {
    id: string;
    name: string;
    origin: "Local" | "Imported";
    storageType: string;
    grade: string;
    variants: {
        sku: string;
        packSize: string;
        warehouseStock: number;
        price: number;
        effectiveMargin: number;
    }[];
    policyStatus: "APPROVE" | "REVIEW" | "BLOCK";
}

interface ProcurementPDPProps {
    product: ProcurementProduct;
}

export default function ProcurementPDP({ product }: ProcurementPDPProps) {
    // State
    const [selectedSku, setSelectedSku] = useState<string>(product.variants[0].sku);
    const [quantity, setQuantity] = useState<number>(1);

    // Derived State
    const currentVariant = product.variants.find(v => v.sku === selectedSku) || product.variants[0];

    // 🔥 CRITICAL LOGIC: Profit Protection Rule
    const isProfitProtected = currentVariant.effectiveMargin < 5;

    // Determine Effective Policy State
    let effectivePolicyStatus = product.policyStatus;
    if (isProfitProtected) {
        effectivePolicyStatus = "BLOCK";
    }

    // Handlers
    const handleCopySku = () => {
        navigator.clipboard.writeText(currentVariant.sku);
    };

    return (
        <div className={styles.procurement}>
            {/* Top Bar (Breadcrumb style) */}
            <div className={styles.breadcrumb}>
                PROCUREMENT_TERMINAL / {product.id} / {currentVariant.sku}
            </div>

            <main className={styles.container}>

                {/* --- BLOCK C: Left Column (Visuals & Trust) --- */}
                <div className={styles.visualColumn}>
                    <div className={styles.productImage}>
                        <Box size={64} />
                    </div>

                    {/* Operational Trust Signals */}
                    <div className={styles.trustBadges}>
                        <TrustBadge icon={CheckCircle} label="Verified by Hub Manager" />
                        <TrustBadge icon={Shield} label="SLA Claims Protected" />
                        <TrustBadge icon={Truck} label="Zone-release Optimized" />
                    </div>
                </div>

                {/* --- BLOCK B: Center Column (Data Grid) --- */}
                <div className={styles.dataColumn}>
                    <h1 className={styles.productTitle}>{product.name}</h1>
                    <div className={styles.skuBadge}>
                        SKU: {currentVariant.sku}
                        <button onClick={handleCopySku} className={styles.copyButton}>
                            <Copy size={12} />
                        </button>
                    </div>

                    {/* Operational Data Grid */}
                    <div className={styles.dataGrid}>
                        <DataRow label="Origin" value={product.origin} />
                        <DataRow label="Specification" value={product.grade} />
                        <DataRow label="Storage Conditions" value={product.storageType} />
                        <DataRow label="Current Pack Size" value={currentVariant.packSize} highlight />
                        <DataRow label="Unit Price" value={`৳${currentVariant.price}`} />
                        <DataRow
                            label="Margin Integrity"
                            value={isProfitProtected ? "BELOW THRESHOLD" : "Pass"}
                            error={isProfitProtected}
                            success={!isProfitProtected}
                        />
                    </div>
                </div>

                {/* --- BLOCK A: Right Column (Control Panel) --- */}
                <div className={styles.controlColumn}>
                    <div className={styles.controlPanel}>

                        {/* Status Header */}
                        <div className={styles.controlHeader}>
                            <span className={styles.controlTitle}>Procurement Control</span>
                            <span className={styles.stockBadge}>
                                WAREHOUSE: {currentVariant.warehouseStock} UNITS
                            </span>
                        </div>

                        {/* Pack Size Selector */}
                        <div className={styles.section}>
                            <label className={styles.sectionLabel}>Pack Size Selection</label>
                            <div className={styles.variantOptions}>
                                {product.variants.map((variant) => (
                                    <label
                                        key={variant.sku}
                                        className={`${styles.variantOption} ${selectedSku === variant.sku ? styles.selected : ''}`}
                                    >
                                        <div>
                                            <input
                                                type="radio"
                                                name="packSize"
                                                value={variant.sku}
                                                checked={selectedSku === variant.sku}
                                                onChange={() => {
                                                    setSelectedSku(variant.sku);
                                                    setQuantity(1);
                                                }}
                                            />
                                            <span className={styles.variantLabel}>{variant.packSize}</span>
                                        </div>
                                        <span className={styles.variantPrice}>৳{variant.price}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className={styles.section}>
                            <label className={styles.sectionLabel}>Quantity</label>
                            <div className={styles.quantityControl}>
                                <button
                                    className={styles.quantityButton}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={effectivePolicyStatus === 'BLOCK'}
                                >-</button>
                                <div className={styles.quantityValue}>
                                    {quantity}
                                </div>
                                <button
                                    className={styles.quantityButton}
                                    onClick={() => setQuantity(quantity + 1)}
                                    disabled={effectivePolicyStatus === 'BLOCK'}
                                >+</button>
                            </div>
                        </div>

                        {/* Primary Action Button (State Driven) */}
                        <div>
                            {renderActionButton(effectivePolicyStatus)}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

// --- Helper Components ---

function TrustBadge({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <div className={styles.trustBadge}>
            <Icon size={16} />
            <span>{label}</span>
        </div>
    );
}

function DataRow({ label, value, highlight, error, success }: {
    label: string,
    value: string | number,
    highlight?: boolean,
    error?: boolean,
    success?: boolean
}) {
    const valueClasses = [
        styles.dataValue,
        highlight && styles.highlight,
        error && styles.error,
        success && styles.success
    ].filter(Boolean).join(' ');

    return (
        <div className={styles.dataRow}>
            <div className={styles.dataLabel}>
                {label}
            </div>
            <div className={valueClasses}>
                {value}
            </div>
        </div>
    );
}

function renderActionButton(status: string) {
    if (status === 'BLOCK') {
        return (
            <>
                <button disabled className={`${styles.actionButton} ${styles.blocked}`}>
                    <Lock size={16} /> PROCUREMENT LOCKED
                </button>
                <div className={styles.alertBox}>
                    <AlertTriangle size={14} />
                    <span className={styles.alertText}>
                        Policy Restriction: Margin protection active. Contact Operations Manager for override.
                    </span>
                </div>
            </>
        );
    }

    if (status === 'REVIEW') {
        return (
            <>
                <button className={`${styles.actionButton} ${styles.review}`}>
                    Request Approval
                </button>
                <p className={styles.reviewNote}>Order exceeds auto-approval limits.</p>
            </>
        );
    }

    // Default: APPROVE
    return (
        <button className={`${styles.actionButton} ${styles.approve}`}>
            ADD TO ORDER
        </button>
    );
}
