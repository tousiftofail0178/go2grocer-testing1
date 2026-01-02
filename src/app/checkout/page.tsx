"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, CreditCard, Banknote, Loader2, LogIn, UserPlus } from 'lucide-react';
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
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [businessProfile, setBusinessProfile] = useState<any>(null);
    const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);

    // Check if user is a business customer
    const isBusinessCustomer = user?.role === 'business_owner' || user?.role === 'business_manager';

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        area: '',
        deliveryTime: 'express',
        paymentMethod: 'cod'
    });

    // Fetch business profile for business customers
    useEffect(() => {
        const fetchBusinessProfile = async () => {
            if (isAuthenticated && isBusinessCustomer && user?.id) {
                setIsLoadingBusiness(true);
                try {
                    const response = await fetch(`/api/business-profile?userId=${user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setBusinessProfile(data.profile);
                    }
                } catch (error) {
                    console.error('Error fetching business profile:', error);
                } finally {
                    setIsLoadingBusiness(false);
                }
            }
        };

        fetchBusinessProfile();
    }, [isAuthenticated, isBusinessCustomer, user?.id]);

    // Sync form data with user/address state
    useEffect(() => {
        if (isAuthenticated) {
            if (isBusinessCustomer && businessProfile) {
                // For business customers, use business profile data
                setFormData(prev => ({
                    ...prev,
                    name: businessProfile.businessName || '',
                    phone: businessProfile.phoneNumber || '',
                    address: businessProfile.legalName || '', // Use legal name as address placeholder
                    area: ''
                }));
            } else {
                // For regular customers, use customer profile
                setFormData(prev => ({
                    ...prev,
                    name: user?.name || '',
                    phone: user?.phone || '',
                    address: selectedAddress?.fullAddress || '',
                    area: ''
                }));
            }
        }
    }, [isAuthenticated, user, selectedAddress, isBusinessCustomer, businessProfile]);

    const subtotal = getTotalPrice();
    const FREE_DELIVERY_THRESHOLD = 3000;
    const DELIVERY_FEE = 60;
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            return;
        }

        let addressToUse;

        if (isBusinessCustomer && businessProfile) {
            // For business customers, use business legal name as address
            addressToUse = businessProfile.legalName || businessProfile.businessName;
        } else {
            // For regular customers, use selected address
            addressToUse = selectedAddress?.fullAddress;
        }

        if (!addressToUse || !formData.phone || (!isAuthenticated && !formData.name)) {
            setError('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Save order to database via API
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id, // UUID
                    items: items,
                    total: total,
                    deliveryFee: deliveryFee,
                    shippingAddress: {
                        address: addressToUse || '',
                        area: formData.area || '',
                        city: 'Chittagong',
                        phone: formData.phone,
                        name: formData.name
                    },
                    paymentMethod: formData.paymentMethod
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create order');
            }

            const orderId = data.orderId;

            // Also add to local store for backward compatibility
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

            // Trigger PDF generation in background
            fetch('/api/generate-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    customer: {
                        name: formData.name,
                        email: user?.email || 'guest',
                        address: addressToUse,
                        phone: formData.phone
                    },
                    items: items.map(i => ({
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity
                    }))
                })
            }).catch(err => console.error('Bg Invoice Gen Error:', err));

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
    if (!isAuthenticated) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>How would you like to checkout?</h1>
                <div className={styles.authOptions}>
                    <div className={styles.authCard} onClick={() => router.push('/login?redirect=/checkout')}>
                        <LogIn size={48} className={styles.iconWrapper} />
                        <h3>Log In</h3>
                        <p>Unlock exclusive savings and manage your business orders seamlessly with our tailored B2B portal.</p>
                        <Button fullWidth>Log In</Button>
                    </div>

                    <div className={styles.authCard} onClick={() => router.push('/signup?redirect=/checkout')}>
                        <UserPlus size={48} className={styles.iconWrapper} />
                        <h3>Become a Customer</h3>
                        <p>Join us today to unlock exclusive perks, detailed order tracking, and personalized offers designed just for you.</p>
                        <Button fullWidth>Register Today</Button>
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

                        {/* Authenticated Address Selector */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className={styles.formGrid}>
                                <Input
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={isBusinessCustomer}
                                />
                                <Input
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={isBusinessCustomer}
                                />
                            </div>

                            {isBusinessCustomer ? (
                                // Business customers see their business info (no change option)
                                <div className={styles.selectedAddress}>
                                    <div className={styles.addressDetails}>
                                        <span className={styles.addressLabel}>
                                            <MapPin size={16} /> Delivery Address
                                        </span>
                                        <span className={styles.addressText}>
                                            {isLoadingBusiness ? (
                                                'Loading business information...'
                                            ) : (
                                                <>
                                                    <strong>{businessProfile?.businessName || 'N/A'}</strong>
                                                    <br />
                                                    {businessProfile?.legalName || 'Legal name not available'}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                // Regular customers can change/add address
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
                            )}
                        </div>
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
                                <span className={styles.slotTime}>Same Day Delivery</span>
                            </button>
                            <button
                                className={`${styles.timeSlot} ${formData.deliveryTime === 'standard' ? styles.activeSlot : ''}`}
                                onClick={() => setFormData({ ...formData, deliveryTime: 'standard' })}
                            >
                                <span className={styles.slotLabel}>Standard</span>
                                <span className={styles.slotTime}>Next Day Delivery</span>
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
                                <span>৳{(item.price || 0) * item.quantity}</span>
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
