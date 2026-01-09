"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Phone, Mail, User, Loader2, Building2, Lock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { AddressFormFields } from '@/components/forms/AddressFormFields';
import type { AddressData } from '@/components/forms/AddressFormFields';
// REMOVED old styles import to prevent conflicts
import styles from './Signup.module.css'; // Strictly use the new Layout CSS

import { toast } from 'react-hot-toast';

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

    const { signupB2B, registerManager, isLoading, error } = useAuthStore();
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
    const [addManager, setAddManager] = useState(false);

    // Address States for all three sections
    // FIX: Changed 'streetAddress' to 'street' to match AddressFormFields component
    const [ownerAddress, setOwnerAddress] = useState<AddressData>({
        street: '',
        area: '',
        customArea: '',
        city: 'Chittagong',
        postalCode: ''
    });

    const [businessAddress, setBusinessAddress] = useState<AddressData>({
        street: '',
        area: '',
        customArea: '',
        city: 'Chittagong',
        postalCode: ''
    });

    const [managerAddress, setManagerAddress] = useState<AddressData>({
        street: '',
        area: '',
        customArea: '',
        city: 'Chittagong',
        postalCode: ''
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

    // Address change handlers
    const handleOwnerAddressChange = (field: keyof AddressData, value: string) => {
        setOwnerAddress((prev: AddressData) => ({ ...prev, [field]: value }));
    };

    const handleBusinessAddressChange = (field: keyof AddressData, value: string) => {
        setBusinessAddress((prev: AddressData) => ({ ...prev, [field]: value }));
    };

    const handleManagerAddressChange = (field: keyof AddressData, value: string) => {
        setManagerAddress((prev: AddressData) => ({ ...prev, [field]: value }));
    };



    const handleNext = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // --- STEP 1: Local Validation (Personal) ---
        if (step === 1) {
            if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.password || !formData.dateOfBirth || !formData.nidPassportNumber) {
                toast.error('Please fill in all required personal details');
                return;
            }
            // Note: Owner address is optional in some flows, but if we want to validate it:
            // if (!ownerAddress.street || !ownerAddress.area || !ownerAddress.city) {
            //    toast.error('Please fill in all required personal address fields');
            //    return;
            // }
            setStep(2); // Just move to next UI step
            return;
        }

        // --- STEP 2: Submission (Business) ---
        if (step === 2) {
            // 1. Validate Business Fields
            if (!formData.businessName || !formData.businessEmail || !formData.businessPhone) {
                toast.error('Please fill in all required business details');
                return;
            }
            if (!businessAddress.street || !businessAddress.area || !businessAddress.city) {
                toast.error('Please fill in all required business address fields');
                return;
            }

            // If area is 'Other', validate custom area
            if (businessAddress.area === 'Other' && !businessAddress.customArea) {
                toast.error('Please specify the custom area');
                return;
            }

            try {
                // 2. MAP THE DATA (Crucial Fix)
                // We must convert 'street' -> 'streetAddress' and handle the 'Other' area logic
                const ownerFinalArea = (ownerAddress.area === 'Other' ? ownerAddress.customArea : ownerAddress.area) || '';
                const businessFinalArea = (businessAddress.area === 'Other' ? businessAddress.customArea : businessAddress.area) || '';

                const payload = {
                    ...formData,
                    contactName: `${formData.firstName} ${formData.lastName}`, // Ensure contactName is sent
                    // Owner Address Mapping
                    ownerAddress: {
                        streetAddress: ownerAddress.street,
                        area: ownerFinalArea,
                        city: ownerAddress.city,
                        postalCode: ownerAddress.postalCode,
                        country: 'Bangladesh'
                    },
                    // Business Address Mapping
                    businessAddress: {
                        streetAddress: businessAddress.street,
                        area: businessFinalArea,
                        city: businessAddress.city,
                        postalCode: businessAddress.postalCode,
                        country: 'Bangladesh'
                    }
                };

                // 3. Call Server Action
                const newApplicationId = await signupB2B(payload as any);

                if (newApplicationId) {
                    setApplicationId(newApplicationId);
                    console.log('✅ Business application submitted, ID:', newApplicationId);
                    toast.success('Business registered successfully!');
                    setStep(3);
                } else {
                    throw new Error('No application ID returned from registration.');
                }

            } catch (err: any) {
                console.error('Step 2 submission failed:', err);
                toast.error(err.message || 'Failed to submit business application.');
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
            if (addManager) {
                // Validate Manager Details
                if (!formData.managerFirstName || !formData.managerLastName || !formData.managerEmail ||
                    !formData.managerPhone || !formData.managerPassword) {
                    toast.error('Please fill in all required manager details.');
                    return;
                }

                // Validate Manager Address
                if (!managerAddress.street || !managerAddress.area || !managerAddress.city) {
                    toast.error('Please fill in required manager address fields.');
                    return;
                }

                // Ensure we have the applicationId from Step 2
                if (!applicationId) {
                    toast.error('Error: Application ID missing. Please go back and resubmit.');
                    return;
                }

                // Get final manager area value
                const managerFinalArea = (managerAddress.area === 'Other' ? managerAddress.customArea : managerAddress.area) || '';

                await registerManager({
                    linkedApplicationId: applicationId,
                    managerFirstName: formData.managerFirstName,
                    managerLastName: formData.managerLastName,
                    managerEmail: formData.managerEmail,
                    managerPhone: formData.managerPhone,
                    managerPassword: formData.managerPassword,
                    managerDateOfBirth: formData.managerDateOfBirth,
                    managerNidPassportNumber: formData.managerNidPassportNumber,
                    managerNidPassportImageUrl: formData.managerNidPassportImageUrl,
                    managerAddress: {
                        streetAddress: managerAddress.street,
                        area: managerFinalArea,
                        city: managerAddress.city,
                        postalCode: managerAddress.postalCode
                    }
                });

                toast.success('Manager registered successfully!');
            }

            // Show success modal
            setShowSuccessModal(true);
        } catch (err: any) {
            console.error('Step 3 failed:', err);
            toast.error(err.message || 'Failed to complete registration.');
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Business Registration</h1>
                    <p className={styles.subtitle}>
                        {step === 1 && 'Step 1: Personal Details'}
                        {step === 2 && 'Step 2: Business Details'}
                        {step === 3 && 'Step 3: Manager Account (Optional)'}
                    </p>
                </div>

                {error && <div className="text-red-500 text-center mb-4">{error}</div>}

                <form onSubmit={step === 3 ? handleSubmit : handleNext}>

                    {step === 1 && (
                        <>
                            {/* STRICT LAYOUT: Split View */}
                            <div className={styles.splitLayout}>
                                {/* Left Column: Personal Inputs */}
                                <div className={styles.column}>
                                    <h3 className={styles.sectionHeader}>Personal Details</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                    </div>
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
                                </div>

                                {/* Right Column: Address Details */}
                                <div className={styles.column}>
                                    <h3 className={styles.sectionHeader}>Address</h3>
                                    <AddressFormFields
                                        prefix="owner"
                                        data={ownerAddress}
                                        onChange={handleOwnerAddressChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <Button fullWidth type="submit">
                                    Next Step
                                </Button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className={styles.splitLayout}>
                                {/* Left Column: Business Details */}
                                <div className={styles.column}>
                                    <h3 className={styles.sectionHeader}>Business Details</h3>
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

                                    <div style={{ marginTop: '2rem' }}>
                                        <h3 className={styles.sectionHeader}>Financial Info</h3>
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
                                        <Input
                                            name="bankName"
                                            label="Bank Name"
                                            placeholder="Bank Name"
                                            value={formData.bankName}
                                            onChange={handleChange}
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <Input
                                                name="bankBranch"
                                                label="Branch"
                                                placeholder="Branch Name"
                                                value={formData.bankBranch}
                                                onChange={handleChange}
                                            />
                                            <Input
                                                name="bankAccount"
                                                label="Account Number"
                                                placeholder="Account Number"
                                                value={formData.bankAccount}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Address & Banking */}
                                <div className={styles.column}>
                                    <h3 className={styles.sectionHeader}>Business Address</h3>
                                    <AddressFormFields
                                        prefix="business"
                                        data={businessAddress}
                                        onChange={handleBusinessAddressChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
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
                            </div>
                        </>
                    )}

                    {/* Step 3: Manager Account */}
                    {step === 3 && (
                        <>
                            <div className={styles.splitLayout}>
                                {/* LEFT COLUMN: Manager Personal Details */}
                                <div className={styles.column}>
                                    <h3 className={styles.sectionHeader}>Manager Details (Optional)</h3>

                                    {/* Manager Toggle Info Box */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={addManager}
                                                onChange={(e) => setAddManager(e.target.checked)}
                                                className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            />
                                            <div>
                                                <span className="text-sm font-semibold text-gray-900">Create a Manager Account?</span>
                                                <p className="text-xs text-gray-500">Managers can place orders but cannot change business settings.</p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Inputs (Only show if toggle is ON) */}
                                    {addManager && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    label="First Name"
                                                    name="managerFirstName"
                                                    value={formData.managerFirstName}
                                                    onChange={handleChange}
                                                    icon={<User size={18} />}
                                                    placeholder="John"
                                                />
                                                <Input
                                                    label="Last Name"
                                                    name="managerLastName"
                                                    value={formData.managerLastName}
                                                    onChange={handleChange}
                                                    icon={<User size={18} />}
                                                    placeholder="Doe"
                                                />
                                            </div>

                                            <Input
                                                label="Manager Email"
                                                name="managerEmail"
                                                type="email"
                                                value={formData.managerEmail}
                                                onChange={handleChange}
                                                icon={<Mail size={18} />}
                                                placeholder="manager@company.com"
                                            />

                                            <Input
                                                label="Manager Phone"
                                                name="managerPhone"
                                                type="tel"
                                                value={formData.managerPhone}
                                                onChange={handleChange}
                                                icon={<Phone size={18} />}
                                                placeholder="+8801XXXXXXXXX"
                                            />

                                            <Input
                                                label="Manager Password"
                                                name="managerPassword"
                                                type="password"
                                                value={formData.managerPassword}
                                                onChange={handleChange}
                                                icon={<Lock size={18} />}
                                                placeholder="******"
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Date of Birth"
                                                    name="managerDateOfBirth"
                                                    type="date"
                                                    value={formData.managerDateOfBirth}
                                                    onChange={handleChange}
                                                    icon={<Calendar size={18} />}
                                                />
                                                <Input
                                                    label="NID / Passport Number"
                                                    name="managerNidPassportNumber"
                                                    value={formData.managerNidPassportNumber}
                                                    onChange={handleChange}
                                                    icon={<User size={18} />}
                                                    placeholder="A12345678"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT COLUMN: Manager Address */}
                                <div className={styles.column}>
                                    {addManager ? (
                                        <div className="animate-in fade-in slide-in-from-right-2 duration-500 delay-100">
                                            {/* Reuse the Manager Address State we created earlier */}
                                            <AddressFormFields
                                                prefix="manager"
                                                data={managerAddress}
                                                onChange={handleManagerAddressChange}
                                            />
                                        </div>
                                    ) : (
                                        /* Empty State Placeholder to keep layout balanced if manager is off */
                                        <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg text-center">
                                            <p className="text-gray-400 text-sm">Enable "Create Manager Account" to add address details.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.formActions}>
                                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleBack}
                                        style={{ flex: 1 }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        fullWidth
                                        type="submit"
                                        style={{ flex: 2 }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'Complete Registration'}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </form>
                <div className={styles.footerSection}>
                    <p className={styles.footerText}>
                        Already have an account?
                        <Link href={`/login${redirectUrl !== '/' ? `?redirect=${redirectUrl}` : ''}`} className={styles.loginLink}>
                            Login here
                        </Link>
                    </p>
                </div>


                {/* Success Modal */}
                {
                    showSuccessModal && (
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
                    )
                }

            </div>
        </div>
    );
}
