'use server';

import { db } from '@/db';
import { users, customerProfiles, businessProfiles, addresses, businessApplications, managerApplications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { User } from '@/lib/data';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function authenticateUser(email: string, passwordAttempt: string) {
    try {
        // 1. Find user by email
        const foundUsers = await db.select().from(users).where(eq(users.email, email));
        const user = foundUsers[0];

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // 2. Check if user is verified (pending admin approval)
        if (!user.isVerified) {
            return { success: false, error: 'Account pending admin approval. Please wait for verification.' };
        }

        // 3. Verify password (TODO: Use bcrypt in production)
        if (user.passwordHash !== passwordAttempt) {
            return { success: false, error: 'Invalid password' };
        }

        // 3. Fetch profile based on role
        let profile = null;
        let name = 'User';
        const businesses: any[] = []; // Type properly for now

        if (user.role === 'consumer') {
            const customerProfile = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, user.id));
            profile = customerProfile[0];
            if (profile) {
                name = `${profile.firstName} ${profile.lastName}`;
            }
        } else if (user.role === 'business_owner' || user.role === 'business_manager') {
            const businessProfile = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, user.id));
            if (businessProfile[0]) {
                profile = businessProfile[0];
                name = businessProfile[0].businessName || 'Business User';
                businesses.push(...businessProfile);
            }
        } else {
            // For admin, g2g_operations, g2g_social_media - no special profile
            name = user.email.split('@')[0]; // Use email username as name
        }

        // 4. Return user data with ACTUAL role (not legacy mapping)
        const authenticatedUser: User = {
            id: user.id.toString(), // Use numeric ID
            name,
            phone: user.phoneNumber,
            email: user.email,
            role: user.role as User['role'], // Return ACTUAL role for RBAC
        };

        // 5. Set authentication cookies for server actions
        const cookieStore = await cookies();
        const isProduction = process.env.NODE_ENV === 'production';

        cookieStore.set('userId', user.id.toString(), {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        cookieStore.set('userEmail', user.email, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        return { success: true, user: authenticatedUser, businesses };

    } catch (error: any) {
        console.error('Login error:', error);
        return { success: false, error: 'Authentication failed' };
    }
}

// STEP 1 REGISTRATION: Owner Personal Details Only
// This function strictly handles Step 1 - creating user account and personal profile
export async function registerOwnerStep1(data: {
    // Personal details only - NO business details yet
    email: string;
    password: string;
    phone: string;
    firstName: string; // Mandatory to prevent "Business Owner" bug
    lastName: string;  // Mandatory
    dateOfBirth?: string;
    nidPassportNumber?: string;
    nidPassportImageUrl?: string;
}) {
    try {
        // 1. Check if email exists
        const existing = await db.select().from(users).where(eq(users.email, data.email));
        if (existing.length > 0) {
            return { success: false, error: 'Email already exists' };
        }

        // 2. Insert user (The Login Credentials)
        const newUsers = await db.insert(users).values({
            email: data.email,
            phoneNumber: data.phone,
            passwordHash: data.password, // TODO: Ensure this is hashed before sending or inside here
            role: 'business_owner',      // ✅ FIXED: Hardcoded to business_owner
            isVerified: false,
        }).returning();

        const newUser = newUsers[0];

        // 3. Insert customer profile (The Personal Details)
        await db.insert(customerProfiles).values({
            userId: newUser.id,          // ✅ LINK: Uses the numeric ID from users table
            roleType: 'OWNER',           // ✅ FIXED: Hardcoded to OWNER
            firstName: data.firstName,   // ✅ FIXED: Removed "|| 'Business'" fallback
            lastName: data.lastName,     // ✅ FIXED: Removed "|| 'Owner'" fallback
            email: data.email,
            phoneNumber: data.phone,
            dateOfBirth: data.dateOfBirth || null,
            nidPassportNumber: data.nidPassportNumber || null,
            nidPassportImageUrl: data.nidPassportImageUrl || null,
            loyaltyPoints: 0             // Default
        });

        // ✅ REMOVED: The "businessApplications" insert. 
        // We will do this in a separate "Step 2" API call.

        // 4. Return the User ID so the Frontend can save it for Step 2
        return {
            success: true,
            user: {
                id: newUser.id,          // ⚠️ CRITICAL: Send this Numeric ID to frontend
                email: newUser.email,
                role: 'business_owner'
            }
        };


    } catch (error: any) {
        console.error('Registration Step 1 Error:', error);
        return { success: false, error: 'Failed to create owner account: ' + error.message };
    }
}

// STEP 2 REGISTRATION: Business Details
// This function handles Step 2 - creating business application
export async function registerBusinessStep2(data: {
    userId: number;              // From Step 1 response
    businessName: string;
    businessEmail?: string;
    businessPhone?: string;
    address?: string;
    bin?: string;
    tin?: string;
    vat?: string;
    bankName?: string;
    bankBranch?: string;
    bankAccount?: string;
}) {
    try {
        const { businessApplications } = await import('@/db/schema');

        // 1. Verify user exists and is a business_owner
        const userCheck = await db.select().from(users).where(eq(users.id, data.userId));
        if (userCheck.length === 0) {
            return { success: false, error: 'User not found' };
        }

        const user = userCheck[0];
        if (user.role !== 'business_owner') {
            return { success: false, error: 'Only business owners can create business applications' };
        }

        // 2. Create business application entry
        const newApplication = await db.insert(businessApplications).values({
            userId: data.userId,
            businessName: data.businessName,
            legalName: data.businessName,
            phoneNumber: data.businessPhone || user.phoneNumber,
            email: data.businessEmail || user.email,
            tradeLicenseNumber: data.bin || 'PENDING',
            taxCertificateNumber: data.tin || 'PENDING',
            status: 'pending', // Status: pending admin approval
        }).returning();

        // 3. Return application ID for Step 3
        return {
            success: true,
            applicationId: newApplication[0].applicationId,
            message: 'Business application created successfully'
        };

    } catch (error: any) {
        console.error('Registration Step 2 Error:', error);
        return { success: false, error: 'Failed to create business application: ' + error.message };
    }
}

// STEP 3 REGISTRATION: Manager Account (Optional)
// This function handles Step 3 - creating optional manager account
export async function registerManagerStep3(data: {
    userId: number;              // Owner's user ID (from Step 1)
    applicationId: number;       // Business application ID (from Step 2)
    managerFirstName?: string;
    managerLastName?: string;
    managerEmail?: string;
    managerPhone?: string;
    managerPassword?: string;
    managerDateOfBirth?: string;
    managerNidPassportNumber?: string;
    managerNidPassportImageUrl?: string;
}) {
    try {
        const { businessApplications } = await import('@/db/schema');

        // 1. SECURITY CHECK: Verify application belongs to this user
        const applicationCheck = await db
            .select()
            .from(businessApplications)
            .where(eq(businessApplications.applicationId, data.applicationId));

        if (applicationCheck.length === 0) {
            return { success: false, error: 'Business application not found' };
        }

        const application = applicationCheck[0];
        if (application.userId !== data.userId) {
            return { success: false, error: 'Security violation: Application does not belong to this user' };
        }

        // 2. If manager details provided, create manager request
        if (data.managerEmail && data.managerFirstName && data.managerLastName) {

            // Check if manager email already exists
            const existingManager = await db.select().from(users).where(eq(users.email, data.managerEmail));

            let managerId: number;

            if (existingManager.length > 0) {
                // Manager user already exists - just link them
                managerId = existingManager[0].id;
            } else {
                // Create new manager user account
                const newManagerUser = await db.insert(users).values({
                    email: data.managerEmail,
                    phoneNumber: data.managerPhone || '',
                    passwordHash: data.managerPassword || 'TEMP', // TODO: Hash password
                    role: 'business_manager',
                    isVerified: false, // Requires approval
                }).returning();

                managerId = newManagerUser[0].id;

                // Create manager customer profile
                await db.insert(customerProfiles).values({
                    userId: managerId,
                    roleType: 'MANAGER',
                    firstName: data.managerFirstName,
                    lastName: data.managerLastName,
                    email: data.managerEmail,
                    phoneNumber: data.managerPhone || '',
                    dateOfBirth: data.managerDateOfBirth || null,
                    nidPassportNumber: data.managerNidPassportNumber || null,
                    nidPassportImageUrl: data.managerNidPassportImageUrl || null,
                    loyaltyPoints: 0,
                });
            }

            // Note: We can't link manager to business_id yet because the business
            // hasn't been approved. This will be done during admin approval.
        }

        // 3. Update business application status to indicate completion
        await db
            .update(businessApplications)
            .set({
                status: 'pending', // Still pending admin approval
                // Could add a field like 'registrationComplete: true' if needed
            })
            .where(eq(businessApplications.applicationId, data.applicationId));

        return {
            success: true,
            message: 'Registration completed! Your application is pending admin approval.',
        };

    } catch (error: any) {
        console.error('Registration Step 3 Error:', error);
        return { success: false, error: 'Failed to complete registration: ' + error.message };
    }
}

export async function verifyOtpUser(phone: string) {
    try {
        // 1. Find user by phone
        const foundUsers = await db.select().from(users).where(eq(users.phoneNumber, phone));
        const user = foundUsers[0];

        if (user) {
            // Fetch customer profile
            const profile = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, user.id));
            const customerProfile = profile[0];

            return {
                success: true,
                user: {
                    id: user.id.toString(),
                    name: `${customerProfile.firstName} ${customerProfile.lastName}`,
                    phone: user.phoneNumber,
                    email: user.email,
                    role: mapRoleToLegacy(user.role),
                }
            };
        } else {
            // 2. Create new consumer user
            // If user doesn't exist, create a new one
            const newUsers = await db.insert(users).values({
                email: `guest-${Date.now()}@go2grocer.com`,
                phoneNumber: phone, // Full phone with country code
                passwordHash: '',
                role: 'consumer',
                isVerified: false,
            }).returning();

            const newUser = newUsers[0];

            // Create customer profile
            await db.insert(customerProfiles).values({
                userId: newUser.id,
                firstName: 'Guest',
                lastName: 'User',
                phoneNumber: phone,
                email: newUser.email,
                loyaltyPoints: 0,
            });

            return {
                success: true,
                user: {
                    id: newUser.id.toString(),
                    name: 'Guest User',
                    phone: phone,
                    role: 'consumer' as const,
                }
            };
        }
    } catch (error: any) {
        console.error('OTP Verification error:', error);
        return { success: false, error: 'Verification failed' };
    }
}

