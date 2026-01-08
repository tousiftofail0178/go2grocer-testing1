"use client";

import { useState } from "react";
import { BusinessContextSwitcher } from "@/components/lists/BusinessContextSwitcher";
import { ShoppingListManager } from "@/components/lists/ShoppingListManager";

export default function ListsPage() {
    // 1. State to hold the "Active Business"
    const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);

    return (
        <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem'
        }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '1.875rem',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '0.5rem'
                }}>
                    Order Lists
                </h1>
                <p style={{ color: '#6b7280' }}>
                    Manage your recurring orders and favorite items.
                </p>
            </div>

            {/* 2. The Switcher controls the ID */}
            <div style={{ marginBottom: '2rem' }}>
                <BusinessContextSwitcher onSelect={setSelectedBusinessId} />
            </div>

            {/* 3. The Manager reacts to the ID */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #f3f4f6',
                minHeight: '500px'
            }}>
                {selectedBusinessId ? (
                    <ShoppingListManager businessId={selectedBusinessId} />
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        padding: '5rem 0',
                        color: '#9ca3af'
                    }}>
                        <svg
                            style={{ width: '4rem', height: '4rem', marginBottom: '1rem', opacity: 0.2 }}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 001-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p>Select a business above to view its lists.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
