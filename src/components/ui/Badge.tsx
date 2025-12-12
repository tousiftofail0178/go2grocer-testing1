import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    className
}) => {
    return (
        <span className={`${styles.badge} ${styles[variant]} ${className || ''}`}>
            {children}
        </span>
    );
};
