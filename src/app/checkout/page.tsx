"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Clock, CreditCard, Banknote, Loader2, LogIn, UserPlus, FileText, StickyNote, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { getUserName } from '@/lib/actions/users';
import { getUserBusinesses } from '@/lib/actions/business';
import styles from './page.module.css';

interface Business {
    id: number;
    name: string;
    role: 'OWNER' | 'MANAGER';
    address?: {
        street: string;
        area: string;
        city: string;
        postalCode: string | null;
    };
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { user, isAuthenticated } = useAuthStore();
    const { addOrder } = useOrderStore();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState<string>('');

    // B2B State
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        phone: '',
        deliveryTime: 'express',
        paymentMethod: 'cod',
        poNumber: '',
        orderNotes: ''
    });

    // Check if user is a business customer
    const isBusinessCustomer = user?.role === 'business_owner' || user?.role === 'business_manager';

    // Fetch user name and businesses on mount
    useEffect(() => {
        async function loadUserData() {
            if (!isAuthenticated) {
                setIsLoadingData(false);
                return;
            }

            try {
                // 1. Fetch user's real name
                const nameResult = await getUserName();
                if (nameResult.success && nameResult.name) {
                    setUserName(nameResult.name);
                }

                // 2. Fetch user's verified businesses
                if (isBusinessCustomer) {
                    const businessResult = await getUserBusinesses();
                    if (businessResult.success && businessResult.businesses) {
                        setBusinesses(businessResult.businesses);

                        // Scenario A: Auto-select if only one business
                        if (businessResult.businesses.length === 1) {
                            setSelectedBusinessId(businessResult.businesses[0].id);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                toast.error('Failed to load business data');
            } finally {
                setIsLoadingData(false);
            }
        }

        loadUserData();
    }, [isAuthenticated, isBusinessCustomer]);

    // Derived State
    const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

    const subtotal = getTotalPrice();
    const FREE_DELIVERY_THRESHOLD = 3000;
    const DELIVERY_FEE = 60;
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!isAuthenticated) return;

        if (!selectedBusiness) {
            setError('Please select a business for delivery');
            toast.error('Please select a business');
            return;
        }

        if (!selectedBusiness.address) {
            setError('Selected business has no address linked. Please update your business profile.');
            return;
        }

        if (!formData.phone) {
            setError('Please provide a contact phone number');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Prepare shipping address from business profile
            const shippingAddr = {
                address: selectedBusiness.address.street,
                area: selectedBusiness.address.area,
                city: selectedBusiness.address.city,
                postalCode: selectedBusiness.address.postalCode,
                phone: formData.phone,
                name: selectedBusiness.name // Delivering to Business Name
            };

            // Save order to database via API
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    selectedBusinessId: selectedBusiness.id, // Explicit business selection
                    items: items,
                    total: total,
                    deliveryFee: deliveryFee,
                    shippingAddress: shippingAddr,
                    paymentMethod: formData.paymentMethod,
                    poNumber: formData.poNumber,
                    orderNotes: formData.orderNotes
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create order');
            }

            const orderId = data.orderId;

            // Also add to local store for backward compatibility/optimistic updates
            const newOrder = {
                id: orderId,
                date: new Date().toISOString().split('T')[0],
                items: [...items],
                total: total,
                deliveryFee: deliveryFee,
                status: 'Processing' as const,
                shippingAddress: shippingAddr,
                paymentMethod: formData.paymentMethod
            };

            addOrder(newOrder);

            clearCart();
            router.push(`/order-confirmation?orderId=${orderId}`);
            toast.success('Order placed successfully!');
        } catch (err: any) {
            console.error('Order failed:', err);
            setError(err.message || 'Failed to place order. Please try again.');
            toast.error(err.message || 'Failed to place order');
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDER STATES ---

    // 1. Empty Cart
    if (items.length === 0) {
        return (
            <div className={styles.container} style={{ textAlign: 'center', padding: '4rem' }}>
                <h1 className={styles.title}>Your cart is empty</h1>
                <Button onClick={() => router.push('/shop')}>Start Shopping</Button>
            </div>
        );
    }

    // 2. Unauthenticated
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

    // 3. Loading Data
    if (isLoadingData) {
        return (
            <div className={styles.container} style={{ textAlign: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>Loading your business profile...</p>
            </div>
        );
    }

    // 4. No Verified Business (Blocker)
    if (businesses.length === 0) {
        return (
            <div className={styles.container}>
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#fff' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '50%', marginBottom: '1.5rem', color: '#ef4444' }}>
                        <AlertCircle size={48} />
                    </div>
                    <h1 className={styles.title} style={{ marginBottom: '1rem' }}>Business Verification Required</h1>
                    <p style={{ color: '#4b5563', marginBottom: '2rem', lineHeight: '1.6' }}>
                        To place B2B wholesale orders, you must have a verified business account.
                        Please visit your dashboard to register a business or check your application status.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Button onClick={() => router.push('/business-owner/dashboard')}>
                            Go to Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/')}>
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 5. Main Checkout Form
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>B2B Checkout</h1>
            {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

            <div className={styles.layout}>
                {/* Left: Forms */}
                <div className={styles.forms}>

                    {/* Select Business Section (Replaces Address) */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconWrapper}><Building2 size={20} /></div>
                            <h2 className={styles.sectionTitle}>Delivering to Business</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {businesses.length === 1 ? (
                                // Scenario A: Single Business (Auto-selected display)
                                <div className={styles.selectedAddress} style={{ border: '2px solid #10b981', backgroundColor: '#f0fdf4' }}>
                                    <div className={styles.addressDetails}>
                                        <span className={styles.addressText}>
                                            <strong style={{ fontSize: '1.1rem', color: '#064e3b' }}>{businesses[0].name}</strong>
                                            <span style={{ display: 'inline-block', marginLeft: '0.5rem', fontSize: '0.75rem', padding: '2px 8px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '999px', fontWeight: 600 }}>Active</span>
                                            <br />
                                            {businesses[0].address ? (
                                                <>
                                                    {businesses[0].address.street}<br />
                                                    {businesses[0].address.area}, {businesses[0].address.city}
                                                </>
                                            ) : (
                                                <span style={{ color: '#ef4444' }}>No address linked</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                // Scenario B: Multiple Businesses (Selector)
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Select which business location needs stock:</p>
                                    {businesses.map((biz) => (
                                        <label
                                            key={biz.id}
                                            className={styles.paymentOption} // Reusing payment card style for list feel
                                            style={{
                                                cursor: 'pointer',
                                                border: selectedBusinessId === biz.id ? '2px solid #10b981' : '1px solid #e5e7eb',
                                                backgroundColor: selectedBusinessId === biz.id ? '#f0fdf4' : 'white'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="business"
                                                checked={selectedBusinessId === biz.id}
                                                onChange={() => setSelectedBusinessId(biz.id)}
                                            />
                                            <div style={{ marginLeft: '1rem' }}>
                                                <div style={{ fontWeight: 600, color: '#374151' }}>{biz.name}</div>
                                                {biz.address && (
                                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                        {biz.address.area}, {biz.address.city}
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Contact Person (Read-Only) */}
                            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.5rem' }}>Receiving Contact Person</label>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <input
                                        type="text"
                                        value={userName || user?.name || ''}
                                        disabled
                                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#e5e7eb', color: '#6b7280' }}
                                    />
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                        required
                                    />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Name is set from your profile. Please ensure phone number is correct for delivery coordination.</p>
                            </div>
                        </div>
                    </section>

                    {/* Order Details (PO & Notes) */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.iconWrapper}><FileText size={20} /></div>
                            <h2 className={styles.sectionTitle}>Order Details</h2>
                        </div>

                        <div className={styles.formGrid}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                                    Order Reference Name <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                                </label>
                                <Input
                                    name="poNumber"
                                    value={formData.poNumber}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Weekend Restock, Kitchen Supplies, or PO-123"
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                                    Order Note / Instructions <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                                </label>
                                <textarea
                                    name="orderNotes"
                                    value={formData.orderNotes}
                                    onChange={handleInputChange}
                                    placeholder="Any special instructions for delivery or packaging..."
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Delivery Time */}
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
                            <h2 className={styles.sectionTitle}>Preferred Payment Method</h2>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>Select how you intend to pay. This is for record-keeping; payment will be collected later.</p>
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
                                    value="bank_transfer"
                                    checked={formData.paymentMethod === 'bank_transfer'}
                                    onChange={handleInputChange}
                                />
                                <div className={styles.paymentCard}>
                                    <CreditCard size={24} />
                                    <span>Bank Transfer</span>
                                </div>
                            </label>

                            <label className={styles.paymentOption}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cheque"
                                    checked={formData.paymentMethod === 'cheque'}
                                    onChange={handleInputChange}
                                />
                                <div className={styles.paymentCard}>
                                    <StickyNote size={24} />
                                    <span>Cheque</span>
                                </div>
                            </label>

                            {/* Removed Card/bKash as per B2B requirement for now */}
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
                        disabled={isLoading || !selectedBusiness}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm Business Order'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
