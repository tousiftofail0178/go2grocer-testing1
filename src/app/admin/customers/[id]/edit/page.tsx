"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import styles from '../../new/new-customer.module.css';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
}

interface FormErrors {
    [key: string]: string;
}

export default function EditCustomerPage() {
    const router = useRouter();
    const params = useParams();
    const customerId = params.id as string;

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchCustomer();
    }, [customerId]);

    const fetchCustomer = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/customers/${customerId}`);
            const data = await response.json();

            if (response.ok) {
                setFormData({
                    firstName: data.customer.firstName,
                    lastName: data.customer.lastName,
                    email: data.customer.email,
                    phone: data.customer.phone,
                    dateOfBirth: data.customer.dateOfBirth || '',
                });
            } else {
                setErrorMessage(data.error || 'Failed to load customer');
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
            setErrorMessage('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Required fields
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Phone validation (basic)
        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    dateOfBirth: formData.dateOfBirth || null,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Customer updated successfully!');
                // Redirect to customers list after 2 seconds
                setTimeout(() => {
                    router.push('/admin/customers');
                }, 2000);
            } else {
                setErrorMessage(data.error || 'Failed to update customer');
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            setErrorMessage('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <Link href="/admin/customers" className={styles.backLink}>
                        <ArrowLeft size={16} />
                        Back to Customers
                    </Link>
                    <h1 className={styles.title}>Edit Customer</h1>
                </div>
                <div className={styles.formCard}>
                    <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                        Loading customer data...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin/customers" className={styles.backLink}>
                    <ArrowLeft size={16} />
                    Back to Customers
                </Link>
                <h1 className={styles.title}>Edit Customer</h1>
                <p className={styles.subtitle}>Update customer information</p>
            </div>

            {successMessage && (
                <div className={styles.successMessage}>
                    <CheckCircle2 size={20} />
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className={styles.errorAlert}>
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.formCard}>
                {/* Personal Information */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Personal Information</h2>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                First Name<span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`${styles.input} ${errors.firstName ? styles.error : ''}`}
                                placeholder="John"
                            />
                            {errors.firstName && (
                                <span className={styles.errorMessage}>{errors.firstName}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Last Name<span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`${styles.input} ${errors.lastName ? styles.error : ''}`}
                                placeholder="Doe"
                            />
                            {errors.lastName && (
                                <span className={styles.errorMessage}>{errors.lastName}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Email<span className={styles.required}>*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`${styles.input} ${errors.email ? styles.error : ''}`}
                                placeholder="john@example.com"
                            />
                            {errors.email && (
                                <span className={styles.errorMessage}>{errors.email}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Phone<span className={styles.required}>*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                                placeholder="+8801712345678"
                            />
                            {errors.phone && (
                                <span className={styles.errorMessage}>{errors.phone}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <Link href="/admin/customers" className={styles.cancelButton}>
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Customer'}
                    </button>
                </div>
            </form>
        </div>
    );
}
