import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, customerProfiles, managerApplications, businessProfiles, businessApplications } from '@/db/schema';
import { eq, or, and, inArray } from 'drizzle-orm';

// GET /api/business-owner/managers?userId={id}
// Fetch all managers for a business owner (from both applications and profiles)
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

        console.log(`📋 Fetching managers for owner user ID: ${userId}`);

        const numericUserId = parseInt(userId);
        const managerAppsList: any[] = [];
        const profilesList: any[] = [];

        // 1. ✅ FIXED: Get managers from manager_applications with SAFE NULL handling
        // Join BOTH businessProfiles (for approved) AND businessApplications (for pending)
        const managerApps = await db
            .select({
                applicationId: managerApplications.applicationId,
                firstName: managerApplications.managerFirstName,
                lastName: managerApplications.managerLastName,
                email: managerApplications.managerEmail,
                phoneNumber: managerApplications.managerPhone,
                status: managerApplications.status,
                appliedAt: managerApplications.appliedAt,
                businessId: managerApplications.businessId,
                linkedApplicationId: managerApplications.linkedApplicationId,
                // Safe access with optional chaining
                approvedBusinessName: businessProfiles.businessName,
                pendingBusinessName: businessApplications.businessName,
            })
            .from(managerApplications)
            .leftJoin(businessProfiles, eq(managerApplications.businessId, businessProfiles.businessId))
            .leftJoin(businessApplications, eq(managerApplications.linkedApplicationId, businessApplications.applicationId))
            .where(eq(managerApplications.businessOwnerId, numericUserId));

        console.log(`✅ Found ${managerApps.length} manager application(s)`);

        // Transform manager applications with NULL-safe logic
        for (const app of managerApps) {
            // ✅ CRITICAL FIX: Use fallback chain for business name
            const businessName = app.approvedBusinessName || app.pendingBusinessName || 'Pending Setup';

            managerAppsList.push({
                source: 'application',
                applicationId: app.applicationId,
                firstName: app.firstName,
                lastName: app.lastName,
                email: app.email,
                phoneNumber: app.phoneNumber || 'N/A',
                status: app.status,
                businessName: businessName,
                roleType: 'MANAGER',
                appliedAt: app.appliedAt,
            });
        }

        // 2. Get businesses owned by this user
        const ownedBusinesses = await db
            .select({ businessId: businessProfiles.businessId })
            .from(businessProfiles)
            .where(eq(businessProfiles.userId, numericUserId));

        console.log(`✅ User owns ${ownedBusinesses.length} business(es)`);

        // 3. Get approved managers from customer_profiles for owned businesses
        if (ownedBusinesses.length > 0) {
            for (const biz of ownedBusinesses) {
                const approvedManagers = await db
                    .select({
                        userId: customerProfiles.userId,
                        firstName: customerProfiles.firstName,
                        lastName: customerProfiles.lastName,
                        email: customerProfiles.email,
                        phoneNumber: customerProfiles.phoneNumber,
                        roleType: customerProfiles.roleType,
                        businessName: businessProfiles.businessName,
                    })
                    .from(customerProfiles)
                    .leftJoin(businessProfiles, eq(customerProfiles.employerBusinessId, businessProfiles.businessId))
                    .where(
                        and(
                            eq(customerProfiles.employerBusinessId, biz.businessId),
                            eq(customerProfiles.roleType, 'MANAGER' as any)
                        )
                    );

                for (const mgr of approvedManagers) {
                    profilesList.push({
                        source: 'profile',
                        userId: mgr.userId,
                        firstName: mgr.firstName,
                        lastName: mgr.lastName,
                        email: mgr.email,
                        phoneNumber: mgr.phoneNumber || 'N/A',
                        status: 'verified', // Profiles are already approved
                        businessName: mgr.businessName || 'Unknown Business',
                        roleType: mgr.roleType,
                    });
                }
            }
        }

        // 4. ✅ DEDUPLICATION: Merge lists, favoring Profiles over Applications
        const finalManagers: any[] = [...profilesList];
        const profileEmails = new Set(profilesList.map(m => m.email));

        for (const app of managerAppsList) {
            if (!profileEmails.has(app.email)) {
                finalManagers.push(app);
            }
        }

        console.log(`✅ Total managers found (deduplicated): ${finalManagers.length}`);

        return NextResponse.json({
            success: true,
            managers: finalManagers,
            total: finalManagers.length,
        });

    } catch (error: any) {
        console.error('❌ Error fetching owner managers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch managers', details: error.message },
            { status: 500 }
        );
    }
}
