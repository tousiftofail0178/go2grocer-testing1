'use server';

import { db } from '@/db';
import { businessProfiles, customerProfiles, addresses } from '@/db/schema';
import { eq, or, and } from 'drizzle-orm';
import { cookies } from 'next/headers';

/**
 * Get current user from cookies
 */
async function getCurrentUser(): Promise<{ id: number; email: string } | null> {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userId || !userEmail) {
            return null;
        }

        return {
            id: Number(userId),
            email: userEmail
        };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Get all businesses the current user is linked to (as Owner or Manager)
 * 
 * @returns Array of businesses with id, name, and user's role in each
 */
export async function getUserBusinesses() {
    try {
        // 1. Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'Not authenticated',
                businesses: []
            };
        }

        console.log('🔍 [getUserBusinesses] Starting business lookup for userId:', currentUser.id);
        const businesses: Array<{
            id: number;
            name: string;
            role: 'OWNER' | 'MANAGER';
            address?: {
                street: string;
                area: string;
                city: string;
                postalCode: string | null;
            }
        }> = [];

        // 2. Get businesses where user is the OWNER (Verified only)
        console.log('👤 [getUserBusinesses] Checking Owner for userId:', currentUser.id);
        const ownedBusinesses = await db.select({
            businessId: businessProfiles.businessId,
            businessName: businessProfiles.businessName,
            ownerId: businessProfiles.ownerId,
            address: {
                street: addresses.streetAddress,
                area: addresses.area,
                city: addresses.city,
                postalCode: addresses.postalCode
            }
        })
            .from(businessProfiles)
            .leftJoin(addresses, eq(businessProfiles.addressId, addresses.id))
            .where(
                and(
                    eq(businessProfiles.ownerId, currentUser.id),
                    eq(businessProfiles.verificationStatus, 'verified')
                )
            );

        console.log('📋 [getUserBusinesses] Found', ownedBusinesses.length, 'verified owned businesses');

        // Add owned businesses with OWNER role
        for (const biz of ownedBusinesses) {
            businesses.push({
                id: biz.businessId,
                name: biz.businessName,
                role: 'OWNER',
                address: biz.address || undefined
            });
        }

        // 3. Get businesses where user is a MANAGER (Verified only)
        console.log('🔧 [getUserBusinesses] Checking Manager for userId:', currentUser.id);
        const managerProfile = await db.select({
            employerBusinessId: customerProfiles.employerBusinessId,
            roleType: customerProfiles.roleType,
        })
            .from(customerProfiles)
            .where(
                eq(customerProfiles.userId, currentUser.id)
            );

        console.log('👔 [getUserBusinesses] Found Manager Profile:', managerProfile);

        // If user is a manager, get the employer business details
        if (managerProfile.length > 0 && managerProfile[0].employerBusinessId && managerProfile[0].roleType === 'MANAGER') {
            console.log('🏢 [getUserBusinesses] User is a MANAGER, fetching employer business ID:', managerProfile[0].employerBusinessId);

            const employerBusiness = await db.select({
                businessId: businessProfiles.businessId,
                businessName: businessProfiles.businessName,
                verificationStatus: businessProfiles.verificationStatus,
                address: {
                    street: addresses.streetAddress,
                    area: addresses.area,
                    city: addresses.city,
                    postalCode: addresses.postalCode
                }
            })
                .from(businessProfiles)
                .leftJoin(addresses, eq(businessProfiles.addressId, addresses.id))
                .where(eq(businessProfiles.businessId, managerProfile[0].employerBusinessId));

            console.log('🏪 [getUserBusinesses] Employer business details:', employerBusiness);

            if (employerBusiness.length > 0) {
                const biz = employerBusiness[0];
                if (biz.verificationStatus !== 'verified') {
                    console.log('⚠️ [getUserBusinesses] Employer business is not verified, skipping.');
                } else {
                    // Check if not already added
                    const alreadyAdded = businesses.some(b => b.id === biz.businessId);
                    if (!alreadyAdded) {
                        console.log('✅ [getUserBusinesses] Adding employer business as MANAGER role');
                        businesses.push({
                            id: biz.businessId,
                            name: biz.businessName,
                            role: 'MANAGER',
                            address: biz.address || undefined
                        });
                    }
                }
            } else {
                console.log('❌ [getUserBusinesses] No employer business found with ID:', managerProfile[0].employerBusinessId);
            }
        } else {
            console.log('ℹ️ [getUserBusinesses] User is NOT a manager or has no employer business assigned');
        }

        console.log('🎯 [getUserBusinesses] Returning Businesses:', businesses);

        return {
            success: true,
            businesses,
        };

    } catch (error) {
        console.error('❌ [getUserBusinesses] Error fetching user businesses:', error);
        return {
            success: false,
            error: 'Failed to fetch businesses',
            businesses: []
        };
    }
}
