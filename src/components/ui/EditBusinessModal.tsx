"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { toast } from 'react-hot-toast';
import { BusinessEntity } from '@/lib/data';

interface EditBusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: BusinessEntity | null;
    onSave: (id: string, data: Partial<BusinessEntity>) => Promise<void>;
}

export const EditBusinessModal: React.FC<EditBusinessModalProps> = ({ isOpen, onClose, business, onSave }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [tin, setTin] = useState('');
    const [bin, setBin] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && business) {
            setName(business.name);
            setAddress(business.address);
            setPhone(business.phone);
            setTin(business.tin || '');
            setBin(business.bin || '');
        }
    }, [isOpen, business]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!business) return;

        setLoading(true);
        try {
            await onSave(business.id, { name, address, phone, tin, bin });
            // Show toast as requested by user
            toast.success("The changes are being verified by admin");
            onClose();
        } catch (error) {
            console.error("Failed to update business:", error);
            toast.error("Failed to submit changes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '1rem',
                width: '90%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Edit Business Details</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Business Name *</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Address *</label>
                        <input value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone Number *</label>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>TIN (Optional)</label>
                        <input value={tin} onChange={(e) => setTin(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>BIN (Optional)</label>
                        <input value={bin} onChange={(e) => setBin(e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <Button type="submit" disabled={loading} fullWidth>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button type="button" variant="ghost" onClick={onClose} fullWidth>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
    border: '1px solid var(--border-grey)'
};
