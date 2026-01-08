"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Search, Filter, FileText, Calendar, DollarSign, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './invoices.module.css';
import { toast } from 'react-hot-toast';

// Mock invoice data - In production, this would come from an API
const MOCK_INVOICES = [
    {
        id: '1',
        invoiceNumber: 'INV-2025-001',
        businessId: '1',
        businessName: "Business's Business",
        orderId: '268803',
        date: '2025-12-21',
        amount: 285,
        status: 'paid' as const,
        items: 3,
        orderItems: [
            { name: 'Fresh Tomatoes', quantity: 2, price: 50 },      // 100
            { name: 'Organic Carrots', quantity: 3, price: 35 },     // 105
            { name: 'Green Lettuce', quantity: 2, price: 40 },       // 80
        ]                                                             // Total: 285
    },
    {
        id: '2',
        invoiceNumber: 'INV-2025-002',
        businessId: '1',
        businessName: "Business's Business",
        orderId: '268804',
        date: '2025-12-20',
        amount: 450,
        status: 'pending' as const,
        items: 6,
        orderItems: [
            { name: 'Chicken Breast', quantity: 2, price: 60 },      // 120
            { name: 'Fresh Milk', quantity: 4, price: 20 },          // 80
            { name: 'Brown Eggs', quantity: 3, price: 30 },          // 90
            { name: 'Cheese Slices', quantity: 2, price: 40 },       // 80
            { name: 'Butter', quantity: 1, price: 35 },              // 35
            { name: 'Yogurt', quantity: 5, price: 9 },               // 45
        ]                                                             // Total: 450
    },
    {
        id: '3',
        invoiceNumber: 'INV-2025-003',
        businessId: '2',
        businessName: "Fresh Foods Ltd",
        orderId: '268805',
        date: '2025-12-19',
        amount: 890,
        status: 'paid' as const,
        items: 8,
        orderItems: [
            { name: 'Premium Rice 5kg', quantity: 3, price: 180 },
            { name: 'Cooking Oil 2L', quantity: 2, price: 95 },
            { name: 'Sugar 1kg', quantity: 4, price: 40 },
            { name: 'Salt 1kg', quantity: 2, price: 15 },
            { name: 'Wheat Flour 2kg', quantity: 3, price: 55 },
            { name: 'Pasta', quantity: 5, price: 30 },
            { name: 'Tomato Sauce', quantity: 4, price: 25 },
            { name: 'Olive Oil', quantity: 1, price: 120 },
        ]
    },
    {
        id: '4',
        invoiceNumber: 'INV-2025-004',
        businessId: '1',
        businessName: "Business's Business",
        orderId: '268806',
        date: '2025-12-15',
        amount: 325,
        status: 'overdue' as const,
        items: 5,
        orderItems: [
            { name: 'Fresh Fish', quantity: 2, price: 85 },
            { name: 'Shrimp', quantity: 1, price: 95 },
            { name: 'Salmon Fillet', quantity: 1, price: 110 },
            { name: 'Tuna Can', quantity: 3, price: 15 },
            { name: 'Crab Meat', quantity: 1, price: 65 },
        ]
    },
    {
        id: '5',
        invoiceNumber: 'INV-2025-005',
        businessId: '2',
        businessName: "Fresh Foods  Ltd",
        orderId: '268807',
        date: '2025-12-18',
        amount: 670,
        status: 'pending' as const,
        items: 7,
        orderItems: [
            { name: 'Apple 1kg', quantity: 4, price: 60 },
            { name: 'Banana 1kg', quantity: 5, price: 35 },
            { name: 'Orange 1kg', quantity: 3, price: 45 },
            { name: 'Grapes', quantity: 2, price: 80 },
            { name: 'Strawberries', quantity: 2, price: 95 },
            { name: 'Watermelon', quantity: 1, price: 110 },
            { name: 'Mango', quantity: 4, price: 50 },
        ]
    },
];

const MOCK_BUSINESSES = [
    { id: '1', name: "Business's Business" },
    { id: '2', name: "Fresh Foods Ltd" },
];

