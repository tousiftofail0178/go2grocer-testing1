"use client";

import React from 'react';
import styles from '../admin.module.css';
import { Calendar, RefreshCw, Maximize2, PenLine } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div>
            <div className={styles.pageHeader} style={{ paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h1 className={styles.pageTitle}>Analytics</h1>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Last refreshed: 10:10 PM</span>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={styles.navLink} style={{ background: '#fff', border: '1px solid #dcdcdc' }}>
                            <Calendar size={14} /> Today
                        </button>
                        <button className={styles.navLink} style={{ background: '#fff', border: '1px solid #dcdcdc' }}>
                            <Calendar size={14} /> Dec 17, 2025
                        </button>
                        <button className={styles.navLink} style={{ background: '#fff', border: '1px solid #dcdcdc' }}>
                            Tk. BDT
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ padding: '0.4rem', background: '#fff', border: '1px solid #dcdcdc', borderRadius: 4 }}><RefreshCw size={14} /></button>
                        <button style={{ padding: '0.4rem', background: '#fff', border: '1px solid #dcdcdc', borderRadius: 4 }}><Maximize2 size={14} /></button>
                        <button style={{ padding: '0.4rem', background: '#fff', border: '1px solid #dcdcdc', borderRadius: 4 }}><PenLine size={14} /></button>
                        <button style={{ padding: '0.4rem 0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.85rem', fontWeight: 600 }}>New exploration</button>
                    </div>
                </div>
            </div>

            <div className={styles.contentContainer}>

                {/* Top Row Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <SummaryCard title="Gross sales" value="৳0.00" />
                    <SummaryCard title="Returning customer rate" value="0%" />
                    <SummaryCard title="Orders fulfilled" value="0" />
                    <SummaryCard title="Orders" value="0" />
                </div>

                {/* Main Graph & Sidebar Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

                    {/* Main Graph Card */}
                    <div className={styles.card} style={{ minHeight: '350px' }}>
                        <div className={styles.cardTitle}>Total sales over time</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>৳0 –</div>

                        {/* Fake Chart Lines */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid #eee', paddingLeft: '0.5rem', fontSize: '0.7rem', color: '#999', position: 'relative' }}>
                            <div style={{ borderBottom: '1px dashed #eee', width: '100%' }}>৳10</div>
                            <div style={{ borderBottom: '1px dashed #eee', width: '100%' }}>৳5</div>
                            <div style={{ borderBottom: '1px dashed #eee', width: '100%' }}>৳0</div>

                            {/* Blue Line */}
                            <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, height: 2, background: '#00a3e0' }}></div>
                            <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, borderTop: '2px dotted #9ec5e8' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#999', marginTop: '0.5rem' }}>
                            <span>12 AM</span><span>4 AM</span><span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span><span>12 AM</span>
                        </div>
                    </div>

                    {/* Breakdown List */}
                    <div className={styles.card}>
                        <div className={styles.cardTitle} style={{ marginBottom: '1rem' }}>Total sales breakdown</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <BreakdownRow label="Gross sales" value="৳0.00" />
                            <BreakdownRow label="Discounts" value="৳0.00" />
                            <BreakdownRow label="Returns" value="৳0.00" />
                            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0.25rem 0' }} />
                            <BreakdownRow label="Net sales" value="৳0.00" />
                            <BreakdownRow label="Shipping charges" value="৳0.00" />
                            <BreakdownRow label="Return fees" value="৳0.00" />
                            <BreakdownRow label="Taxes" value="৳0.00" />
                            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0.25rem 0' }} />
                            <BreakdownRow label="Total sales" value="৳0.00" bold />
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <EmptyGraphCard title="Total sales by sales channel" />
                    <EmptyGraphCard title="Average order value over time" value="৳0 –" />
                    <EmptyGraphCard title="Total sales by product" />
                </div>

            </div>
        </div>
    );
}

function SummaryCard({ title, value }: { title: string, value: string }) {
    return (
        <div className={styles.card} style={{ padding: '1rem' }}>
            <div className={styles.cardTitle}>{title}</div>
            <div className={styles.cardValue} style={{ fontSize: '1.25rem' }}>{value} <span style={{ color: '#ccc', fontWeight: 400 }}>—</span></div>
            <div style={{ height: 4, width: '100%', background: '#f0f0f0', marginTop: '1rem', borderRadius: 2 }}>
                <div style={{ width: '0%', height: '100%', background: '#00a3e0' }}></div>
            </div>
        </div>
    );
}

function BreakdownRow({ label, value, bold }: { label: string, value: string, bold?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: bold ? 600 : 400 }}>
            <span style={label === 'Total sales' || label === 'Net sales' ? { color: '#333' } : { color: '#005bd3' }}>{label}</span>
            <span>{value} <span style={{ color: '#ccc' }}>—</span></span>
        </div>
    );
}

function EmptyGraphCard({ title, value }: { title: string, value?: string }) {
    return (
        <div className={styles.card} style={{ minHeight: '250px' }}>
            <div className={styles.cardTitle}>{title}</div>
            {value && <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{value}</div>}

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#666' }}>
                No data for this date range
            </div>
        </div>
    );
}
