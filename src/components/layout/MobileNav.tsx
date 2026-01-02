"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './MobileNav.module.css';

export const MobileNav: React.FC = () => {
    const pathname = usePathname();
    const { getTotalItems } = useCartStore();
    const { user } = useAuthStore();
    const cartCount = getTotalItems();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className={styles.nav}>
            <Link href="/" className={`${styles.item} ${isActive('/') ? styles.active : ''}`}>
                <Home size={24} />
                <span>Home</span>
            </Link>

            <Link href="/shop" className={`${styles.item} ${isActive('/shop') ? styles.active : ''}`}>
                <Grid size={24} />
                <span>Categories</span>
            </Link>

            <Link href="/cart" className={`${styles.item} ${isActive('/cart') ? styles.active : ''}`}>
                <div className={styles.cartWrapper}>
                    <ShoppingCart size={24} />
                    {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                </div>
                <span>Cart</span>
            </Link>

            <Link
                href={
                    user?.role === 'business_owner' ? '/business-owner' :
                        user?.role === 'business_manager' ? '/business-manager' :
                            '/profile'
                }
                className={`${styles.item} ${isActive(
                    user?.role === 'business_owner' ? '/business-owner' :
                        user?.role === 'business_manager' ? '/business-manager' :
                            '/profile'
                ) ? styles.active : ''}`}
            >
                <User size={24} />
                <span>Account</span>
            </Link>
        </nav>
    );
};
