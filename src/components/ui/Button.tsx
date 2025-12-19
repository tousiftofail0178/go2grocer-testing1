import React from 'react';
import styles from './Button.module.css';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    fullWidth?: boolean;
    size?: 'default' | 'small';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    size = 'default',
    isLoading = false,
    icon,
    className,
    disabled,
    ...props
}) => {
    const classes = [
        styles.button,
        styles[variant],
        fullWidth ? styles.fullWidth : '',
        size === 'small' ? styles.small : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {!isLoading && icon && <span className={styles.icon}>{icon}</span>}
            {children}
        </button>
    );
};
