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
    const { addresses, selectedAddress, addAddress, selectAddress } = useAuthStore();
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
                        </div>
                        <Button
                            className={styles.addNewBtn}
                            variant="secondary"
                            onClick={() => setIsAdding(true)}
                            icon={<Plus size={18} />}
                        >
                            Add New Address
                        </Button>
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
