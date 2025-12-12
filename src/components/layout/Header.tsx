"use client";

import React from 'react';
import Link from 'next/link';
import { Search, MapPin, ShoppingCart, Menu, User, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import styles from './Header.module.css';

import { AddressModal } from '@/components/ui/AddressModal';
import { BusinessSelectionModal } from '@/components/ui/BusinessSelectionModal';
import { LocationSelectionModal } from '@/components/ui/LocationSelectionModal';
import { categories } from '@/lib/data';

export default function Header() {
    const { user, isAuthenticated, logout, selectedAddress, selectedBusiness } = useAuthStore();
    const { getTotalItems } = useCartStore();
    const cartCount = getTotalItems();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
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
                            Free delivery on orders above ৳500 | Delivery in 30-60 minutes in Chittagong
                        </span>
                    </div>
                </div>

                <div className={styles.mainHeader}>
                    <div className={styles.container}>
                        <div className={styles.wrapper}>
                            {/* Logo & Mobile Menu */}
                            <div className={styles.left}>
                                <button className={styles.mobileMenu} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                    <Menu size={24} />
                                </button>
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
                                <div
                                    className={styles.location}
                                    onClick={handlePickerClick}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <MapPin size={20} className={styles.locationIcon} />
                                    <div className={styles.locationText}>
                                        <span className={styles.locationLabel}>{pickerLabel}</span>
                                        <span className={styles.locationValue}>
                                            {pickerValue}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.divider} />

                                {/* Account */}
                                {isAuthenticated ? (
                                    <div className={styles.accountWrapper}>
                                        <Link href="/profile" className={styles.accountLink}>
                                            <User size={20} />
                                            <span className={styles.accountText}>{user?.name || 'Profile'}</span>
                                        </Link>
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
                                    <Link href="/become-customer" className={styles.signupLink}>
                                        <div className={styles.signupIconWrapper}>
                                            <UserPlus size={24} color="#24a148" />
                                        </div>
                                        <div className={styles.signupTextContainer}>
                                            <span className={styles.signupTopText}>Become a customer</span>
                                            <span className={styles.signupBottomText}>Register today!</span>
                                        </div>
                                    </Link>
                                )}

                                {/* Cart */}
                                <Link href="/cart">
                                    <Button variant="primary" className={styles.cartButton}>
                                        <ShoppingCart size={20} />
                                        {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Category Navigation Bar */}
            <div className={styles.categoryBar}>
                <div className={styles.container}>
                    <ul className={styles.categoryList}>
                        <li className={`${styles.categoryItem} ${styles.active}`}>
                            <Link href="/shop" style={{ textDecoration: 'none', color: 'inherit' }}>
                                All
                            </Link>
                        </li>
                        {categories.map((category) => (
                            <li key={category.id} className={styles.categoryItem}>
                                <Link href={`/shop?category=${category.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
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
