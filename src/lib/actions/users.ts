'use server';

import { db } from '@/db';
import { businessProfiles, customerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
 * Get user's display name from their profile
 * Fetches from customer profiles (works for both owners and managers)
 */
export async function getUserName() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return {
                success: false,
                name: null,
                error: 'Not authenticated'
            };
        }

        console.log('🔍 [getUserName] Fetching name for userId:', currentUser.id);

        // Query customer profile (all users have customer profiles)
        const customerProfile = await db.select({
            firstName: customerProfiles.firstName,
            lastName: customerProfiles.lastName,
        })
            .from(customerProfiles)
            .where(eq(customerProfiles.userId, currentUser.id))
            .limit(1);

        if (customerProfile.length > 0 && customerProfile[0].firstName) {
            console.log('✅ [getUserName] Found user profile:', customerProfile[0]);
            return {
                success: true,
                name: customerProfile[0].firstName,
                fullName: `${customerProfile[0].firstName} ${customerProfile[0].lastName || ''}`.trim()
            };
        }

        console.log('⚠️ [getUserName] No profile found for user');
        return {
            success: true,
            name: null,
            fullName: null
        };

    } catch (error) {
        console.error('❌ [getUserName] Error fetching user name:', error);
        return {
            success: false,
            name: null,
            error: 'Failed to fetch user name'
        };
    }
}
