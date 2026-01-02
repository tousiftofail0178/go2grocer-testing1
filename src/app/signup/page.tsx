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
    const [step, setStep] = useState(1); // Step 1: Personal, Step 2: Business, Step 3: Manager (Optional)
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        // Step 1: Personal Details
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        dateOfBirth: '',
        nidPassportNumber: '',
        nidPassportImageUrl: '',

        // Step 2: Business Details
        businessName: '',
        businessEmail: '',      // NEW
        businessPhone: '',      // NEW
        address: '',
        bin: '',
        tin: '',
        vat: '',
        bankName: '',
        bankAccount: '',
        bankBranch: '',

        // Step 3: Manager Account (Optional)
        managerFirstName: '',
        managerLastName: '',
        managerEmail: '',
        managerPhone: '',
        managerPassword: '',
        managerDateOfBirth: '',
        managerNidPassportNumber: '',
        managerNidPassportImageUrl: '',

        // System fields
        userId: '',
        role: 'owner' as 'owner' | 'manager',
    });

    // NEW: Store applicationId from Step 2
    const [applicationId, setApplicationId] = useState<number | null>(null);

    useEffect(() => {
        // Auto-generate User ID in background
        const generatedId = `B2B-${Math.floor(100000 + Math.random() * 900000)}`;
        setFormData(prev => ({ ...prev, userId: generatedId }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            // Validate Step 1
            if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.password || !formData.dateOfBirth || !formData.nidPassportNumber) {
                alert('Please fill in all required fields');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            // Validate Step 2
            if (!formData.businessName || !formData.businessEmail || !formData.businessPhone || !formData.address) {
                alert('Please fill in all required business fields');
                return;
            }

            // ✅ SUBMIT Step 1 & 2 together to get applicationId
            try {
                const submissionData = {
                    ...formData,
                    contactName: `${formData.firstName} ${formData.lastName}`
                };

                await signupB2B(submissionData);

                console.log('✅ Business application submitted, checking localStorage for applicationId...');

                // Wait briefly for localStorage to be set
                await new Promise(resolve => setTimeout(resolve, 500));

                const storedAppId = localStorage.getItem('pendingApplicationId');
                if (!storedAppId) {
                    console.warn('⚠️ ApplicationId not found in localStorage, but continuing to Step 3');
                }

                // Move to Step 3
                setStep(3);
            } catch (err) {
                console.error('Step 2 submission failed:', err);
                alert('Failed to submit business application. Please try again.');
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Step 3: Submit manager application (if manager details provided)
        try {
            // Check if manager details are filled
            const hasManagerData = formData.managerFirstName && formData.managerLastName &&
                formData.managerEmail && formData.managerPhone;

            if (hasManagerData) {
                // Get applicationId from localStorage (set by signupB2B)
                const storedAppId = localStorage.getItem('pendingApplicationId');
                const storedUserId = localStorage.getItem('pendingUserId');

                if (!storedAppId || !storedUserId) {
                    alert('Error: Application data not found. Your business application was submitted, but we could not register the manager. You can add managers later from your dashboard.');

                    // Clear and show success anyway
                    localStorage.removeItem('pendingApplicationId');
                    localStorage.removeItem('pendingUserId');
                    setShowSuccessModal(true);
                    return;
                }

                // Call new Step 3 endpoint
                const response = await fetch('/api/register-manager-step3', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        applicationId: parseInt(storedAppId),
                        businessOwnerId: parseInt(storedUserId),
                        managerEmail: formData.managerEmail,
                        managerPhone: formData.managerPhone,
                        managerFirstName: formData.managerFirstName,
                        managerLastName: formData.managerLastName,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error('Manager registration failed:', data);
                    alert(`Manager registration failed: ${data.error}. Your business application is still pending approval.`);
                } else {
                    console.log('✅ Manager registered:', data);
                }
            }

            // Clear localStorage
            localStorage.removeItem('pendingApplicationId');
            localStorage.removeItem('pendingUserId');

            // Show success modal
            setShowSuccessModal(true);
        } catch (err) {
            console.error('Step 3 failed:', err);
            alert('Failed to complete registration. Your business application may have been submitted. Please contact support.');

            // Clear localStorage and show success anyway since business app was submitted
            localStorage.removeItem('pendingApplicationId');
            localStorage.removeItem('pendingUserId');
            setShowSuccessModal(true);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Business Registration</h1>
                <p className={styles.subtitle}>
                    {step === 1 && 'Step 1: Personal Details'}
                    {step === 2 && 'Step 2: Business Details'}
                    {step === 3 && 'Step 3: Manager Account (Optional)'}
                </p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={step === 3 ? handleSubmit : handleNext} className={styles.form}>

                    {step === 1 && (
                        <>
                            <Input
                                name="firstName"
                                label="First Name"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                                icon={<User size={18} />}
                                required
                            />
                            <Input
                                name="lastName"
                                label="Last Name"
                                placeholder="Doe"
                                value={formData.lastName}
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

                            {/* New NID/Passport and DOB Fields */}
                            <Input
                                name="dateOfBirth"
                                label="Date of Birth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                type="date"
                                required
                            />

                            <Input
                                name="nidPassportNumber"
                                label="NID / Passport Number"
                                placeholder="Enter your NID or Passport number"
                                value={formData.nidPassportNumber}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                name="nidPassportImageUrl"
                                label="NID / Passport Image URL (Optional)"
                                placeholder="https://example.com/nid-image.jpg"
                                value={formData.nidPassportImageUrl}
                                onChange={handleChange}
                                type="url"
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
                                name="businessEmail"
                                label="Business Email"
                                placeholder="business@company.com"
                                value={formData.businessEmail}
                                onChange={handleChange}
                                icon={<Mail size={18} />}
                                type="email"
                                required
                            />
                            <Input
                                name="businessPhone"
                                label="Business Phone"
                                placeholder="+8801XXXXXXXXX"
                                value={formData.businessPhone}
                                onChange={handleChange}
                                icon={<Phone size={18} />}
                                type="tel"
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
                                    Next Step
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Step 3: Manager Account (Optional) */}
                    {step === 3 && (
                        <>
                            <div style={{
                                marginBottom: '1.5rem',
                                padding: '1rem',
                                background: '#f3f4f6',
                                borderRadius: '0.5rem'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                                    Optional: Add Manager Account
                                </h3>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                                    You can add a manager now or skip this step and add managers later from your dashboard.
                                </p>
                            </div>

                            <Input
                                name="managerFirstName"
                                label="Manager First Name (Optional)"
                                placeholder="John"
                                value={formData.managerFirstName}
                                onChange={handleChange}
                                icon={<User size={18} />}
                            />

                            <Input
                                name="managerLastName"
                                label="Manager Last Name (Optional)"
                                placeholder="Doe"
                                value={formData.managerLastName}
                                onChange={handleChange}
                                icon={<User size={18} />}
                            />

                            <Input
                                name="managerEmail"
                                label="Manager Email (Optional)"
                                placeholder="manager@company.com"
                                value={formData.managerEmail}
                                onChange={handleChange}
                                icon={<Mail size={18} />}
                                type="email"
                            />

                            <Input
                                name="managerPhone"
                                label="Manager Phone (Optional)"
                                placeholder="+8801XXXXXXXXX"
                                value={formData.managerPhone}
                                onChange={handleChange}
                                icon={<Phone size={18} />}
                                type="tel"
                            />

                            <Input
                                name="managerPassword"
                                label="Manager Password (Optional)"
                                placeholder="******"
                                value={formData.managerPassword}
                                onChange={handleChange}
                                icon={<Lock size={18} />}
                                type="password"
                            />

                            <Input
                                name="managerDateOfBirth"
                                label="Manager Date of Birth (Optional)"
                                placeholder="YYYY-MM-DD"
                                value={formData.managerDateOfBirth}
                                onChange={handleChange}
                                icon={<User size={18} />}
                                type="date"
                            />

                            <Input
                                name="managerNidPassportNumber"
                                label="Manager NID/Passport Number (Optional)"
                                placeholder="A12345678"
                                value={formData.managerNidPassportNumber}
                                onChange={handleChange}
                                icon={<User size={18} />}
                            />

                            <Input
                                name="managerNidPassportImageUrl"
                                label="Manager NID/Passport Image URL (Optional)"
                                placeholder="https://example.com/id-image.jpg"
                                value={formData.managerNidPassportImageUrl}
                                onChange={handleChange}
                                icon={<User size={18} />}
                            />

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button type="button" onClick={handleBack} style={{ flex: 1 }}>
                                    Back
                                </Button>
                                <Button fullWidth type="submit" style={{ flex: 2 }} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Complete Registration'}
                                </Button>
                            </div>
                        </>
                    )}

                    <div className={styles.footerLink}>
                        Already have an account? <Link href={`/login${redirectUrl !== '/' ? `?redirect=${redirectUrl}` : ''}`}>Login</Link>
                    </div>
                </form>

                {/* Success Modal */}
                {showSuccessModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '2.5rem',
                            borderRadius: '1rem',
                            maxWidth: '420px',
                            width: '90%',
                            textAlign: 'center',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '50%',
                                margin: '0 auto 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                color: 'white',
                                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
                            }}>
                                ✓
                            </div>
                            <h2 style={{
                                margin: '0 0 0.75rem',
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                color: '#1f2937'
                            }}>
                                Registration Submitted!
                            </h2>
                            <p style={{
                                color: '#6b7280',
                                margin: '0 0 2rem',
                                fontSize: '1rem',
                                lineHeight: '1.6'
                            }}>
                                Your business registration is pending admin approval.
                                You'll receive an email notification once your account is verified.
                            </p>
                            <Button
                                fullWidth
                                onClick={() => router.push('/login?message=pending')}
                                style={{
                                    padding: '0.875rem',
                                    fontSize: '1rem',
                                    fontWeight: 600
                                }}
                            >
                                Go to Login
                            </Button>
                        </div>
                    </div>
                )}

                <div className={styles.footer}>
                    <p>By continuing, you agree to our Terms & Privacy Policy.</p>
                </div>
            </div>
        </div>
    );
}
