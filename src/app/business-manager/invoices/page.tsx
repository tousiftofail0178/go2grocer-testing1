"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Search, Filter, FileText, Calendar, DollarSign, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
// Reuse styles from business-owner implementation
import styles from '../../business-owner/invoices/invoices.module.css';
import { toast } from 'react-hot-toast';

export default function BusinessManagerInvoicesPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    // State for real invoices
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);

    // Fetch invoices from API
    React.useEffect(() => {
        // Strict Role Check for Manager
        if (!user || user.role !== 'business_manager') {
            router.push('/');
            return;
        }

        async function fetchInvoices() {
            try {
                setLoading(true);
                // API already handles manager logic via userId
                const response = await fetch(`/api/invoices?userId=${user?.id}`);
                const data = await response.json();

                if (response.ok && data.invoices) {
                    setInvoices(data.invoices);
                } else {
                    console.error('Failed to fetch invoices:', data.error);
                    toast.error('Failed to load invoices');
                }
            } catch (error) {
                console.error('Error fetching invoices:', error);
                toast.error('Error loading invoices');
            } finally {
                setLoading(false);
            }
        }

        if (user?.id) {
            fetchInvoices();
        }
    }, [user, router]);

    // Toggle status filter
    const toggleStatusFilter = (status: string) => {
        if (status === 'all') {
            setSelectedStatuses([]);
        } else {
            setSelectedStatuses(prev => {
                if (prev.includes(status)) {
                    return prev.filter(s => s !== status);
                } else {
                    return [...prev, status];
                }
            });
        }
    };

    // Filter invoices matches
    const filteredInvoices = useMemo(() => {
        let filtered = invoices;

        if (selectedStatuses.length > 0) {
            filtered = filtered.filter(inv => selectedStatuses.includes(inv.status.toLowerCase()));
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(inv =>
                inv.invoiceNumber.toLowerCase().includes(query) ||
                String(inv.orderId).includes(query)
            );
        }

        return filtered;
    }, [invoices, searchQuery, selectedStatuses]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = invoices.length;
        const paid = invoices.filter(inv => inv.status.toLowerCase() === 'paid').length;
        const pending = invoices.filter(inv => inv.status.toLowerCase() !== 'paid').length;
        const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

        return { total, paid, pending, totalAmount };
    }, [invoices]);

    const handleViewDetails = (invoice: any) => {
        setSelectedInvoice(invoice);
    };

    const handleDownloadInvoice = async (invoice: any) => {
        setIsDownloading(invoice.id);
        try {
            const response = await fetch('/api/generate-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_id: invoice.orderId,
                    // Customer info is fetched server-side now, so minimal data needs to be passed
                    // but we pass placeholders just in case legacy logic persists (though we just updated it)
                    customer: {
                        name: invoice.businessName,
                        address: 'Fetched from DB',
                        phone: user?.phone || '',
                        email: user?.email || ''
                    }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to generate invoice: ${response.status} - ${errorText}`);
            }

            const blob = await response.blob();
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            if (pdfBlob.size === 0) throw new Error('Received empty PDF file');

            const url = window.URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 10000);

        } catch (error: any) {
            console.error('Error downloading invoice:', error);
            toast.error(`Failed to download: ${error.message}`);
        } finally {
            setIsDownloading(null);
        }
    };

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case 'paid': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'unpaid': return '#f59e0b';
            case 'overdue': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusBgColor = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case 'paid': return '#d1fae5';
            case 'pending': return '#fef3c7';
            case 'unpaid': return '#fef3c7';
            case 'overdue': return '#fee2e2';
            default: return '#f3f4f6';
        }
    };

    if (loading) {
        return <div className={styles.container} style={{ textAlign: 'center', padding: '4rem' }}>Loading invoices...</div>;
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <Link href="/business-manager" className={styles.backButton}>
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className={styles.title}>Business Invoices</h1>
                </div>

                {/* Stats Bar */}
                <div className={styles.statsBar}>
                    <div className={styles.statCard}>
                        <FileText size={24} color="#3b82f6" />
                        <div>
                            <div className={styles.statValue}>{stats.total}</div>
                            <div className={styles.statLabel}>Total Invoices</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.paid}</div>
                            <div className={styles.statLabel}>Paid</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.pending}</div>
                            <div className={styles.statLabel}>Pending</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <DollarSign size={24} color="#10b981" />
                        <div>
                            <div className={styles.statValue}>৳{Number(stats.totalAmount).toLocaleString()}</div>
                            <div className={styles.statLabel}>Total Amount</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filtersSection}>
                <div className={styles.searchBox} style={{ flex: 1 }}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by invoice # or order ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {/* Invoices Grid */}
            {filteredInvoices.length > 0 ? (
                <div className={styles.invoicesGrid}>
                    {filteredInvoices.map(invoice => (
                        <div key={invoice.id} className={styles.invoiceCard}>
                            <div className={styles.invoiceHeader}>
                                <div className={styles.invoiceNumber}>
                                    <FileText size={20} color="#3b82f6" />
                                    <span>{invoice.invoiceNumber}</span>
                                </div>
                                <span
                                    className={styles.statusBadge}
                                    style={{
                                        backgroundColor: getStatusBgColor(invoice.status),
                                        color: getStatusColor(invoice.status)
                                    }}
                                >
                                    {invoice.status.toUpperCase()}
                                </span>
                            </div>

                            <div className={styles.invoiceBody}>
                                <div className={styles.invoiceRow}>
                                    <Building2 size={16} color="#6b7280" />
                                    <span className={styles.invoiceLabel}>Business:</span>
                                    <span className={styles.invoiceValue}>{invoice.businessName}</span>
                                </div>

                                <div className={styles.invoiceRow}>
                                    <Calendar size={16} color="#6b7280" />
                                    <span className={styles.invoiceLabel}>Date:</span>
                                    <span className={styles.invoiceValue}>{invoice.date}</span>
                                </div>

                                <div className={styles.invoiceRow}>
                                    <FileText size={16} color="#6b7280" />
                                    <span className={styles.invoiceLabel}>Order ID:</span>
                                    <span className={styles.invoiceValue}>#{invoice.orderId}</span>
                                </div>

                                <div className={styles.invoiceDivider}></div>

                                <div className={styles.invoiceAmount}>
                                    <span>Total Amount</span>
                                    <span className={styles.amount}>৳{Number(invoice.totalAmount).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className={styles.invoiceActions}>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => handleViewDetails(invoice)}
                                >
                                    View Details
                                </button>
                                <button
                                    className={styles.downloadButton}
                                    onClick={() => handleDownloadInvoice(invoice)}
                                    disabled={isDownloading === invoice.id}
                                >
                                    <Download size={16} />
                                    {isDownloading === invoice.id ? 'Downloading...' : 'Download PDF'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <FileText size={64} color="#d1d5db" />
                    <h3>No Invoices Found</h3>
                    <p>No invoices match your search criteria.</p>
                </div>
            )}

            {/* Invoice Details Modal */}
            {selectedInvoice && (
                <div className={styles.modalOverlay} onClick={() => setSelectedInvoice(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Invoice Details</h2>
                            <button
                                className={styles.closeButton}
                                onClick={() => setSelectedInvoice(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Invoice Number:</span>
                                <span className={styles.detailValue}>{selectedInvoice.invoiceNumber}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Business:</span>
                                <span className={styles.detailValue}>{selectedInvoice.businessName}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Order ID:</span>
                                <span className={styles.detailValue}>#{selectedInvoice.orderId}</span>
                            </div>
                            {selectedInvoice.customerId && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Customer ID:</span>
                                    <span className={styles.detailValue}>{selectedInvoice.customerId}</span>
                                </div>
                            )}
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Date:</span>
                                <span className={styles.detailValue}>{selectedInvoice.date}</span>
                            </div>

                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Status:</span>
                                <span
                                    className={styles.statusBadge}
                                    style={{
                                        backgroundColor: getStatusBgColor(selectedInvoice.status),
                                        color: getStatusColor(selectedInvoice.status)
                                    }}
                                >
                                    {selectedInvoice.status.toUpperCase()}
                                </span>
                            </div>

                            <div className={styles.divider}></div>

                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>Total Amount:</span>
                                <span className={styles.totalValue}>৳{Number(selectedInvoice.totalAmount).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.downloadButtonModal}
                                onClick={() => handleDownloadInvoice(selectedInvoice)}
                                disabled={isDownloading === selectedInvoice.id}
                            >
                                <Download size={18} />
                                {isDownloading === selectedInvoice.id ? 'Downloading...' : 'Download PDF'}
                            </button>
                            <button
                                className={styles.closeButtonSecondary}
                                onClick={() => setSelectedInvoice(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
