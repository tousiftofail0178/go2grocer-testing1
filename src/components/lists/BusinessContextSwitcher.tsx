'use client';

import { useEffect, useState } from 'react';
import { getUserBusinesses } from '@/lib/actions/business';

interface Business {
    id: number;
    name: string;
    role: 'OWNER' | 'MANAGER';
}

interface BusinessContextSwitcherProps {
    onSelect: (businessId: number | null) => void;
}

export function BusinessContextSwitcher({ onSelect }: BusinessContextSwitcherProps) {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch businesses on mount
    useEffect(() => {
        async function loadBusinesses() {
            setLoading(true);
            setError(null);

            const result = await getUserBusinesses();

            if (result.success && result.businesses) {
                setBusinesses(result.businesses);

                // Auto-select logic
                if (result.businesses.length === 1) {
                    // Single business - auto-select immediately
                    const businessId = result.businesses[0].id;
                    setSelectedBusinessId(businessId);
                    onSelect(businessId);
                } else if (result.businesses.length === 0) {
                    // No businesses
                    onSelect(null);
                }
                // If multiple businesses, user must select manually
            } else {
                setError(result.error || 'Failed to load businesses');
                onSelect(null);
            }

            setLoading(false);
        }

        loadBusinesses();
    }, [onSelect]);

    // Handle manual selection
    const handleBusinessChange = (businessId: number) => {
        setSelectedBusinessId(businessId);
        onSelect(businessId);
    };

    // Loading state
    if (loading) {
        return (
            <div style={{
                padding: '1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0, color: '#6b7280' }}>Loading businesses...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{
                padding: '1rem',
                backgroundColor: '#fee2e2',
                borderRadius: '8px',
                border: '1px solid #ef4444'
            }}>
                <p style={{ margin: 0, color: '#dc2626' }}>⚠️ {error}</p>
            </div>
        );
    }

    // No businesses found
    if (businesses.length === 0) {
        return (
            <div style={{
                padding: '1.5rem',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #f59e0b',
                textAlign: 'center'
            }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>
                    No Business Account Found
                </h3>
                <p style={{ margin: 0, color: '#78350f', fontSize: '0.875rem' }}>
                    You need to register a business to access shopping lists.
                </p>
            </div>
        );
    }

    // Single business - auto-selected
    if (businesses.length === 1) {
        const business = businesses[0];
        return (
            <div style={{
                padding: '1rem',
                backgroundColor: '#ecfdf5',
                borderRadius: '8px',
                border: '2px solid #10b981'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <p style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            color: '#065f46',
                            fontWeight: 600
                        }}>
                            Ordering for:
                        </p>
                        <h3 style={{
                            margin: '0.25rem 0 0 0',
                            color: '#047857',
                            fontSize: '1.25rem'
                        }}>
                            {business.name}
                        </h3>
                    </div>
                    <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#047857',
                        color: 'white',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        {business.role}
                    </span>
                </div>
            </div>
        );
    }

    // Multiple businesses - show dropdown
    const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

    return (
        <div style={{
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #d1d5db'
        }}>
            <label htmlFor="business-select" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151'
            }}>
                Select Business:
            </label>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <select
                    id="business-select"
                    value={selectedBusinessId || ''}
                    onChange={(e) => handleBusinessChange(Number(e.target.value))}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '2px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#111827',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    <option value="">-- Choose a business --</option>
                    {businesses.map((business) => (
                        <option key={business.id} value={business.id}>
                            {business.name} ({business.role})
                        </option>
                    ))}
                </select>

                {selectedBusiness && (
                    <span style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: selectedBusiness.role === 'OWNER' ? '#3b82f6' : '#8b5cf6',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                    }}>
                        {selectedBusiness.role}
                    </span>
                )}
            </div>

            <p style={{
                margin: '0.75rem 0 0 0',
                fontSize: '0.75rem',
                color: '#6b7280'
            }}>
                {businesses.length} business{businesses.length !== 1 ? 'es' : ''} available
            </p>
        </div>
    );
}
