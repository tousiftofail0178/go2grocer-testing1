"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Phone, Mail, MapPin, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './businesses.module.css';

interface Business {
    businessId: number;
    businessName: string;
    legalName: string;
    email: string;
    phoneNumber: string;
    address: string;
    tradeLicenseNumber: string;
    taxCertificateNumber: string;
    licenseExpiryDate: string;
    verificationStatus: string;
    createdAt: string;
}

export default function MyBusinessesPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!user) {
            router.push('/login');
            return;
        }
        fetchBusinesses();
    }, [user, mounted]);

    const fetchBusinesses = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/business-profile?userId=${user?.id}`);
            const data = await response.json();

            if (data.businesses) {
                setBusinesses(data.businesses);
            }
        } catch (error) {
            console.error('Error fetching businesses:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return <CheckCircle size={20} className={styles.statusIconVerified} />;
            case 'pending':
                return <Clock size={20} className={styles.statusIconPending} />;
            case 'rejected':
                return <XCircle size={20} className={styles.statusIconRejected} />;
            default:
                return <Clock size={20} className={styles.statusIconPending} />;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusClass = status === 'verified' ? styles.badgeVerified :
            status === 'pending' ? styles.badgePending :
                styles.badgeRejected;

        return (
            <div className={`${styles.statusBadge} ${statusClass}`}>
                {getStatusIcon(status)}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        );
    };

    if (!mounted) return null;

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading your businesses...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>My Businesses</h1>
                    <p className={styles.subtitle}>View and manage your registered businesses</p>
                </div>
                <button
                    className={styles.primaryButton}
                    onClick={() => router.push('/business-owner/apply-business')}
                >
                    <Building2 size={20} />
                    Register New Business
                </button>
            </div>

            {businesses.length === 0 ? (
                <div className={styles.emptyState}>
                    <Building2 size={64} className={styles.emptyIcon} />
                    <h3>No businesses registered yet</h3>
                    <p>Get started by registering your first business on the platform</p>
                    <button
                        className={styles.primaryButton}
                        onClick={() => router.push('/business-owner/apply-business')}
                    >
                        Register Your Business
                    </button>
                </div>
            ) : (
                <div className={styles.businessGrid}>
                    {businesses.map((business) => (
                        <div key={business.businessId} className={styles.businessCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.businessIcon}>
                                    <Building2 size={32} />
                                </div>
                                {getStatusBadge(business.verificationStatus)}
                            </div>

                            <div className={styles.cardBody}>
                                <h3 className={styles.businessName}>{business.businessName}</h3>
                                <p className={styles.legalName}>{business.legalName}</p>

                                <div className={styles.businessDetails}>
                                    <div className={styles.detail}>
                                        <Mail size={16} />
                                        <span>{business.email}</span>
                                    </div>
                                    <div className={styles.detail}>
                                        <Phone size={16} />
                                        <span>{business.phoneNumber}</span>
                                    </div>
                                    <div className={styles.detail}>
                                        <MapPin size={16} />
                                        <span>{business.address}</span>
                                    </div>
                                    <div className={styles.detail}>
                                        <Calendar size={16} />
                                        <span>License expires: {new Date(business.licenseExpiryDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <div className={styles.metaInfo}>
                                        <small>Trade License: {business.tradeLicenseNumber}</small>
                                        <small>Tax Certificate: {business.taxCertificateNumber}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.infoBox}>
                <strong>Note:</strong> To modify business information or add managers, please contact G2G admin or use the respective action buttons on the dashboard.
            </div>
        </div>
    );
}
