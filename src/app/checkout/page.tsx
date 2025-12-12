"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, CreditCard, Banknote, Loader2, User, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { AddressModal } from '@/components/ui/AddressModal';
import styles from './page.module.css';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { user, isAuthenticated, selectedAddress, addresses } = useAuthStore();
    const { addOrder } = useOrderStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isGuestMode, setIsGuestMode] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        area: '',
        deliveryTime: 'express',
        paymentMethod: 'cod'
    });

    // Sync form data with user/address state
    useEffect(() => {
        if (isAuthenticated) {
            setFormData(prev => ({
                ...prev,
                name: user?.name || '',
                phone: user?.phone || '',
                // If we have a selected address, use its details
                // Note: basic address structure might need parsing if we split area/address
                // For now, we'll map fullAddress to address and clear area or assume it's part of it
                address: selectedAddress?.fullAddress || '',
                area: '' // specific area field might be redundant if fullAddress covers it
            }));
        }
    }, [isAuthenticated, user, selectedAddress]);

    const subtotal = getTotalPrice();
    const FREE_DELIVERY_THRESHOLD = 3000;
    const DELIVERY_FEE = 60;
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!isAuthenticated && !isGuestMode) {
            // Should not happen due to UI flow, but guard anyway
            return;
        }

        const addressToUse = isAuthenticated ? selectedAddress?.fullAddress : formData.address;

        if (!addressToUse || !formData.phone || (!isAuthenticated && !formData.name)) {
            setError('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const orderId = Math.floor(100000 + Math.random() * 900000).toString();
            const newOrder = {
                id: orderId,
                date: new Date().toISOString().split('T')[0],
                items: [...items],
                total: total,
                deliveryFee: deliveryFee,
                status: 'Processing' as const,
                shippingAddress: {
                    address: addressToUse || '',
                    area: formData.area || '',
                    city: 'Chittagong',
                    phone: formData.phone,
                    name: formData.name
                },
                paymentMethod: formData.paymentMethod
            };

            addOrder(newOrder);
            clearCart();
            router.push(`/order-confirmation?orderId=${orderId}`);
        } catch (err) {
            console.error('Order failed:', err);
            setError('Failed to place order. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className={styles.container} style={{ textAlign: 'center', padding: '4rem' }}>
                <h1 className={styles.title}>Your cart is empty</h1>
                <Button onClick={() => router.push('/shop')}>Start Shopping</Button>
            </div>
        );
    }

    // AUTH CHOICE SCREEN
    if (!isAuthenticated && !isGuestMode) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>How would you like to checkout?</h1>
                <div className={styles.authOptions}>
                    <div className={styles.authCard} onClick={() => router.push('/login?redirect=/checkout')}>
                        <LogIn size={48} className={styles.iconWrapper} />
                        <h3>Log In</h3>
                        <p>Already have an account? Log in to access your saved addresses and loyalty points.</p>
                        <Button fullWidth>Log In</Button>
                    </div>

                    <div className={styles.authCard} onClick={() => router.push('/signup?redirect=/checkout')}>
                        <UserPlus size={48} className={styles.iconWrapper} />
                        <h3>Sign Up</h3>
                        <p>Create an account to track orders, save addresses, and earn rewards.</p>
                        <Button fullWidth variant="secondary">Sign Up</Button>
                    </div>

                    <div className={styles.authCard} onClick={() => setIsGuestMode(true)}>
                        <User size={48} className={styles.iconWrapper} />
                        <h3>Guest Checkout</h3>
                        <p>Checkout quickly without creating an account. You can create one later.</p>
                        <Button fullWidth variant="ghost">Continue as Guest</Button>
                    </div>
                </div>
            </div>
        );
    }

    // MAIN CHECKOUT FORM
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Checkout</h1>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <div className={styles.layout}>
                {/* Left: Forms */}
                <div className={styles.forms}>
                    {/* Delivery Address */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconWrapper}><MapPin size={20} /></div>
                            <h2 className={styles.sectionTitle}>Delivery Information</h2>
                        </div>

                        {/* If Authenticated, show nice address selector */}
                        {isAuthenticated ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className={styles.formGrid}>
                                    <Input
                                        label="Full Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                    <Input
                                        label="Phone Number"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className={styles.selectedAddress}>
                                    <div className={styles.addressDetails}>
                                        <span className={styles.addressLabel}>
                                            <MapPin size={16} /> {selectedAddress?.label || 'Delivery Address'}
                                        </span>
                                        <span className={styles.addressText}>{selectedAddress?.fullAddress || 'No address selected'}</span>
                                    </div>
                                    <button
                                        className={styles.changeBtn}
                                        onClick={() => setIsAddressModalOpen(true)}
                                    >
                                        Change / Add
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Guest Form */
                            <div className={styles.formGrid}>
                                <Input
                                    label="Full Name"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                                <Input
                                    label="Phone Number"
                                    name="phone"
                                    placeholder="01XXXXXXXXX"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                                <Input
                                    label="Address"
                                    name="address"
                                    placeholder="House, Road, Area"
                                    className={styles.fullWidth}
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                                <Input
                                    label="Area/Thana"
                                    name="area"
                                    placeholder="e.g. Nasirabad"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                />
                                <Input label="City" defaultValue="Chittagong" disabled />
                            </div>
                        )}
                    </section>

                    {/* Delivery Time and Payment sections remain largely the same */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconWrapper}><Clock size={20} /></div>
                            <h2 className={styles.sectionTitle}>Preferred Delivery Time</h2>
                        </div>
                        <div className={styles.timeSlots}>
                            <button
                                className={`${styles.timeSlot} ${formData.deliveryTime === 'express' ? styles.activeSlot : ''}`}
                                onClick={() => setFormData({ ...formData, deliveryTime: 'express' })}
                            >
                                <span className={styles.slotLabel}>Express</span>
                                <span className={styles.slotTime}>30-60 mins</span>
                            </button>
                            <button
                                className={`${styles.timeSlot} ${formData.deliveryTime === 'slot1' ? styles.activeSlot : ''}`}
                                onClick={() => setFormData({ ...formData, deliveryTime: 'slot1' })}
                            >
                                <span className={styles.slotLabel}>Today</span>
                                <span className={styles.slotTime}>2:00 PM - 4:00 PM</span>
                            </button>
                            <button
                                className={`${styles.timeSlot} ${formData.deliveryTime === 'slot2' ? styles.activeSlot : ''}`}
                                onClick={() => setFormData({ ...formData, deliveryTime: 'slot2' })}
                            >
                                <span className={styles.slotLabel}>Today</span>
                                <span className={styles.slotTime}>5:00 PM - 7:00 PM</span>
                            </button>
                        </div>
                    </section>

                    {/* Payment Method */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconWrapper}><CreditCard size={20} /></div>
                            <h2 className={styles.sectionTitle}>Payment Method</h2>
                        </div>
                        <div className={styles.paymentMethods}>
                            <label className={styles.paymentOption}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={formData.paymentMethod === 'cod'}
                                    onChange={handleInputChange}
                                />
                                <div className={styles.paymentCard}>
                                    <Banknote size={24} />
                                    <span>Cash on Delivery</span>
                                </div>
                            </label>
                            <label className={styles.paymentOption}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="bkash"
                                    checked={formData.paymentMethod === 'bkash'}
                                    onChange={handleInputChange}
                                />
                                <div className={styles.paymentCard}>
                                    <span>bKash</span>
                                </div>
                            </label>
                            <label className={styles.paymentOption}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="card"
                                    checked={formData.paymentMethod === 'card'}
                                    onChange={handleInputChange}
                                />
                                <div className={styles.paymentCard}>
                                    <span>Credit/Debit Card</span>
                                </div>
                            </label>
                        </div>
                    </section>
                </div>

                {/* Right: Order Summary */}
                <div className={styles.summary}>
                    <h2 className={styles.summaryTitle}>Order Summary</h2>
                    <div className={styles.summaryItems}>
                        {items.map((item) => (
                            <div key={item.id} className={styles.summaryItem}>
                                <span>{item.quantity} x {item.name}</span>
                                <span>৳{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>৳{subtotal}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Delivery Fee</span>
                        <span>৳{deliveryFee}</span>
                    </div>
                    <div className={styles.divider} />
                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                        <span>Total</span>
                        <span>৳{total}</span>
                    </div>

                    <Button
                        fullWidth
                        size="default"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Place Order'}
                    </Button>
                </div>
            </div>

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
            />
        </div>
    );
}
