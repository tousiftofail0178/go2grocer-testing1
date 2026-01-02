import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessProfiles, users, customerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/business-profile - Fetch business profile(s) for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        console.log('📊 Fetching business profile for user:', userId);

        // userId is now numeric (no more UUID conversion needed)
        const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;

        // Get user info to check role
        const [user] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, numericUserId))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        console.log('✅ User role:', user.role);

        let profiles;

        // ✅ MULTI-TENANCY LOGIC: Filter by role
        if (user.role === 'business_owner') {
            // OWNER: Return ALL businesses owned by this user (Mr. T scenario)
            console.log('👔 Owner access: Fetching all businesses for ownerId:', numericUserId);
            profiles = await db
                .select()
                .from(businessProfiles)
                .where(eq(businessProfiles.ownerId, numericUserId));

            console.log(`✅ Found ${profiles.length} businesses for owner`);

        } else if (user.role === 'business_manager') {
            // MANAGER: Return ONLY the assigned business (Ahmed scenario)
            console.log('👨‍💼 Manager access: Fetching assigned business');

            // Get manager's assigned business from customer profile
            const [managerProfile] = await db
                .select({ employerBusinessId: customerProfiles.employerBusinessId })
                .from(customerProfiles)
                .where(eq(customerProfiles.userId, numericUserId))
                .limit(1);

            if (!managerProfile || !managerProfile.employerBusinessId) {
                console.log('⚠️ No business assigned to this manager');
                return NextResponse.json({
                    businesses: [],
                    message: 'No business assigned to this manager'
                });
            }

            // Fetch only the assigned business
            profiles = await db
                .select()
                .from(businessProfiles)
                .where(eq(businessProfiles.businessId, managerProfile.employerBusinessId));

            console.log(`✅ Found assigned business: ${profiles[0]?.businessName || 'N/A'}`);

        } else {
            // Other roles (consumer, admin, etc.) have no business access
            console.log('⚠️ User role does not have business access');
            return NextResponse.json({
                businesses: [],
                message: 'User role does not have business access'
            });
        }

        return NextResponse.json({
            businesses: profiles,
            userRole: user.role,
        });

    } catch (error: any) {
        console.error('❌ Error fetching business profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch business profile', details: error.message },
            { status: 500 }
        );
    }
}
