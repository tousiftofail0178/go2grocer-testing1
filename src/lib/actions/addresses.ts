'use server';

import { db } from '@/db';
import { addresses, businessProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
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
 * Update business address
 * Creates a new address and links it to the business profile
 */
export async function updateBusinessAddress(
    businessId: number,
    addressData: {
        streetAddress: string;
        area: string;
        city?: string;
        postalCode?: string;
        country?: string;
        latitude?: string;
        longitude?: string;
    }
) {
    try {
        console.log('🏢 [updateBusinessAddress] Updating address for business:', businessId);
        console.log('📍 [updateBusinessAddress] Address data:', addressData);

        // 1. Verify user is authenticated
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        // 2. Insert new address
        const [newAddress] = await db.insert(addresses).values({
            streetAddress: addressData.streetAddress,
            area: addressData.area,
            city: addressData.city || 'Dhaka',
            postalCode: addressData.postalCode || null,
            country: addressData.country || 'Bangladesh',
            latitude: addressData.latitude || null,
            longitude: addressData.longitude || null,
        }).returning();

        console.log('✅ [updateBusinessAddress] Created address:', newAddress);

        // 3. Update business profile to link to new address
        await db.update(businessProfiles)
            .set({ addressId: newAddress.id })
            .where(eq(businessProfiles.businessId, businessId));

        console.log('✅ [updateBusinessAddress] Linked address to business');

        // 4. Revalidate checkout page
        revalidatePath('/checkout');

        return {
            success: true,
            address: newAddress
        };

    } catch (error) {
        console.error('❌ [updateBusinessAddress] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update business address'
        };
    }
}

/**
 * Get business address with full details
 * Returns null if business has no address linked
 */
export async function getBusinessAddress(businessId: number) {
    try {
        console.log('🔍 [getBusinessAddress] Fetching address for business:', businessId);

        // Query business with address relation
        const business = await db.query.businessProfiles.findFirst({
            where: eq(businessProfiles.businessId, businessId),
            with: {
                address: true,
            },
        });

        if (!business) {
            console.log('⚠️ [getBusinessAddress] Business not found');
            return {
                success: false,
                error: 'Business not found',
                address: null
            };
        }

        console.log('✅ [getBusinessAddress] Found business address:', business.address);

        return {
            success: true,
            address: business.address || null
        };

    } catch (error) {
        console.error('❌ [getBusinessAddress] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch business address',
            address: null
        };
    }
}
