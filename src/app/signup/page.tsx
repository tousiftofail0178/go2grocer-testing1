"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Phone, Mail, User, Loader2, Building2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './page.module.css';

export default function SignupPage() {
    return (
        <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
            <SignupForm />
        </React.Suspense>
    );
}

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';

    const { signupB2B, isLoading, error } = useAuthStore();
    const [step, setStep] = useState(1); // Step 1: User, Step 2: Business
    const [formData, setFormData] = useState({
        businessName: '',
        userId: '',
        password: '',
        contactName: '',
        phone: '',
        email: '',
        role: 'owner' as 'owner' | 'manager',
        address: '',
        bin: '',
        tin: '',
        vat: '',
        bankName: '',
        bankAccount: '',
        bankBranch: ''
    });

    useEffect(() => {
        // Auto-generate User ID in background
        const generatedId = `B2B-${Math.floor(100000 + Math.random() * 900000)}`;
        setFormData(prev => ({ ...prev, userId: generatedId }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation for Step 1
        if (formData.contactName && formData.phone && formData.email && formData.password) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signupB2B(formData);
            router.push(redirectUrl);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Business Registration</h1>
                <p className={styles.subtitle}>
                    {step === 1 ? 'Step 1: User Details' : 'Step 2: Business Details'}
                </p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={step === 2 ? handleSubmit : handleNext} className={styles.form}>

                    {step === 1 && (
                        <>
                            <Input
                                name="contactName"
                                label="Contact Person Name"
                                placeholder="John Doe"
                                value={formData.contactName}
                                onChange={handleChange}
                                icon={<User size={18} />}
                                required
                            />
                            <Input
                                name="email"
                                label="Email Address"
                                placeholder="john@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                icon={<Mail size={18} />}
                                type="email"
                                required
                            />
                            <Input
                                name="phone"
                                label="Phone Number"
                                placeholder="01XXXXXXXXX"
                                value={formData.phone}
                                onChange={handleChange}
                                icon={<Phone size={18} />}
                                type="tel"
                                required
                            />
                            <Input
                                name="password"
                                label="Create Password"
                                placeholder="******"
                                value={formData.password}
                                onChange={handleChange}
                                icon={<Lock size={18} />}
                                type="password"
                                required
                            />
                            <Button fullWidth type="submit">
                                Next Step
                            </Button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <Input
                                name="businessName"
                                label="Business Name"
                                placeholder="Company Ltd."
                                value={formData.businessName}
                                onChange={handleChange}
                                icon={<Building2 size={18} />}
                                required
                            />
                            <Input
                                name="address"
                                label="Business Address"
                                placeholder="123 Example St, City"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Input
                                    name="bin"
                                    label="BIN Number"
                                    placeholder="BIN-123..."
                                    value={formData.bin}
                                    onChange={handleChange}
                                />
                                <Input
                                    name="tin"
                                    label="TIN Number"
                                    placeholder="TIN-456..."
                                    value={formData.tin}
                                    onChange={handleChange}
                                />
                            </div>
                            <Input
                                name="vat"
                                label="VAT Number"
                                placeholder="VAT-789..."
                                value={formData.vat}
                                onChange={handleChange}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Input
                                    name="bankName"
                                    label="Bank Name"
                                    placeholder="Bank Name"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                />
                                <Input
                                    name="bankBranch"
                                    label="Branch"
                                    placeholder="Branch Name"
                                    value={formData.bankBranch}
                                    onChange={handleChange}
                                />
                            </div>
                            <Input
                                name="bankAccount"
                                label="Bank Account Number"
                                placeholder="Account Number"
                                value={formData.bankAccount}
                                onChange={handleChange}
                            />

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleBack}
                                    style={{ flex: 1 }}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    style={{ flex: 1 }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Register'}
                                </Button>
                            </div>
                        </>
                    )}

                    <div className={styles.footerLink}>
                        Already have an account? <Link href={`/login${redirectUrl !== '/' ? `?redirect=${redirectUrl}` : ''}`}>Login</Link>
                    </div>
                </form>

                <div className={styles.footer}>
                    <p>By continuing, you agree to our Terms & Privacy Policy.</p>
                </div>
            </div>
        </div>
    );
}
