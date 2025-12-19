"use client";

import React, { useState } from 'react';
import { MapPin, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './AddressModal.module.css';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose }) => {
    const { addresses, selectedAddress, addAddress, selectAddress, businesses } = useAuthStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newAddress, setNewAddress] = useState('');

    if (!isOpen) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLabel || !newAddress) return;

        addAddress({
            id: Date.now().toString(),
            label: newLabel,
            fullAddress: newAddress
        });

        setNewLabel('');
        setNewAddress('');
        setIsAdding(false);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Select Delivery Location</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                {!isAdding ? (
                    <div className={styles.listContent}>
                        <div className={styles.list}>
                            {/* B2B Businesses Section */}
                            {businesses && businesses.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Registered Businesses</h4>
                                    {businesses.map((biz) => (
                                        <div
                                            key={`biz-${biz.id}`}
                                            className={`${styles.item} ${selectedAddress?.id === `biz-${biz.id}` ? styles.selected : ''}`}
                                            onClick={() => {
                                                selectAddress({
                                                    id: `biz-${biz.id}`,
                                                    label: biz.name,
                                                    fullAddress: biz.address
                                                });
                                                onClose();
                                            }}
                                        >
                                            <div className={styles.iconWrapper}>
                                                <MapPin size={20} />
                                            </div>
                                            <div className={styles.details}>
                                                <span className={styles.label}>{biz.name}</span>
                                                <span className={styles.address}>{biz.address}</span>
                                            </div>
                                            {selectedAddress?.id === `biz-${biz.id}` && (
                                                <Check size={20} className={styles.checkIcon} />
                                            )}
                                        </div>
                                    ))}
                                    <div className={styles.divider} style={{ margin: '1rem 0', height: '1px', background: '#eee' }}></div>
                                </div>
                            )}

                            {/* Saved Addresses - Only show if no businesses are registered (Consumer flow) */}
                            {(!businesses || businesses.length === 0) && addresses.length > 0 && (
                                <>
                                    <h4 style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Saved Addresses</h4>
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`${styles.item} ${selectedAddress?.id === addr.id ? styles.selected : ''}`}
                                            onClick={() => {
                                                selectAddress(addr);
                                                onClose();
                                            }}
                                        >
                                            <div className={styles.iconWrapper}>
                                                <MapPin size={20} />
                                            </div>
                                            <div className={styles.details}>
                                                <span className={styles.label}>{addr.label}</span>
                                                <span className={styles.address}>{addr.fullAddress}</span>
                                            </div>
                                            {selectedAddress?.id === addr.id && (
                                                <Check size={20} className={styles.checkIcon} />
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                        {(!businesses || businesses.length === 0) && (
                            <Button
                                className={styles.addNewBtn}
                                variant="secondary"
                                onClick={() => setIsAdding(true)}
                                icon={<Plus size={18} />}
                            >
                                Add New Address
                            </Button>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleAdd} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Label (e.g., Home, Work)</label>
                            <input
                                type="text"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                placeholder="Home"
                                required
                                autoFocus
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Full Address</label>
                            <textarea
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                                placeholder="House #123, Road #5, Block B..."
                                required
                                rows={3}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button type="submit">Save Address</Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
