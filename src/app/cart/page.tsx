"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { useCartStore } from '@/store/useCartStore';
import styles from './page.module.css';

export default function CartPage() {
    const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

    const subtotal = getTotalPrice();
    const deliveryFee = subtotal > 0 ? 60 : 0;
    const total = subtotal + deliveryFee;

    if (items.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyCart}>
                    <ShoppingBag size={64} color="var(--text-grey)" />
                    <h2>Your cart is empty</h2>
                    <p>Add some products to get started!</p>
                    <Link href="/shop">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Shopping Cart ({items.length} items)</h1>

            <div className={styles.layout}>
                {/* Cart Items List */}
                <div className={styles.itemsList}>
                    {items.map((item) => (
                        <div key={item.id} className={styles.item}>
                            <div className={styles.itemImageWrapper}>
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    className={styles.itemImage}
                                />
                            </div>

                            <div className={styles.itemDetails}>
                                <h3 className={styles.itemName}>{item.name}</h3>
                                <span className={styles.itemWeight}>{item.weight}</span>
                                <div className={styles.itemPrice}>৳{item.price}</div>
                            </div>

                            <div className={styles.itemActions}>
                                <QuantitySelector
                                    quantity={item.quantity}
                                    onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                                    onDecrease={() => {
                                        if (item.quantity > 1) {
                                            updateQuantity(item.id, item.quantity - 1);
                                        } else {
                                            removeItem(item.id);
                                        }
                                    }}
                                />
                                <div className={styles.itemTotal}>৳{(item.price || 0) * item.quantity}</div>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => removeItem(item.id)}
                                    aria-label="Remove item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className={styles.summary}>
                    <h2 className={styles.summaryTitle}>Order Summary</h2>

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

                    <div className={styles.checkoutBtnWrapper}>
                        <Link href="/checkout" style={{ width: '100%' }}>
                            <Button fullWidth size="default">
                                Proceed to Checkout <ArrowRight size={18} />
                            </Button>
                        </Link>
                    </div>

                    <p className={styles.secureText}>
                        Secure Checkout. 100% Money Back Guarantee.
                    </p>
                </div>
            </div>
        </div>
    );
}
