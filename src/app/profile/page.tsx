"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Package, MapPin, LogOut, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { orderApi } from '@/lib/api';
import styles from './page.module.css';
import { BusinessEntity } from '@/lib/data';

import { AddressModal } from '@/components/ui/AddressModal';
import { OrderDetailsModal } from '@/components/ui/OrderDetailsModal';
import { EditBusinessModal } from '@/components/ui/EditBusinessModal';
import { useOrderStore, Order } from '@/store/useOrderStore';

// Basic modal for editing profile
const EditProfileModal = ({ isOpen, onClose, user, onSave }: any) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({ name, email, phone, address });
            onClose();
        } catch (error) {
            console.error(error);
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
                width: '90%', maxWidth: '400px'
            }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Edit Profile</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                border: '1px solid var(--border-grey)'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                border: '1px solid var(--border-grey)'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                border: '1px solid var(--border-grey)'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Address</label>
                        <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                border: '1px solid var(--border-grey)'
                            }}
                        />
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
// Registered Businesses Modal
const BusinessRegistrationModal = ({ isOpen, onClose, onRegister, sendOtp, verifyOtp }: any) => {
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [tin, setTin] = useState('');
    const [bin, setBin] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep('details');
            setOtp('');
            setLoading(false);
        }
    }, [isOpen]);

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (!name || !address || !phone) {
            alert("Please fill required fields (Name, Address, Phone)");
            setLoading(false);
            return;
        }
        try {
            await sendOtp();
            setStep('otp');
        } catch (error) {
            console.error(error);
            alert("Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const isValid = await verifyOtp(otp);
            if (isValid) {
                await onRegister({ name, address, phone, tin, bin });
                onClose();
                // Reset form
                setName(''); setAddress(''); setPhone(''); setTin(''); setBin(''); setOtp(''); setStep('details');
            } else {
                alert("Invalid OTP");
            }
        } catch (error) {
            console.error(error);
            alert("Verification failed");
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
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
                    {step === 'details' ? 'Register Business' : 'Verify OTP'}
                </h3>

                {step === 'details' ? (
                    <form onSubmit={handleDetailsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Name */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Business Name *</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
                        </div>

                        {/* Address */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Address *</label>
                            <input value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} required />
                        </div>

                        {/* Phone */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone Number *</label>
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} required />
                        </div>

                        {/* TIN */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>TIN (Optional)</label>
                            <input value={tin} onChange={(e) => setTin(e.target.value)} style={inputStyle} />
                        </div>

                        {/* BIN */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>BIN (Optional)</label>
                            <input value={bin} onChange={(e) => setBin(e.target.value)} style={inputStyle} />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <Button type="submit" disabled={loading} fullWidth>
                                {loading ? 'Sending OTP...' : 'Next'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={onClose} fullWidth>
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            Please enter the OTP sent to your registered phone number to verify this business registration.
                        </p>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>OTP Code</label>
                            <input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={inputStyle}
                                placeholder="Enter OTP (1234)"
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <Button type="submit" disabled={loading} fullWidth>
                                {loading ? 'Verifying...' : 'Verify & Register'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setStep('details')} fullWidth>
                                Back
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
    border: '1px solid var(--border-grey)'
};

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, logout, addresses, updateProfile, businesses, registerBusiness, updateBusiness } = useAuthStore();
    const { orders } = useOrderStore(); // fetch directly from store
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    // Business Modal
    const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
    const [isEditBusinessModalOpen, setIsEditBusinessModalOpen] = useState(false);
    // Initialize editingBusiness state
    const [editingBusiness, setEditingBusiness] = useState<BusinessEntity | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Account</h1>
                <Button
                    variant="ghost"
                    onClick={() => {
                        logout();
                        window.location.href = '/';
                    }}
                    icon={<LogOut size={18} />}
                >
                    Logout
                </Button>
            </div>

            <div className={styles.grid}>
                {/* Profile Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <User size={24} className={styles.icon} />
                        <h2>Profile Details</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Name:</span>
                            <span className={styles.value}>{user?.name || 'Guest User'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Phone:</span>
                            <span className={styles.value}>{user?.phone}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>{user?.email || 'Not set'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Address:</span>
                            <span className={styles.value}>{user?.address || 'Not set'}</span>
                        </div>
                        <Button
                            variant="secondary"
                            size="small"
                            className={styles.addBtn}
                            onClick={() => setIsEditProfileOpen(true)}
                        >
                            Edit Details
                        </Button>
                    </div>
                </div>

                {/* Conditional Section: Businesses (B2B) vs Addresses (Consumer) */}
                {['b2b', 'owner', 'admin'].includes(user?.role || '') ? (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <MapPin size={24} className={styles.icon} />
                            <h2>My Businesses</h2>
                        </div>
                        <div className={styles.cardContent}>
                            {businesses?.length > 0 ? (
                                <div className={styles.addressList}>
                                    {businesses.map((biz) => (
                                        <div
                                            key={biz.id}
                                            className={styles.addressItem}
                                            style={{ position: 'relative', paddingRight: '3rem' }}
                                            onMouseEnter={(e) => {
                                                const btn = e.currentTarget.querySelector('.edit-btn') as HTMLElement;
                                                if (btn) btn.style.opacity = '1';
                                            }}
                                            onMouseLeave={(e) => {
                                                const btn = e.currentTarget.querySelector('.edit-btn') as HTMLElement;
                                                if (btn) btn.style.opacity = '0';
                                            }}
                                        >
                                            <div className={styles.addressLabel}>{biz.name}</div>
                                            <div className={styles.addressText}>{biz.address}</div>
                                            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#666' }}>
                                                Phone: {biz.phone}
                                            </div>
                                            <button
                                                className="edit-btn"
                                                onClick={() => {
                                                    setEditingBusiness(biz);
                                                    setIsEditBusinessModalOpen(true);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    right: '10px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s',
                                                    padding: '5px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#f0f0f0'
                                                }}
                                                title="Edit Business Details"
                                            >
                                                <Pencil size={16} color="var(--primary-green)" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.emptyText}>No businesses registered yet.</p>
                            )}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <Button
                                    variant="primary"
                                    size="small"
                                    className={styles.addBtn}
                                    onClick={() => setIsBusinessModalOpen(true)}
                                >
                                    Add New Business
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <MapPin size={24} className={styles.icon} />
                            <h2>Saved Addresses</h2>
                        </div>
                        <div className={styles.cardContent}>
                            {addresses.length > 0 ? (
                                <div className={styles.addressList}>
                                    {addresses.map((addr) => (
                                        <div key={addr.id} className={styles.addressItem}>
                                            <div className={styles.addressLabel}>{addr.label}</div>
                                            <div className={styles.addressText}>{addr.fullAddress}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.emptyText}>No saved addresses yet.</p>
                            )}
                            <Button
                                variant="secondary"
                                size="small"
                                className={styles.addBtn}
                                onClick={() => setIsAddressModalOpen(true)}
                            >
                                Add New Address
                            </Button>
                        </div>
                    </div>
                )}

                {/* Order History */}
                <div className={`${styles.card} ${styles.fullWidth}`}>
                    <div className={styles.cardHeader}>
                        <Package size={24} className={styles.icon} />
                        <h2>Order History</h2>
                    </div>
                    <div className={styles.cardContent}>
                        {orders.length > 0 ? (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id}>
                                                <td>#{order.id}</td>
                                                <td>{order.date}</td>
                                                <td>{order.items.length} items</td>
                                                <td>৳{order.total}</td>
                                                <td>
                                                    <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="ghost"
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setIsOrderModalOpen(true);
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className={styles.emptyText}>No orders found.</p>
                        )}
                    </div>
                </div>
            </div>

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
            />

            <OrderDetailsModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                order={selectedOrder}
            />

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                user={user}
                onSave={updateProfile}
            />

            <BusinessRegistrationModal
                isOpen={isBusinessModalOpen}
                onClose={() => setIsBusinessModalOpen(false)}
                onRegister={registerBusiness}
                sendOtp={useAuthStore.getState().sendBusinessRegistrationOtp}
                verifyOtp={useAuthStore.getState().verifyBusinessRegistrationOtp}
            />

            <EditBusinessModal
                isOpen={isEditBusinessModalOpen}
                onClose={() => setIsEditBusinessModalOpen(false)}
                business={editingBusiness}
                onSave={updateBusiness}
            />
        </div>
    );
}
