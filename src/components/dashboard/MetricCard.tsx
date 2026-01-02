"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './MetricCard.module.css';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    iconColor?: string;
    iconBgColor?: string;
    onClick?: () => void;
}

export default function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    subtitle,
    iconColor = '#3b82f6',
    iconBgColor = '#eff6ff',
    onClick
}: MetricCardProps) {
    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.cardContent}>
                <div className={styles.cardInfo}>
                    <p className={styles.cardTitle}>{title}</p>
                    <h3 className={styles.cardValue}>{value}</h3>

                    {trend && (
                        <div className={styles.cardTrend}>
                            <span className={`${styles.trendValue} ${trend.isPositive ? styles.trendPositive : styles.trendNegative}`}>
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                            <span className={styles.trendSubtitle}>{subtitle || 'vs last month'}</span>
                        </div>
                    )}

                    {!trend && subtitle && (
                        <p className={styles.cardSubtitle}>{subtitle}</p>
                    )}
                </div>

                <div
                    className={styles.iconContainer}
                    style={{ backgroundColor: iconBgColor }}
                >
                    <Icon size={24} color={iconColor} strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}