export default function BusinessInvoicesPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    // State for real invoices
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedBusiness, setSelectedBusiness] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);

    // Fetch invoices from API
    React.useEffect(() => {
        if (!user || user.role !== 'business_owner') {
            router.push('/');
            return;
        }

        async function fetchInvoices() {
            try {
                setLoading(true);
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

    // Filter invoices based on selected business, search, and status
    const filteredInvoices = useMemo(() => {
        let filtered = invoices;

        // Filter by business (Not fully implemented in UI dropdown yet since we need business list, 
        // but API returns businessName. For now, filter logic assumes we might filter by name or ID if available)
        // Since we don't have a separate list of businesses fetched here yet, we'll skip Business Dropdown filtering for now
        // or strictly filter if we had business IDs. 
        // Logic: if selectedBusiness !== 'all', try to match. 
        // But the current UI dropdown uses MOCK_BUSINESSES. 
        // We will DISABLED the business selector for this iteration or map it dynamically if we fetched businesses.
        // Let's keep it simple: Filter by SEARCH and STATUS only for now.

        // Filter by status (if any selected)
        if (selectedStatuses.length > 0) {
            filtered = filtered.filter(inv => selectedStatuses.includes(inv.status.toLowerCase())); // API status might be Capitalized
        }

        // Filter by search query (invoice number or order ID)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(inv =>
                inv.invoiceNumber.toLowerCase().includes(query) ||
                String(inv.orderId).includes(query)
            );
        }

        return filtered;
    }, [invoices, selectedBusiness, searchQuery, selectedStatuses]);

    // Calculate stats from ALL invoices
    const stats = useMemo(() => {
        const total = invoices.length;
        const paid = invoices.filter(inv => inv.status.toLowerCase() === 'paid').length;
        const pending = invoices.filter(inv => inv.status.toLowerCase() !== 'paid').length; // Simplify: anything not paid is pending/due
        const overdue = invoices.filter(inv => inv.status.toLowerCase() === 'overdue').length;
        const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

        return { total, paid, pending, overdue, totalAmount };
    }, [invoices]);

    const handleViewDetails = (invoice: any) => {
        setSelectedInvoice(invoice);
    };

    const handleDownloadInvoice = async (invoice: any) => {
        setIsDownloading(invoice.id);
        try {
            // Call the invoice generation API
            const response = await fetch('/api/generate-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_id: invoice.orderId,
                    customer: {
                        name: invoice.businessName,
                        address: 'Business Address',
                        phone: user?.phone || '',
                        email: user?.email || ''
                    },
                    items: [] // API isn't returning items yet, so passing empty. Secure logic would fetch items on server.
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
            case 'unpaid': return '#f59e0b'; // Handle 'Unpaid' from API
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
                    <Link href="/business-owner" className={styles.backButton}>
                        <ArrowLeft size={20} />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className={styles.title}>Business Invoices</h1>
                </div>

                {/* Stats Bar */}
                <div className={styles.statsBar}>
                    <button
                        className={`${styles.statCard} ${selectedStatuses.length === 0 ? styles.statCardActive : ''}`}
                        onClick={() => toggleStatusFilter('all')}
                    >
                        <FileText size={24} color="#3b82f6" />
                        <div>
                            <div className={styles.statValue}>{stats.total}</div>
                            <div className={styles.statLabel}>Total Invoices</div>
                        </div>
                    </button>

                    <button
                        className={`${styles.statCard} ${selectedStatuses.includes('paid') ? styles.statCardActive : ''}`}
                        onClick={() => toggleStatusFilter('paid')}
                    >
                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.paid}</div>
                            <div className={styles.statLabel}>Paid</div>
                        </div>
                    </button>

                    <button
                        className={`${styles.statCard} ${selectedStatuses.includes('pending') ? styles.statCardActive : ''}`}
                        onClick={() => toggleStatusFilter('pending')}
                    >
                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.pending}</div>
                            <div className={styles.statLabel}>Pending</div>
                        </div>
                    </button>

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
                {/* Removed Business Dropdown for simplicity as requested, focused on Search */}
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

                                <div className={styles.invoiceRow}>
                                    <span className={styles.invoiceLabel}>Items:</span>
                                    <span className={styles.invoiceValue}>{invoice.itemCount} items</span>
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
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Date:</span>
                                <span className={styles.detailValue}>{selectedInvoice.date}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Number of Items:</span>
                                <span className={styles.detailValue}>{selectedInvoice.itemCount} items</span>
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

                            {/* Disabled Item List since API doesn't return Items yet */}
                            <div className={styles.orderItemsSection}>
                                <h3 className={styles.sectionTitle}>Order Items</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Item details are available in Order History.</p>
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
