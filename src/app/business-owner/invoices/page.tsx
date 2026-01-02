"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Search, Filter, FileText, Calendar, DollarSign, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './invoices.module.css';

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

    const [selectedBusiness, setSelectedBusiness] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]); // New state for status filters
    const [selectedInvoice, setSelectedInvoice] = useState<typeof MOCK_INVOICES[0] | null>(null); // For modal
    const [isDownloading, setIsDownloading] = useState<string | null>(null); // Track downloading invoice

    // Check authentication
    React.useEffect(() => {
        if (!user || user.role !== 'business_owner') {
            router.push('/');
        }
    }, [user, router]);

    // Toggle status filter
    const toggleStatusFilter = (status: string) => {
        if (status === 'all') {
            // Reset - show all
            setSelectedStatuses([]);
        } else {
            // Toggle individual status
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
        let filtered = MOCK_INVOICES;

        // Filter by business
        if (selectedBusiness !== 'all') {
            filtered = filtered.filter(inv => inv.businessId === selectedBusiness);
        }

        // Filter by status (if any selected)
        if (selectedStatuses.length > 0) {
            filtered = filtered.filter(inv => selectedStatuses.includes(inv.status));
        }

        // Filter by search query (invoice number or order ID)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(inv =>
                inv.invoiceNumber.toLowerCase().includes(query) ||
                inv.orderId.includes(query)
            );
        }

        return filtered;
    }, [selectedBusiness, searchQuery, selectedStatuses]);

    // Calculate stats from ALL invoices (not filtered)
    const stats = useMemo(() => {
        const total = MOCK_INVOICES.length;
        const paid = MOCK_INVOICES.filter(inv => inv.status === 'paid').length;
        const pending = MOCK_INVOICES.filter(inv => inv.status === 'pending').length;
        const overdue = MOCK_INVOICES.filter(inv => inv.status === 'overdue').length;
        const totalAmount = MOCK_INVOICES.reduce((sum, inv) => sum + inv.amount, 0);

        return { total, paid, pending, overdue, totalAmount };
    }, []); // No dependencies - always calculate from all invoices

    const handleViewDetails = (invoice: typeof MOCK_INVOICES[0]) => {
        setSelectedInvoice(invoice);
    };

    const handleDownloadInvoice = async (invoice: typeof MOCK_INVOICES[0]) => {
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
                    items: invoice.orderItems || []
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`Failed to generate invoice: ${response.status} - ${errorText}`);
            }

            // Log response details
            const contentType = response.headers.get('content-type');
            console.log('Response Content-Type:', contentType);
            console.log('Response Status:', response.status);
            console.log('Response Headers:', Array.from(response.headers.entries()));

            // Check if we actually got a PDF
            if (!contentType?.includes('application/pdf')) {
                const text = await response.text();
                console.error('Expected PDF but got:', contentType, 'Content:', text);
                throw new Error(`Server returned ${contentType} instead of PDF`);
            }

            // Get the PDF blob with explicit type
            const blob = await response.blob();
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });

            console.log('PDF Blob size:', pdfBlob.size, 'Blob type:', pdfBlob.type);

            if (pdfBlob.size === 0) {
                throw new Error('Received empty PDF file');
            }

            // Open PDF in new tab instead of downloading
            const url = window.URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');

            // Cleanup after a delay
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 10000);

            console.log('PDF opened in new tab successfully');
        } catch (error: any) {
            console.error('Error downloading invoice:', error);
            alert(`Failed to download invoice: ${error.message}`);
        } finally {
            setIsDownloading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'overdue': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'paid': return '#d1fae5';
            case 'pending': return '#fef3c7';
            case 'overdue': return '#fee2e2';
            default: return '#f3f4f6';
        }
    };

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

                    <button
                        className={`${styles.statCard} ${selectedStatuses.includes('overdue') ? styles.statCardActive : ''}`}
                        onClick={() => toggleStatusFilter('overdue')}
                    >
                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.overdue}</div>
                            <div className={styles.statLabel}>Overdue</div>
                        </div>
                    </button>

                    <div className={styles.statCard}>
                        <DollarSign size={24} color="#10b981" />
                        <div>
                            <div className={styles.statValue}>৳{stats.totalAmount}</div>
                            <div className={styles.statLabel}>Total Amount</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filtersSection}>
                <div className={styles.filterGroup}>
                    <Filter size={20} />
                    <select
                        value={selectedBusiness}
                        onChange={(e) => setSelectedBusiness(e.target.value)}
                        className={styles.select}
                    >
                        <option value="all">All Businesses</option>
                        {MOCK_BUSINESSES.map(biz => (
                            <option key={biz.id} value={biz.id}>{biz.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.searchBox}>
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
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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
                                    <span className={styles.invoiceValue}>{invoice.items} items</span>
                                </div>

                                <div className={styles.invoiceDivider}></div>

                                <div className={styles.invoiceAmount}>
                                    <span>Total Amount</span>
                                    <span className={styles.amount}>৳{invoice.amount}</span>
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
                    <p>
                        {searchQuery ?
                            'No invoices match your search criteria.' :
                            'No invoices available for the selected business.'
                        }
                    </p>
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
                                <span className={styles.detailValue}>{selectedInvoice.items} items</span>
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
                                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                                </span>
                            </div>

                            <div className={styles.divider}></div>

                            {/* Order Items */}
                            <div className={styles.orderItemsSection}>
                                <h3 className={styles.sectionTitle}>Order Items</h3>
                                <div className={styles.itemsTable}>
                                    <div className={styles.tableHeader}>
                                        <span>Product</span>
                                        <span>Qty</span>
                                        <span>Price</span>
                                        <span>Total</span>
                                    </div>
                                    {selectedInvoice.orderItems?.map((item, index) => (
                                        <div key={index} className={styles.tableRow}>
                                            <span className={styles.productName}>{item.name}</span>
                                            <span className={styles.quantity}>{item.quantity}</span>
                                            <span className={styles.price}>৳{item.price}</span>
                                            <span className={styles.itemTotal}>৳{item.quantity * item.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.divider}></div>

                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>Total Amount:</span>
                                <span className={styles.totalValue}>৳{selectedInvoice.amount}</span>
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
