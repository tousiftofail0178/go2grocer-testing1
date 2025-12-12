import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className,
    ...props
}) => {
    return (
        <div className={`${styles.inputWrapper} ${className || ''}`}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.inputContainer}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <input
                    className={`${styles.input} ${icon ? styles.hasIcon : ''} ${error ? styles.error : ''}`}
                    {...props}
                />
            </div>
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};
