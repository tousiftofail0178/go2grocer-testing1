"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, ShoppingCart, User, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import styles from './Header.module.css';

import { AddressModal } from '@/components/ui/AddressModal';
import { BusinessSelectionModal } from '@/components/ui/BusinessSelectionModal';
import { LocationSelectionModal } from '@/components/ui/LocationSelectionModal';

export default function Header() {
    const { user, isAuthenticated, logout, selectedAddress, selectedBusiness } = useAuthStore();
    const { getTotalItems } = useCartStore();
    const cartCount = getTotalItems();

    // Fix hydration error: only show cart count on client
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
    const [isBusinessModalOpen, setIsBusinessModalOpen] = React.useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = React.useState(false);
    const [guestLocation, setGuestLocation] = React.useState<string>('');

    // Determine what to show in the location/business picker
    const businessRoles = ['b2b', 'owner', 'manager', 'admin'];
    const isBusinessUser = user?.role && businessRoles.includes(user.role);
    const pickerLabel = 'Delivering to';

    // Display value logic
    let pickerValue = 'Select Location';
    if (isBusinessUser) {
        pickerValue = selectedBusiness ? selectedBusiness.name : (user?.name ? `${user.name}'s Business` : 'Select Business');
    } else if (isAuthenticated) {
        pickerValue = selectedAddress
            ? selectedAddress.fullAddress.substring(0, 20) + (selectedAddress.fullAddress.length > 20 ? '...' : '')
            : 'Select Location';
    } else {
        // For guests, show selected location or default
        pickerValue = guestLocation || 'Select Location';
    }

    const handlePickerClick = () => {
        if (isBusinessUser) {
            setIsBusinessModalOpen(true);
        } else if (isAuthenticated) {
            setIsAddressModalOpen(true);
        } else {
            setIsLocationModalOpen(true);
        }
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.topBar}>
                    <div className={styles.container}>
                        <span className={styles.offerText}>
                            Your business, our headache. You order we deliver 🚚
                        </span>
                    </div>
                </div>

                <div className={styles.mainHeader}>
                    <div className={styles.container}>
                        <div className={styles.wrapper}>
                            {/* Logo & Mobile Menu */}
                            <div className={styles.left}>
                                <Link href="/" className={styles.logo}>
                                    Go<span className={styles.logoAccent}>2</span>Grocer
                                </Link>
                            </div>

                            {/* Search Bar */}
                            <div className={styles.searchWrapper}>
                                <div className={styles.searchContainer}>
                                    <Search className={styles.searchIcon} size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search for rice, oil, fruits, veggies..."
                                        className={styles.searchInput}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const query = e.currentTarget.value.trim();
                                                if (query) {
                                                    window.location.href = `/shop?search=${encodeURIComponent(query)}`;
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={styles.actions}>
                                {/* Account */}
                                {isAuthenticated ? (
                                    <div className={styles.accountWrapper}>
                                        <Link
                                            href={
                                                user?.role === 'business_owner' ? '/business-owner' :
                                                    user?.role === 'business_manager' ? '/business-manager' :
                                                        '/profile'
                                            }
                                            className={styles.accountLink}
                                        >
                                            <User size={20} />
                                            <span className={styles.accountText}>{user?.name || 'Profile'}</span>
                                        </Link>

                                        {/* Admin Dashboard Link - Only for admin role */}
                                        {user?.role === 'admin' && (
                                            <>
                                                <div className={styles.divider} />
                                                <Link href="/admin" className={styles.accountLink} title="Admin Dashboard">
                                                    <span style={{ fontWeight: 600, color: 'var(--primary-green)' }}>Dashboard</span>
                                                </Link>
                                            </>
                                        )}

                                        <div className={styles.divider} />
                                        <button
                                            onClick={() => {
                                                logout();
                                                window.location.href = '/';
                                            }}
                                            className={styles.logoutBtn}
                                            title="Logout"
                                        >
                                            <LogOut size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.authWrapper}>
                                        <Link href="/login" style={{ textDecoration: 'none' }}>
                                            <button className={styles.loginBtn}>
                                                Login
                                            </button>
                                        </Link>

                                        <div className={styles.divider} />

                                        <Link href="/become-customer" className={styles.customerLink}>
                                            <UserPlus size={28} className={styles.customerIcon} />
                                            <div className={styles.customerTexts}>
                                                <span className={styles.cLabel}>Become a customer</span>
                                                <span className={styles.cAction}>Register today!</span>
                                            </div>
                                        </Link>
                                    </div>
                                )}

                                {/* Cart */}
                                <Link href="/cart">
                                    <div className={styles.cartButton} role="button" aria-label="Cart">
                                        <ShoppingCart size={22} />
                                        {mounted && cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* CATEGORY NAVIGATION BAR */}
            <div className={styles.categoryBar}>
                <div className={styles.container}>
                    <div className={`${styles.categoryList} ${styles.scrollbarHide}`}>
                        <Link href="/shop?category=1" className={styles.categoryItem}>
                            Rice & Flour
                        </Link>
                        <Link href="/shop?category=2" className={styles.categoryItem}>
                            Oils & Ghee
                        </Link>
                        <Link href="/shop?category=3" className={styles.categoryItem}>
                            Lentils, Sugar & Salt
                        </Link>
                        <Link href="/shop?category=4" className={styles.categoryItem}>
                            Spices & Masala
                        </Link>
                        <Link href="/shop?category=5" className={styles.categoryItem}>
                            Raw Staples (Veg)
                        </Link>
                        <Link href="/shop?category=6" className={styles.categoryItem}>
                            Sauces & Baking
                        </Link>
                        <Link href="/shop?category=7" className={styles.categoryItem}>
                            Noodles & Snacks
                        </Link>
                        <Link href="/shop?category=8" className={styles.categoryItem}>
                            Frozen & Dairy
                        </Link>
                        <Link href="/shop?category=9" className={styles.categoryItem}>
                            Cleaning
                        </Link>

                        <div className={styles.navDivider}></div>

                        <Link href="/shop" className={styles.wholesaleLink}>
                            View All
                        </Link>
                    </div>
                </div>
            </div>

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
            />

            <BusinessSelectionModal
                isOpen={isBusinessModalOpen}
                onClose={() => setIsBusinessModalOpen(false)}
            />

            <LocationSelectionModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onSelect={(area) => setGuestLocation(area)}
            />
        </>
    );
}
