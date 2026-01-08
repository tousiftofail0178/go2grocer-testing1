'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getListsForBusiness,
    createList,
    deleteList,
    updateListItem,
    removeItemFromList
} from '@/lib/actions/lists';
import { getPreviouslyOrderedProducts } from '@/lib/actions/orders';
import { useCartStore } from '@/store/useCartStore';
import { Save, Trash2, Plus, ShoppingCart, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShoppingListItem {
    id: number;
    quantity: number;
    notes: string | null;
    product: {
        globalProductId: number;
        name: string;
        baseImageUrl: string | null;
        skuBarcode: string | null;
        sellingPrice: string;
        stockQuantity: number | null;
        packSizeLabel: string | null;
    };
}

interface ShoppingList {
    id: number;
    name: string;
    businessId: number;
    createdAt: Date;
    items: ShoppingListItem[];
}

interface ShoppingListManagerProps {
    businessId: number;
}

export function ShoppingListManager({ businessId }: ShoppingListManagerProps) {
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [selectedListId, setSelectedListId] = useState<string | number | null>(null);
    const [historyItems, setHistoryItems] = useState<ShoppingListItem[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [newListName, setNewListName] = useState('');
    const [showNewListForm, setShowNewListForm] = useState(false);

    const { addItem } = useCartStore();

    // Load lists function - wrapped in useCallback to prevent stale closures
    const loadLists = useCallback(async () => {
        console.log('🔍 [ShoppingListManager] Fetching lists for Business ID:', businessId);
        setLoading(true);

        const result = await getListsForBusiness(businessId);
        console.log('📦 [ShoppingListManager] Server Action Result:', result);

        if (result.success && result.lists) {
            console.log('✅ [ShoppingListManager] Setting Lists State to:', result.lists);
            console.log('📊 [ShoppingListManager] Number of lists:', result.lists.length);
            setLists(result.lists as ShoppingList[]);

            // Auto-select 'history' as first option if no list selected
            if (!selectedListId) {
                console.log('🎯 [ShoppingListManager] Auto-selecting Previously Bought');
                setSelectedListId('history');
            }
        } else {
            console.error('❌ [ShoppingListManager] Failed to load lists:', result.error || 'Unknown error');
        }

        setLoading(false);
    }, [businessId, selectedListId]);

    // Load history items when 'history' is selected
    const loadHistoryItems = useCallback(async () => {
        console.log('🕒 [ShoppingListManager] Fetching Previously Bought for Business ID:', businessId);
        setLoading(true);

        const result = await getPreviouslyOrderedProducts(businessId);
        console.log('📦 [ShoppingListManager] History Result:', result);

        if (result.success && result.items) {
            console.log('✅ [ShoppingListManager] Setting History Items:', result.items.length);
            setHistoryItems(result.items);
        } else {
            console.error('❌ [ShoppingListManager] Failed to load history:', result.error || 'Unknown error');
            setHistoryItems([]);
        }

        setLoading(false);
    }, [businessId]);

    // Load lists when businessId changes
    useEffect(() => {
        loadLists();
    }, [loadLists]);

    // Load history items when 'history' is selected
    useEffect(() => {
        if (selectedListId === 'history') {
            loadHistoryItems();
        }
    }, [selectedListId, loadHistoryItems]);

    // Reset quantities to 0 when selected list changes (order form behavior)
    useEffect(() => {
        if (selectedListId) {
            setQuantities({});
        }
    }, [selectedListId]);

    async function handleCreateList(e: React.FormEvent) {
        e.preventDefault();
        if (!newListName.trim()) return;

        const result = await createList(businessId, newListName.trim());

        if (result.success) {
            setNewListName('');
            setShowNewListForm(false);
            await loadLists();
            if (result.list) {
                setSelectedListId(result.list.id);
            }
        } else {
            toast.error(result.error || 'Failed to create list');
        }
    }

    async function handleDeleteList(listId: number) {
        if (!confirm('Are you sure you want to delete this list?')) return;

        const result = await deleteList(listId);

        if (result.success) {
            if (selectedListId === listId) {
                setSelectedListId(null);
            }
            await loadLists();
        } else {
            toast.error(result.error || 'Failed to delete list');
        }
    }

    async function handleUpdateQuantity(itemId: number) {
        const newQuantity = quantities[itemId];
        if (!newQuantity || newQuantity <= 0) {
            toast.error('Quantity must be greater than 0');
            return;
        }

        const result = await updateListItem(itemId, { quantity: newQuantity });

        if (result.success) {
            await loadLists();
        } else {
            toast.error(result.error || 'Failed to update item');
        }
    }

    async function handleRemoveItem(itemId: number) {
        if (!confirm('Remove this item from the list?')) return;

        const result = await removeItemFromList(itemId);

        if (result.success) {
            await loadLists();
        } else {
            toast.error(result.error || 'Failed to remove item');
        }
    }

    function handleAddSelectedToCart() {
        const currentListItems = selectedListId === 'history'
            ? historyItems
            : lists.find(l => l.id === selectedListId)?.items || [];

        if (!currentListItems) return;

        // Filter items with quantity > 0 from user input ONLY (not database defaults)
        const itemsToAdd = currentListItems.filter(item => {
            const qty = quantities[item.id] || 0;
            return qty > 0;
        });

        if (itemsToAdd.length === 0) {
            toast.error('Please enter quantities for items you want to order');
            return;
        }

        // Add each item to cart with the specified quantity
        let addedCount = 0;
        itemsToAdd.forEach(item => {
            const qty = quantities[item.id] || 0;

            // Add item to cart qty times
            for (let i = 0; i < qty; i++) {
                addItem({
                    id: String(item.product.globalProductId),
                    name: item.product.name,
                    price: Number(item.product.sellingPrice),
                    image: item.product.baseImageUrl || '/images/placeholder.jpg',
                    weight: item.product.packSizeLabel || 'N/A',
                    unit: item.product.packSizeLabel || '',
                    rating: 5,
                    category: 'Product',
                    inStock: (item.product.stockQuantity || 0) > 0,
                });
            }
            addedCount++;
        });

        toast.success(`✓ ${addedCount} item${addedCount !== 1 ? 's' : ''} added to cart successfully!`);
    }

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            backgroundColor: '#ffffff'
        }}>
            {/* LEFT SIDEBAR - 25% */}
            <div style={{
                width: '25%',
                borderRight: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#ffffff'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#111827'
                    }}>
                        My Lists
                    </h3>
                </div>

                {/* Lists Area */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#9ca3af'
                        }}>
                            Loading...
                        </div>
                    ) : (
                        <>
                            {/* Previously Bought Smart List */}
                            <div
                                onClick={() => setSelectedListId('history')}
                                style={{
                                    padding: '0.75rem 1rem',
                                    cursor: 'pointer',
                                    backgroundColor: selectedListId === 'history' ? '#f0fdf4' : 'transparent',
                                    borderLeft: selectedListId === 'history' ? '3px solid #10b981' : '3px solid transparent',
                                    borderBottom: '1px solid #e5e7eb',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={16} color="#10b981" />
                                        <div>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '0.875rem',
                                                fontWeight: selectedListId === 'history' ? 600 : 500,
                                                color: '#111827'
                                            }}>
                                                Previously Bought
                                            </p>
                                            <p style={{
                                                margin: '0.25rem 0 0 0',
                                                fontSize: '0.75rem',
                                                color: '#6b7280'
                                            }}>
                                                {historyItems.length} items
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{
                                height: '2px',
                                backgroundColor: '#e5e7eb',
                                margin: '0.5rem 0'
                            }} />

                            {/* User's Custom Lists */}
                            {lists.map(list => (
                                <div
                                    key={list.id}
                                    onClick={() => setSelectedListId(list.id)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        cursor: 'pointer',
                                        backgroundColor: selectedListId === list.id ? '#e0f2fe' : 'transparent',
                                        borderLeft: selectedListId === list.id ? '3px solid #0284c7' : '3px solid transparent',
                                        borderBottom: '1px solid #e5e7eb',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '0.875rem',
                                                fontWeight: selectedListId === list.id ? 600 : 500,
                                                color: '#111827'
                                            }}>
                                                {list.name}
                                            </p>
                                            <p style={{
                                                margin: '0.25rem 0 0 0',
                                                fontSize: '0.75rem',
                                                color: '#6b7280'
                                            }}>
                                                {list.items.length} items
                                            </p>
                                        </div>
                                        {selectedListId === list.id && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteList(list.id);
                                                }}
                                                style={{
                                                    padding: '0.25rem',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#ef4444'
                                                }}
                                                title="Delete list"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* New List Button/Form */}
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: '#ffffff'
                }}>
                    {!showNewListForm ? (
                        <button
                            onClick={() => setShowNewListForm(true)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Plus size={16} />
                            New List
                        </button>
                    ) : (
                        <form onSubmit={handleCreateList}>
                            <input
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="List name..."
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    marginBottom: '0.5rem'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewListForm(false);
                                        setNewListName('');
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        backgroundColor: '#e5e7eb',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* MAIN AREA - 75% */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {(() => {
                    // Determine current list items based on selection
                    const currentListItems = selectedListId === 'history'
                        ? historyItems
                        : lists.find(l => l.id === selectedListId)?.items || [];

                    const currentListName = selectedListId === 'history'
                        ? 'Previously Bought'
                        : lists.find(l => l.id === selectedListId)?.name || '';

                    if (!selectedListId || (currentListItems.length === 0 && selectedListId !== 'history')) {
                        return (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#9ca3af'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '1.125rem', margin: 0 }}>
                                        {selectedListId ? 'This list is empty' : 'Select a list or create a new one'}
                                    </p>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <>
                            {/* Header with Bulk Actions */}
                            <div style={{
                                padding: '1rem',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#ffffff'
                            }}>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                                    {currentListName}
                                </h2>
                                <button
                                    onClick={handleAddSelectedToCart}
                                    disabled={currentListItems.length === 0}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: currentListItems.length > 0 ? '#10b981' : '#d1d5db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: currentListItems.length > 0 ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ShoppingCart size={18} />
                                    Add Selected to Cart
                                </button>
                            </div>

                            {/* Dense Table */}
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {currentListItems.length === 0 ? (
                                    <div style={{
                                        padding: '3rem',
                                        textAlign: 'center',
                                        color: '#9ca3af'
                                    }}>
                                        <p>No items in this list yet.</p>
                                    </div>
                                ) : (
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse'
                                    }}>
                                        <thead>
                                            <tr style={{
                                                backgroundColor: '#f9fafb',
                                                borderBottom: '1px solid #e5e7eb'
                                            }}>
                                                <th style={{
                                                    padding: '0.75rem 1rem',
                                                    textAlign: 'left',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: '#6b7280',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    width: '80px'
                                                }}>
                                                    Image
                                                </th>
                                                <th style={{
                                                    padding: '0.75rem 1rem',
                                                    textAlign: 'left',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: '#6b7280',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    Product
                                                </th>
                                                <th style={{
                                                    padding: '0.75rem 1rem',
                                                    textAlign: 'left',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: '#6b7280',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    width: '120px'
                                                }}>
                                                    SKU
                                                </th>
                                                <th style={{
                                                    padding: '0.75rem 1rem',
                                                    textAlign: 'right',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: '#6b7280',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    width: '100px'
                                                }}>
                                                    Price
                                                </th>
                                                <th style={{
                                                    padding: '0.75rem 1rem',
                                                    textAlign: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: '#6b7280',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    width: '100px'
                                                }}>
                                                    Stock
                                                </th>
                                                <th style={{
                                                    padding: '0.75rem 1rem',
                                                    textAlign: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: '#6b7280',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    width: '120px'
                                                }}>
                                                    Quantity
                                                </th>
                                                <th style={{
                                                    padding: '0.75rem 1rem',
                                                    textAlign: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: '#6b7280',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    width: '120px'
                                                }}>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentListItems.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    style={{
                                                        borderBottom: '1px solid #e5e7eb',
                                                        transition: 'background-color 0.15s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    {/* Image Column */}
                                                    <td style={{
                                                        padding: '0.75rem 1rem'
                                                    }}>
                                                        <img
                                                            src={item.product.baseImageUrl || '/images/placeholder.jpg'}
                                                            alt={item.product.name}
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                border: '1px solid #e5e7eb'
                                                            }}
                                                        />
                                                    </td>

                                                    {/* Product Name Column */}
                                                    <td style={{
                                                        padding: '0.75rem 1rem'
                                                    }}>
                                                        <div>
                                                            <p style={{
                                                                margin: 0,
                                                                fontSize: '0.875rem',
                                                                fontWeight: 500,
                                                                color: '#111827'
                                                            }}>
                                                                {item.product.name}
                                                            </p>
                                                            <p style={{
                                                                margin: '0.25rem 0 0 0',
                                                                fontSize: '0.75rem',
                                                                color: '#6b7280'
                                                            }}>
                                                                {item.product.packSizeLabel || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* SKU Column */}
                                                    <td style={{
                                                        padding: '0.75rem 1rem',
                                                        fontSize: '0.75rem',
                                                        color: '#6b7280'
                                                    }}>
                                                        {item.product.skuBarcode || '-'}
                                                    </td>

                                                    {/* Price Column */}
                                                    <td style={{
                                                        padding: '0.75rem 1rem',
                                                        textAlign: 'right',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 600,
                                                        color: '#111827'
                                                    }}>
                                                        €{Number(item.product.sellingPrice).toFixed(2)}
                                                    </td>

                                                    {/* Stock Column */}
                                                    <td style={{
                                                        padding: '0.75rem 1rem',
                                                        textAlign: 'center'
                                                    }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                            backgroundColor: (item.product.stockQuantity || 0) > 0 ? '#d1fae5' : '#fee2e2',
                                                            color: (item.product.stockQuantity || 0) > 0 ? '#065f46' : '#991b1b'
                                                        }}>
                                                            {(item.product.stockQuantity || 0) > 0 ? 'In Stock' : 'Out'}
                                                        </span>
                                                    </td>

                                                    {/* Quantity Column */}
                                                    <td style={{
                                                        padding: '0.75rem',
                                                        textAlign: 'center'
                                                    }}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            value={quantities[item.id] || ''}
                                                            onChange={(e) => setQuantities({
                                                                ...quantities,
                                                                [item.id]: Number(e.target.value)
                                                            })}
                                                            style={{
                                                                width: '80px',
                                                                padding: '0.5rem',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                textAlign: 'center',
                                                                fontSize: '0.875rem'
                                                            }}
                                                        />
                                                    </td>

                                                    {/* Actions Column */}
                                                    <td style={{
                                                        padding: '0.75rem',
                                                        textAlign: 'center'
                                                    }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                            {/* Save Icon - Hidden for history*/}
                                                            {selectedListId !== 'history' && (
                                                                <button
                                                                    onClick={() => handleUpdateQuantity(item.id)}
                                                                    style={{
                                                                        padding: '0.35rem',
                                                                        backgroundColor: 'transparent',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        color: '#3b82f6'
                                                                    }}
                                                                    title="Save quantity"
                                                                >
                                                                    <Save size={16} />
                                                                </button>
                                                            )}
                                                            {/* Delete Icon - Hidden for history */}
                                                            {selectedListId !== 'history' && (
                                                                <button
                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                    style={{
                                                                        padding: '0.35rem',
                                                                        backgroundColor: 'transparent',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        color: '#ef4444'
                                                                    }}
                                                                    title="Remove from list"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    );
                })()}
            </div>
        </div>
    );
}
