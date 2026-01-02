"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import styles from './new-customer.module.css';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
    gender: string;
    nidPassportNumber: string;
    role: string;
}

interface FormErrors {
    [key: string]: string;
}

export default function NewCustomerPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        gender: '',
        nidPassportNumber: '',
        role: 'consumer'
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
        if (!formData.role) newErrors.role = 'Role is required';

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Phone validation (basic)
        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        // Password validation
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Password match
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    dateOfBirth: formData.dateOfBirth || null,
                    nidPassportNumber: formData.nidPassportNumber || null,
                    role: formData.role,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Customer created successfully!');
                // Redirect to customers list after 2 seconds
                setTimeout(() => {
                    router.push('/admin/customers');
                }, 2000);
            } else {
                setErrorMessage(data.error || 'Failed to create customer');
            }
        } catch (error) {
            console.error('Error creating customer:', error);
            setErrorMessage('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin/customers" className={styles.backLink}>
                    <ArrowLeft size={16} />
                    Back to Customers
                </Link>
                <h1 className={styles.title}>Add New Customer</h1>
                <p className={styles.subtitle}>Create a new customer account</p>
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

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>NID/Passport Number</label>
                            <input
                                type="text"
                                name="nidPassportNumber"
                                value={formData.nidPassportNumber}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Enter NID or Passport number"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Role<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className={`${styles.select} ${errors.role ? styles.error : ''}`}
                            >
                                <option value="consumer">Consumer</option>
                                <option value="g2g_social_media">Social Media</option>
                                <option value="g2g_operations">Operations</option>
                                <option value="business_owner">Business Owner</option>
                                <option value="business_manager">Business Manager</option>
                            </select>
                            {errors.role && (
                                <span className={styles.errorMessage}>{errors.role}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Account Information</h2>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Password<span className={styles.required}>*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`${styles.input} ${errors.password ? styles.error : ''}`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <span className={styles.errorMessage}>{errors.password}</span>
                            )}
                            <span className={styles.helpText}>Minimum 6 characters</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Confirm Password<span className={styles.required}>*</span>
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && (
                                <span className={styles.errorMessage}>{errors.confirmPassword}</span>
                            )}
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
                        {isSubmitting ? 'Creating...' : 'Create Customer'}
                    </button>
                </div>
            </form>
        </div>
    );
}
