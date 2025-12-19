"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import {
    Search,
    Filter,
    ArrowUpDown,
    MoreHorizontal,
    Plus,
    FileDown,
    MapPin,
    PenLine
} from 'lucide-react';

interface Order {
    id: string;
    date: string;
    customer: string;
    channel: string;
    total: string;
    payment: string;
    fulfillment: string;
    items: string;
    deliveryStatus: string;
    deliveryMethod: string;
}

export default function OrdersPage() {
    const [selectedTab, setSelectedTab] = useState('All');
    const [showExportModal, setShowExportModal] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'asc' | 'desc' } | null>(null);

    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [exportOption, setExportOption] = useState('current');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/admin/orders');
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const tabs = ['All', 'Unfulfilled', 'Unpaid', 'Open', 'Archived'];

    // Filter & Sort Logic
    const filteredOrders = React.useMemo(() => {
        let result = [...orders];

        // 1. Filter by Tab
        if (selectedTab !== 'All') {
            if (selectedTab === 'Unfulfilled') {
                result = result.filter(o => o.fulfillment !== 'Fulfilled');
            } else if (selectedTab === 'Unpaid') {
                result = result.filter(o => o.payment === 'Pending' || o.payment === 'Unpaid');
            } else if (selectedTab === 'Open') {
                result = result.filter(o => o.fulfillment !== 'Fulfilled' && (o.payment === 'Pending' || o.payment === 'Unpaid'));
            } else if (selectedTab === 'Archived') {
                result = result.filter(o => o.fulfillment === 'Fulfilled' && o.payment === 'Paid');
            }
        }

        // 2. Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.id.toLowerCase().includes(query) ||
                o.customer.toLowerCase().includes(query)
            );
        }

        // 3. Sort
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        } else {
            // Default sort by Date Descending (Newest first)
            result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        return result;
    }, [orders, selectedTab, searchQuery, sortConfig]);

    const handleSort = (key: keyof Order) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Selection Logic
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedOrders(filteredOrders.map(o => o.id));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleSelectOrder = (id: string) => {
        setSelectedOrders(prev => {
            if (prev.includes(id)) {
                return prev.filter(oId => oId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleExport = () => {
        let ordersToExport = [];

        if (exportOption === 'selected') {
            ordersToExport = orders.filter(o => selectedOrders.includes(o.id));
        } else if (exportOption === 'all') {
            ordersToExport = orders;
        } else {
            // Default to current page / filtered view
            ordersToExport = filteredOrders;
        }

        if (ordersToExport.length === 0) {
            alert("No orders to export.");
            return;
        }

        // Simple CSV Export
        const headers = ['Order', 'Date', 'Customer', 'Total', 'Payment', 'Fulfillment'];
        const rows = ordersToExport.map(o => [
            o.id,
            o.date,
            o.customer,
            o.total,
            o.payment,
            o.fulfillment
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "orders_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportModal(false);
    };

    return (
        <div>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Orders</h1>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={styles.secondaryBtn}
                        onClick={() => setShowExportModal(true)}
                    >
                        Export
                    </button>
                    <button className={styles.secondaryBtn}>
                        More actions
                    </button>
                    <Link href="/admin/orders/create">
                        <button className={styles.primaryBtn}>Create order</button>
                    </Link>
                </div>
            </div>

            <div className={styles.contentContainer}>

                <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>

                    {/* Tabs */}
                    <div className={styles.tabs} style={{ padding: '0.5rem 1rem 0', borderBottom: '1px solid #e1e3e5', background: '#fcfcfc' }}>
                        {tabs.map(tab => (
                            <div
                                key={tab}
                                className={`${styles.tab} ${selectedTab === tab ? styles.active : ''}`}
                                onClick={() => setSelectedTab(tab)}
                            >
                                {tab}
                            </div>
                        ))}
                        <div className={styles.tab} style={{ padding: '0.75rem 0.5rem' }}><Plus size={16} /></div>
                    </div>

                    {/* Filter Filters */}
                    <div className={styles.filterBar}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#999' }} />
                            <input
                                type="text"
                                placeholder="Filter orders"
                                className={styles.inputField}
                                style={{ paddingLeft: '2rem', marginTop: 0 }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className={styles.filterBtn}><Filter size={16} /></button>
                        <button className={styles.filterBtn} onClick={() => handleSort('date')} title="Sort by Date"><ArrowUpDown size={16} /></button>
                    </div>

                    {/* Table */}
                    <div className={styles.tableContainer}>
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                                Loading orders...
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={{ width: 40 }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                                            />
                                        </th>
                                        <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>Order</th>
                                        <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>Date</th>
                                        <th onClick={() => handleSort('customer')} style={{ cursor: 'pointer' }}>Customer</th>
                                        <th>Channel</th>
                                        <th onClick={() => handleSort('total')} style={{ cursor: 'pointer' }}>Total</th>
                                        <th>Payment status</th>
                                        <th>Fulfillment status</th>
                                        <th>Items</th>
                                        <th>Delivery status</th>
                                        <th>Delivery method</th>
                                        <th>Tags</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={12} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map(order => (
                                            <tr key={order.id} className={selectedOrders.includes(order.id) ? styles.selectedRow : ''} style={{ backgroundColor: selectedOrders.includes(order.id) ? '#f4f6f8' : 'transparent' }}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOrders.includes(order.id)}
                                                        onChange={() => handleSelectOrder(order.id)}
                                                    />
                                                </td>
                                                <td style={{ fontWeight: 600 }}>
                                                    <Link href={`/admin/orders/${order.id}`} style={{ color: '#007ace', textDecoration: 'none' }}>
                                                        {order.id}
                                                    </Link>
                                                </td>
                                                <td>{order.date}</td>
                                                <td style={{ color: '#666' }}>{order.customer}</td>
                                                <td>{order.channel}</td>
                                                <td>{order.total}</td>
                                                <td><span className={`${styles.badge} ${styles.grey}`}>{order.payment}</span></td>
                                                <td><span className={`${styles.badge} ${order.fulfillment === 'Processing' ? styles.warning : styles.success}`}>{order.fulfillment}</span></td>
                                                <td>{order.items}</td>
                                                <td>{order.deliveryStatus}</td>
                                                <td>{order.deliveryMethod}</td>
                                                <td></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #eee' }}>
                        Learn more about orders
                    </div>
                </div>

            </div>

            {/* Export Modal Overlay */}
            {showExportModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className={styles.card} style={{ width: 400, padding: 0 }}>
                        <div className={styles.formHeader}>
                            Export orders
                            <button onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div className={styles.formContent}>
                            <div style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>Export</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="export"
                                        checked={exportOption === 'current'}
                                        onChange={() => setExportOption('current')}
                                    />
                                    Current page
                                </label>
                                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="export"
                                        checked={exportOption === 'all'}
                                        onChange={() => setExportOption('all')}
                                    />
                                    All orders
                                </label>
                                <label style={{
                                    display: 'flex', gap: '0.5rem', fontSize: '0.9rem',
                                    opacity: selectedOrders.length > 0 ? 1 : 0.5,
                                    cursor: selectedOrders.length > 0 ? 'pointer' : 'not-allowed'
                                }}>
                                    <input
                                        type="radio"
                                        name="export"
                                        disabled={selectedOrders.length === 0}
                                        checked={exportOption === 'selected'}
                                        onChange={() => setExportOption('selected')}
                                    />
                                    Selected: {selectedOrders.length} orders
                                </label>
                                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.5 }}>
                                    <input type="radio" name="export" disabled />
                                    Orders matching search (Upcoming)
                                </label>
                            </div>

                            <div style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>Export as</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}><input type="radio" name="format" defaultChecked /> CSV for Excel, Numbers, or other spreadsheet programs</label>
                                <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}><input type="radio" name="format" /> Plain CSV file</label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                <button className={styles.secondaryBtn} onClick={() => setShowExportModal(false)}>Cancel</button>
                                <button className={styles.primaryBtn} onClick={handleExport}>Export orders</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
