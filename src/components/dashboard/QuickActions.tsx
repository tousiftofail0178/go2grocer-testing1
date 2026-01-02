"use client";

import React from 'react';
import { Package, UserPlus, ShoppingCart, FileText, Users, UserCheck } from 'lucide-react';
import Link from 'next/link';
import styles from './QuickActions.module.css';

interface QuickAction {
    label: string;
    icon: React.ReactNode;
    href: string;
    colorClass: string;
}

export default function QuickActions() {
    const actions: QuickAction[] = [
        {
            label: 'Add Product',
            icon: <Package size={18} />,
            href: '/admin/products/new',
            colorClass: styles.actionBlue
        },
        {
            label: 'New Order',
            icon: <ShoppingCart size={18} />,
            href: '/admin/orders/new',
            colorClass: styles.actionGreen
        },
        {
            label: 'Add Customer',
            icon: <UserPlus size={18} />,
            href: '/admin/customers/new',
            colorClass: styles.actionPurple
        },
        {
            label: 'Manage Users',
            icon: <Users size={18} />,
            href: '/admin/users',
            colorClass: styles.actionTeal
        },
        {
            label: 'Manager Requests',
            icon: <UserCheck size={18} />,
            href: '/admin/manager-requests',
            colorClass: styles.actionIndigo
        },
        {
            label: 'Pending Registrations',
            icon: <FileText size={18} />,
            href: '/admin/registrations',
            colorClass: styles.actionOrange
        }
    ];

    return (
        <div className={styles.actionsContainer}>
            {actions.map((action, index) => (
                <Link
                    key={index}
                    href={action.href}
                    className={`${styles.actionButton} ${action.colorClass}`}
                >
                    {action.icon}
                    <span>{action.label}</span>
                </Link>
            ))}
        </div>
    );
}
