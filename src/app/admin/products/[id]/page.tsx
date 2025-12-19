"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getProduct, updateProduct } from '@/app/actions/products';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        originalPrice: '',
        weight: '',
        image: '',
        category: 'Fresh Vegetables',
        inStock: true,
        isNew: false,
        discount: ''
    });

    useEffect(() => {
        const load = async () => {
            const res = await getProduct(id);
            if (res.success && res.product) {
                const p = res.product;
                setFormData({
                    name: p.name,
                    price: p.price?.toString() || '',
                    originalPrice: p.originalPrice?.toString() || '',
                    weight: p.weight,
                    image: p.image,
                    category: p.category,
                    inStock: p.inStock ?? true,
                    isNew: p.isNew ?? false,
                    discount: p.discount?.toString() || ''
                });
            } else {
                alert('Product not found');
                router.push('/admin/products');
            }
            setIsLoading(false);
        };
        load();
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await updateProduct(id, formData);
            if (res.success) {
                router.push('/admin/products');
            } else {
                alert('Failed to update product: ' + res.error);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/products" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Products
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product: {formData.name}</h1>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <Input
                                placeholder="e.g. Fresh Potato"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (Tk)</label>
                            <Input
                                type="number"
                                placeholder="0"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Original Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (Tk)</label>
                            <Input
                                type="number"
                                placeholder="0"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Weight */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight / Unit</label>
                            <Input
                                placeholder="e.g. 1kg, 500g, 1pc"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option>Fresh Vegetables</option>
                                <option>Fresh Fruits</option>
                                <option>Fish & Meat</option>
                                <option>Dairy & Eggs</option>
                                <option>Rice, Dal & Oil</option>
                                <option>Snacks</option>
                                <option>Beverages</option>
                                <option>Baby Care</option>
                                <option>Cleaning</option>
                                <option>Home & Kitchen</option>
                            </select>
                        </div>

                        {/* Discount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                            <Input
                                type="number"
                                placeholder="0"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Image URL */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <Input
                                placeholder="https://..."
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Provide a direct link to the product image.</p>
                        </div>

                        {/* Toggles */}
                        <div className="col-span-2 flex items-center gap-6 pt-2">
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="inStock"
                                    checked={formData.inStock}
                                    onChange={handleChange}
                                    className="rounded text-green-600 focus:ring-green-500 mr-2 h-5 w-5 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-900">In Stock</span>
                            </label>

                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isNew"
                                    checked={formData.isNew}
                                    onChange={handleChange}
                                    className="rounded text-green-600 focus:ring-green-500 mr-2 h-5 w-5 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-900">Mark as New</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-6">
                        <Link href="/admin/products">
                            <Button variant="outline" className="mr-3" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2" size={18} />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
