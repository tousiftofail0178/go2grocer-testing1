import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { managerApplications, businessProfiles, businessApplications, users } from '@/db/schema';
import { eq, or, isNotNull } from 'drizzle-orm';

// GET /api/admin/manager-requests - Get all pending manager applications
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';

        console.log('📋 Fetching manager applications with status:', status);

        // Fetch manager applications with business/application and requester details
        // This supports BOTH linkedApplicationId (pending) and businessId (approved)
        const requests = await db
            .select({
                requestId: managerApplications.applicationId,
                businessId: managerApplications.businessId,
                linkedApplicationId: managerApplications.linkedApplicationId,
                businessName: businessProfiles.businessName,
                pendingBusinessName: businessApplications.businessName,
                requestedBy: managerApplications.businessOwnerId,
                requesterEmail: users.email,
                firstName: managerApplications.managerFirstName,
                lastName: managerApplications.managerLastName,
                email: managerApplications.managerEmail,
                phoneNumber: managerApplications.managerPhone,
                requestStatus: managerApplications.status,
                createdAt: managerApplications.appliedAt,
            })
            .from(managerApplications)
            .leftJoin(businessProfiles, eq(managerApplications.businessId, businessProfiles.businessId))
            .leftJoin(businessApplications, eq(managerApplications.linkedApplicationId, businessApplications.applicationId))
            .leftJoin(users, eq(managerApplications.businessOwnerId, users.id))
            .where(eq(managerApplications.status, status as any))
            .orderBy(managerApplications.appliedAt);

        // Transform to include the correct business name (from either businessProfiles or businessApplications)
        const transformedRequests = requests.map(req => ({
            ...req,
            businessName: req.businessName || req.pendingBusinessName || 'Unknown Business',
        }));

        console.log(`✅ Found ${transformedRequests.length} manager applications`);

        return NextResponse.json({
            requests: transformedRequests,
            total: transformedRequests.length,
        });

    } catch (error: any) {
        console.error('❌ Error fetching manager applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch manager applications', details: error.message },
            { status: 500 }
        );
    }
}
