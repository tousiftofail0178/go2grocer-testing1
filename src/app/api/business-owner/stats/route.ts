import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessApplications, managerApplications, businessProfiles } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// GET /api/business-owner/stats?userId={id}
// Get dashboard statistics for a business owner
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

        const numericUserId = parseInt(userId);
        console.log(`📊 Calculating stats for user ID: ${numericUserId}`);

        // 1. ✅ CORRECT: Count pending applications by user_id
        const pendingApps = await db
            .select()
            .from(businessApplications)
            .where(
                and(
                    eq(businessApplications.userId, numericUserId),
                    eq(businessApplications.status, 'pending' as any)
                )
            );

        const pendingApplicationsCount = pendingApps.length;
        console.log(`✅ Pending applications: ${pendingApplicationsCount}`);

        // 2. ✅ FIXED: Count UNIQUE managers by business_owner_id OR owned businesses
        // Use Set to deduplicate by email (avoid double counting)
        const uniqueManagerEmails = new Set<string>();

        // First, get managers directly linked to this owner (pending + approved)
        const directManagers = await db
            .select()
            .from(managerApplications)
            .where(eq(managerApplications.businessOwnerId, numericUserId));

        console.log(`✅ Found ${directManagers.length} manager application(s) by business_owner_id`);

        // Add to set, excluding rejected
        for (const manager of directManagers) {
            if (manager.status !== 'rejected') {
                uniqueManagerEmails.add(manager.managerEmail);
            }
        }

        // Get owned businesses to find additional managers
        const ownedBusinesses = await db
            .select({ businessId: businessProfiles.businessId })
            .from(businessProfiles)
            .where(eq(businessProfiles.userId, numericUserId));

        if (ownedBusinesses.length > 0) {
            const businessIds = ownedBusinesses.map(b => b.businessId);
            const indirectManagers = await db
                .select()
                .from(managerApplications)
                .where(inArray(managerApplications.businessId, businessIds));

            console.log(`✅ Found ${indirectManagers.length} manager application(s) by business_id`);

            // Add to set, excluding rejected (Set automatically deduplicates)
            for (const manager of indirectManagers) {
                if (manager.status !== 'rejected') {
                    uniqueManagerEmails.add(manager.managerEmail);
                }
            }
        }

        const totalManagers = uniqueManagerEmails.size;
        console.log(`✅ Total UNIQUE managers (after deduplication): ${totalManagers}`);

        // 3. Count verified businesses
        const verifiedBusinesses = await db
            .select()
            .from(businessProfiles)
            .where(eq(businessProfiles.userId, numericUserId));

        const verifiedBusinessesCount = verifiedBusinesses.length;
        console.log(`✅ Verified businesses: ${verifiedBusinessesCount}`);

        const stats = {
            pendingApplications: pendingApplicationsCount,
            managers: totalManagers,
            verifiedBusinesses: verifiedBusinessesCount,
            totalRevenue: 0, // Placeholder
        };

        console.log(`📊 Stats calculated:`, stats);

        return NextResponse.json({
            success: true,
            stats,
        });

    } catch (error: any) {
        console.error('❌ Error calculating stats:', error);
        return NextResponse.json(
            { error: 'Failed to calculate stats', details: error.message },
            { status: 500 }
        );
    }
}
