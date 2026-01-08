'use client';

import { useState, useEffect } from 'react';
import { getUserBusinesses } from '@/lib/actions/business';
import { getListsForBusiness, createList, addItemToList } from '@/lib/actions/lists';
import { X, Plus, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SaveToListModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: number;
}

interface Business {
    id: number;
    name: string;
    role: 'OWNER' | 'MANAGER';
}

interface ShoppingList {
    id: number;
    name: string;
    businessId: number;
}

export function SaveToListModal({ isOpen, onClose, productId }: SaveToListModalProps) {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [selectedListIds, setSelectedListIds] = useState<Set<number>>(new Set());
    const [newListName, setNewListName] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showNewListInput, setShowNewListInput] = useState(false);

    // Fetch businesses on mount
    useEffect(() => {
        if (isOpen) {
            loadBusinesses();
        }
    }, [isOpen]);

    // Fetch lists when business changes
    useEffect(() => {
        if (selectedBusinessId) {
            loadLists();
        }
    }, [selectedBusinessId]);

    async function loadBusinesses() {
        setLoading(true);
        const result = await getUserBusinesses();

        if (result.success && result.businesses) {
            setBusinesses(result.businesses);

            // Auto-select if single business
            if (result.businesses.length === 1) {
                setSelectedBusinessId(result.businesses[0].id);
            }
        }

        setLoading(false);
    }

    async function loadLists() {
        if (!selectedBusinessId) return;

        setLoading(true);
        const result = await getListsForBusiness(selectedBusinessId);

        if (result.success && result.lists) {
            setLists(result.lists as ShoppingList[]);
        }

        setLoading(false);
    }

    async function handleCreateNewList() {
        if (!selectedBusinessId || !newListName.trim()) return;

        const result = await createList(selectedBusinessId, newListName);

        if (result.success) {
            setNewListName('');
            setShowNewListInput(false);
            await loadLists();
            toast.success('List created successfully');
        } else {
            toast.error(result.error || 'Failed to create list');
        }
    }

    async function handleSave() {
        if (selectedListIds.size === 0) {
            toast.error('Please select at least one list'); // react-hot-toast doesn't have warning by default
            return;
        }

        setSaving(true);

        try {
            const promises = Array.from(selectedListIds).map(listId =>
                addItemToList(listId, productId, 1)
            );

            const results = await Promise.all(promises);

            const allSuccess = results.every(r => r.success);

            if (allSuccess) {
                toast.success(`Product added to ${selectedListIds.size} list(s) successfully!`);
                handleClose();
            } else {
                toast.error('Some items failed to add. Please try again.');
            }
        } catch (error) {
            toast.error('Failed to add to lists');
        } finally {
            setSaving(false);
        }
    }

    function handleClose() {
        setSelectedListIds(new Set());
        setNewListName('');
        setShowNewListInput(false);
        onClose();
    }

    function toggleListSelection(listId: number) {
        const newSelection = new Set(selectedListIds);
        if (newSelection.has(listId)) {
            newSelection.delete(listId);
        } else {
            newSelection.add(listId);
        }
        setSelectedListIds(newSelection);
    }

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}
            >
                {/* Modal */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: '#111827'
                        }}>
                            Add to List
                        </h2>
                        <button
                            onClick={handleClose}
                            style={{
                                padding: '0.5rem',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6b7280',
                                borderRadius: '4px'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div style={{
                        padding: '1.5rem',
                        flex: 1,
                        overflowY: 'auto'
                    }}>
                        {/* Business Selection (if multiple) */}
                        {businesses.length > 1 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>
                                    Select Business:
                                </label>
                                <select
                                    value={selectedBusinessId || ''}
                                    onChange={(e) => setSelectedBusinessId(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">-- Select a business --</option>
                                    {businesses.map(biz => (
                                        <option key={biz.id} value={biz.id}>
                                            {biz.name} ({biz.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Single Business Info */}
                        {businesses.length === 1 && (
                            <div style={{
                                marginBottom: '1.5rem',
                                padding: '0.75rem',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                color: '#374151'
                            }}>
                                Adding to lists for: <strong>{businesses[0].name}</strong>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2rem',
                                color: '#6b7280'
                            }}>
                                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ marginLeft: '0.5rem' }}>Loading lists...</span>
                            </div>
                        )}

                        {/* Lists Checkboxes */}
                        {!loading && selectedBusinessId && (
                            <>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: '#374151',
                                        marginBottom: '0.75rem'
                                    }}>
                                        Select Lists:
                                    </label>

                                    {lists.length === 0 ? (
                                        <div style={{
                                            padding: '2rem',
                                            textAlign: 'center',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '6px',
                                            color: '#6b7280',
                                            fontSize: '0.875rem'
                                        }}>
                                            No lists yet. Create one below!
                                        </div>
                                    ) : (
                                        <div style={{
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            overflow: 'hidden'
                                        }}>
                                            {lists.map(list => (
                                                <label
                                                    key={list.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '0.75rem',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #e5e7eb',
                                                        backgroundColor: selectedListIds.has(list.id) ? '#eff6ff' : 'white',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedListIds.has(list.id)}
                                                        onChange={() => toggleListSelection(list.id)}
                                                        style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            marginRight: '0.75rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                    <span style={{
                                                        fontSize: '0.875rem',
                                                        color: '#111827',
                                                        fontWeight: selectedListIds.has(list.id) ? 600 : 400
                                                    }}>
                                                        {list.name}
                                                    </span>
                                                    {selectedListIds.has(list.id) && (
                                                        <Check
                                                            size={16}
                                                            style={{
                                                                marginLeft: 'auto',
                                                                color: '#3b82f6'
                                                            }}
                                                        />
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Inline New List Creation */}
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    border: '1px dashed #d1d5db'
                                }}>
                                    {!showNewListInput ? (
                                        <button
                                            onClick={() => setShowNewListInput(true)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                width: '100%',
                                                padding: '0.5rem',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#3b82f6',
                                                fontSize: '0.875rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            <Plus size={16} />
                                            Create New List
                                        </button>
                                    ) : (
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: '#374151',
                                                marginBottom: '0.5rem'
                                            }}>
                                                New List Name:
                                            </label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    value={newListName}
                                                    onChange={(e) => setNewListName(e.target.value)}
                                                    placeholder="e.g., Weekly Restock"
                                                    autoFocus
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.5rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '4px',
                                                        fontSize: '0.875rem'
                                                    }}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleCreateNewList();
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={handleCreateNewList}
                                                    disabled={!newListName.trim()}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        backgroundColor: newListName.trim() ? '#10b981' : '#d1d5db',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 600,
                                                        cursor: newListName.trim() ? 'pointer' : 'not-allowed'
                                                    }}
                                                >
                                                    Create
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowNewListInput(false);
                                                        setNewListName('');
                                                    }}
                                                    style={{
                                                        padding: '0.5rem',
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#6b7280'
                                                    }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '1.5rem',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            onClick={handleClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={selectedListIds.size === 0 || saving}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: selectedListIds.size > 0 && !saving ? '#3b82f6' : '#d1d5db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: selectedListIds.size > 0 && !saving ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                            {saving ? 'Saving...' : `Save to ${selectedListIds.size} List${selectedListIds.size !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}