export async function updateUserProfile(userId: string, data: { name?: string; email?: string; phone?: string; address?: string }) {
    try {
        // Find user by numeric ID
        const numericId = parseInt(userId, 10);
        const foundUsers = await db.select().from(users).where(eq(users.id, numericId));
        const user = foundUsers[0];

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Update user email/phone if provided
        if (data.email || data.phone) {
            await db.update(users)
                .set({
                    email: data.email,
                    phoneNumber: data.phone,
                })
                .where(eq(users.id, user.id));
        }

        // Update profile based on role
        if (user.role === 'consumer' && data.name) {
            const nameParts = data.name.split(' ');
            await db.update(customerProfiles)
                .set({
                    firstName: nameParts[0] || 'User',
                    lastName: nameParts.slice(1).join(' ') || '',
                })
                .where(eq(customerProfiles.userId, user.id));
        }

        return { success: true };
    } catch (error: any) {
        console.error('Profile update error:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}

// Helper function to map new roles to legacy roles
function mapRoleToLegacy(role: string): User['role'] {
    switch (role) {
        case 'admin':
        case 'g2g_manager':
        case 'g2g_operations':
            return 'admin';
        case 'business_owner':
        case 'business_manager':
            return 'b2b';
        case 'consumer':
        default:
            return 'consumer';
    }
}

// --- NEW UNIFIED REGISTRATION ACTION (STRICT ORDER) ---
// --- REVISED STRICT registerBusiness ACTION (Owner + Business Only) ---
export async function registerBusiness(data: {
    // Owner Details
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    dateOfBirth: string;
    nidPassportNumber: string;
    nidPassportImageUrl?: string;
    ownerAddress: {
        streetAddress: string;
        area: string;
        city: string;
        postalCode: string;
    };

    // Business Details
    businessName: string;
    businessEmail: string;
    businessPhone: string;
    tradeLicenseNumber?: string; // bin
    taxCertificateNumber?: string; // tin
    vat?: string;
    bankName?: string;
    bankAccount?: string;
    bankBranch?: string;
    businessAddress: {
        streetAddress: string;
        area: string;
        city: string;
        postalCode: string;
    };
}) {
    console.log('🚀 Starting STRICT registerBusiness Action (Owner + Business)...');

    try {
        // Validation: Verify Owner Email Unique
        const existingOwner = await db.select().from(users).where(eq(users.email, data.email));
        if (existingOwner.length > 0) {
            return { success: false, error: 'Email already exists' };
        }

        // --- STEP 1: CREATE ADDRESSES (The Priority) ---
        // CRITICAL: Fail if any address creation fails.

        let ownerAddressId: number;
        let businessAddressId: number;

        try {
            // 1a. Owner Address
            const [newOwnerAddr] = await db.insert(addresses).values({
                streetAddress: data.ownerAddress.streetAddress,
                area: data.ownerAddress.area,
                city: data.ownerAddress.city,
                postalCode: data.ownerAddress.postalCode,
                country: 'Bangladesh',
            }).returning({ id: addresses.id });
            ownerAddressId = newOwnerAddr.id;
            console.log('✅ Created Owner Address:', ownerAddressId);

            // 1b. Business Address
            const [newBusinessAddr] = await db.insert(addresses).values({
                streetAddress: data.businessAddress.streetAddress,
                area: data.businessAddress.area,
                city: data.businessAddress.city,
                postalCode: data.businessAddress.postalCode,
                country: 'Bangladesh',
            }).returning({ id: addresses.id });
            businessAddressId = newBusinessAddr.id;
            console.log('✅ Created Business Address:', businessAddressId);

        } catch (addrError: any) {
            console.error('❌ Address Creation Failed:', addrError);
            throw new Error('Failed to save address details. Registration aborted.');
        }

        // --- STEP 2: CREATE APPLICATIONS / PROFILES ---

        // 2a. Create Owner User & Profile
        // Insert User
        const [newUser] = await db.insert(users).values({
            email: data.email,
            phoneNumber: data.phone,
            passwordHash: data.password, // TODO: Hash
            role: 'business_owner',
            isVerified: false,
        }).returning({ id: users.id });

        const ownerId = newUser.id;

        // Insert Owner Profile (Linked to Address)
        await db.insert(customerProfiles).values({
            userId: ownerId,
            roleType: 'OWNER',
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phone,
            dateOfBirth: data.dateOfBirth || null,
            nidPassportNumber: data.nidPassportNumber || null,
            nidPassportImageUrl: data.nidPassportImageUrl || null,
            addressId: ownerAddressId, // ✅ LINKED
            loyaltyPoints: 0
        });
        console.log('✅ Created Owner Profile linked to Address:', ownerAddressId);

        // 2b. Create Business Application (Linked to Address)
        const [newApp] = await db.insert(businessApplications).values({
            userId: ownerId,
            businessName: data.businessName,
            legalName: data.businessName,
            addressId: businessAddressId, // ✅ LINKED
            phoneNumber: data.businessPhone,
            email: data.businessEmail,
            tradeLicenseNumber: data.tradeLicenseNumber || 'PENDING',
            taxCertificateNumber: data.taxCertificateNumber || 'PENDING',
            status: 'pending',
        }).returning({ applicationId: businessApplications.applicationId });

        const applicationId = newApp.applicationId;
        console.log('✅ Created Business Application linked to Address:', businessAddressId);

        return { success: true, applicationId: applicationId, userId: ownerId };

    } catch (error: any) {
        console.error('❌ STRICT Registration Failed:', error);
        return { success: false, error: error.message };
    }
}

// --- NEW STRICT registerManager ACTION (Step 3) ---
export async function registerManager(data: {
    linkedApplicationId: number; // Links to the pending business application
    managerFirstName: string;
    managerLastName: string;
    managerEmail: string;
    managerPhone: string;
    managerPassword: string;
    managerDateOfBirth: string;
    managerNidPassportNumber: string;
    managerNidPassportImageUrl?: string;
    managerAddress: {
        streetAddress: string;
        area: string;
        city: string;
        postalCode: string;
    };
}) {
    console.log('🚀 Starting STRICT registerManager Action...');

    try {
        // Validation: Verify Application Exists
        const applicationCheck = await db
            .select()
            .from(businessApplications)
            .where(eq(businessApplications.applicationId, data.linkedApplicationId));

        if (applicationCheck.length === 0) {
            return { success: false, error: 'Linked Business Application not found' };
        }

        const businessOwnerId = applicationCheck[0].userId;

        // --- STEP 1: CREATE ADDRESS ---
        let managerAddressId: number;

        try {
            const [newManagerAddr] = await db.insert(addresses).values({
                streetAddress: data.managerAddress.streetAddress,
                area: data.managerAddress.area,
                city: data.managerAddress.city,
                postalCode: data.managerAddress.postalCode,
                country: 'Bangladesh',
            }).returning({ id: addresses.id });
            managerAddressId = newManagerAddr.id;
            console.log('✅ Created Manager Address:', managerAddressId);
        } catch (addrError: any) {
            console.error('❌ Manager Address Creation Failed:', addrError);
            throw new Error('Failed to save manager address details.');
        }

        // --- STEP 2: CREATE USER & PROFILE ---

        // Check if manager email already exists
        const existingManager = await db.select().from(users).where(eq(users.email, data.managerEmail));
        let managerId: number;

        if (existingManager.length > 0) {
            // Manager user already exists
            managerId = existingManager[0].id;
            console.log('ℹ️ Manager User already exists, linking ID:', managerId);
        } else {
            // Create new manager user account
            const [newManagerUser] = await db.insert(users).values({
                email: data.managerEmail,
                phoneNumber: data.managerPhone,
                passwordHash: data.managerPassword || 'TEMP', // TODO: Hash
                role: 'business_manager',
                isVerified: false,
            }).returning({ id: users.id });
            managerId = newManagerUser.id;

            // Create Manager Profile (Linked to Address)
            await db.insert(customerProfiles).values({
                userId: managerId,
                roleType: 'MANAGER',
                firstName: data.managerFirstName,
                lastName: data.managerLastName,
                email: data.managerEmail,
                phoneNumber: data.managerPhone,
                dateOfBirth: data.managerDateOfBirth || null,
                nidPassportNumber: data.managerNidPassportNumber || null,
                nidPassportImageUrl: data.managerNidPassportImageUrl || null,
                addressId: managerAddressId, // ✅ LINKED
                loyaltyPoints: 0,
            });
            console.log('✅ Created Manager User & Profile:', managerId);
        }

        // --- STEP 3: CREATE APPLICATION LINKED TO BUSINESS APP ---
        await db.insert(managerApplications).values({
            businessOwnerId: businessOwnerId, // Owner of the pending business app
            linkedApplicationId: data.linkedApplicationId, // ✅ VALID: Linking to pending app
            addressId: managerAddressId, // ✅ LINKED
            managerFirstName: data.managerFirstName,
            managerLastName: data.managerLastName,
            managerEmail: data.managerEmail,
            managerPhone: data.managerPhone,
            status: 'pending',
        });

        console.log('✅ Created Manager Application linked to Business App:', data.linkedApplicationId);

        return { success: true, message: 'Manager registered successfully' };

    } catch (error: any) {
        console.error('❌ STRICT Manager Registration Failed:', error);
        return { success: false, error: error.message };
    }
}
