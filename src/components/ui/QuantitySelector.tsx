"use client";

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import styles from './QuantitySelector.module.css';

interface QuantitySelectorProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    min?: number;
    max?: number;
    size?: 'small' | 'default';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
    quantity,
    onIncrease,
    onDecrease,
    min = 0,
    max = 99,
    size = 'default'
}) => {
    return (
        <div className={`${styles.container} ${size === 'small' ? styles.small : ''}`}>
            <button
                className={styles.button}
                onClick={(e) => { e.preventDefault(); onDecrease(); }}
                disabled={quantity <= min}
                aria-label="Decrease quantity"
            >
                <Minus size={size === 'small' ? 14 : 16} />
            </button>
            <span className={styles.value}>{quantity}</span>
            <button
                className={styles.button}
                onClick={(e) => { e.preventDefault(); onIncrease(); }}
                disabled={quantity >= max}
                aria-label="Increase quantity"
            >
                <Plus size={size === 'small' ? 14 : 16} />
            </button>
        </div>
    );
};
