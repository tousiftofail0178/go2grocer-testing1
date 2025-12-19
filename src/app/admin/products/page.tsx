"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Loader2, Package, Search } from 'lucide-react';
import { getProducts, deleteProduct } from '@/app/actions/products';
import styles from '../admin.module.css';

export default function AdminProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setIsLoading(true);
        const res = await getProducts();
        if (res.success && res.products) {
            setProducts(res.products);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        setIsDeleting(id);
        const res = await deleteProduct(id);
        if (res.success) {
            setProducts(products.filter(p => p.id !== id));
        } else {
            alert('Failed to delete product');
        }
        setIsDeleting(null);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
        );
    }

    return (
        <div>
            <div className={styles.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className={styles.pageTitle}>Products</h1>
                    <Link href="/admin/products/new">
                        <button className={styles.primaryBtn}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={16} />
                                Add Product
                            </div>
                        </button>
                    </Link>
                </div>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.card}>
                    {/* Filter Bar */}
                    <div className={styles.filterBar}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                            <input
                                type="text"
                                placeholder="Filter products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.inputField}
                                style={{ paddingLeft: '2rem', marginTop: 0 }}
                            />
                        </div>
                        <button className={styles.filterBtn}>
                            Status
                        </button>
                        <button className={styles.filterBtn}>
                            Category
                        </button>
                    </div>

                    {/* Table */}
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#6d7175' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: 48, height: 48, background: '#f1f2f4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Package size={24} color="#999" />
                                                </div>
                                                <p>No products found matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, background: '#f4f4f4', border: '1px solid #eee' }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: 40, height: 40, background: '#eee', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: 500, color: '#303030' }}>{product.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#6d7175' }}>{product.weight}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className={`${styles.badge} ${styles.grey}`}>{product.category}</span></td>
                                            <td style={{ fontWeight: 500 }}>Tk {product.price}</td>
                                            <td>
                                                {product.inStock ? (
                                                    <span className={`${styles.badge} ${styles.success}`}>
                                                        In Stock
                                                    </span>
                                                ) : (
                                                    <span className={`${styles.badge} ${styles.warning}`} style={{ background: '#ffebeb', color: '#c00' }}>
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        <button className={styles.secondaryBtn} style={{ padding: '0.4rem', lineHeight: 0 }}>
                                                            <Edit size={16} color="#444" />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className={styles.secondaryBtn}
                                                        style={{ padding: '0.4rem', lineHeight: 0, borderColor: '#ffccc7', color: '#d00' }}
                                                        title="Delete"
                                                        disabled={isDeleting === product.id}
                                                    >
                                                        {isDeleting === product.id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Placeholder */}
                    <div style={{ padding: '1rem', borderTop: '1px solid #e1e3e5', display: 'flex', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#6d7175' }}>Showing {filteredProducts.length} products</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
