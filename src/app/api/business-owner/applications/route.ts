import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessApplications, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/business-owner/applications - Get current user's business applications
export async function GET(request: NextRequest) {
    try {
        // Get userId from query params (sent from frontend after auth)
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        console.log(`📋 Fetching applications for user ID: ${userId}`);

        // ✅ CRITICAL: Filter by current user ID only
        const applications = await db
            .select({
                applicationId: businessApplications.applicationId,
                userId: businessApplications.userId,
                businessName: businessApplications.businessName,
                legalName: businessApplications.legalName,
                email: businessApplications.email,
                phoneNumber: businessApplications.phoneNumber,
                tradeLicenseNumber: businessApplications.tradeLicenseNumber,
                taxCertificateNumber: businessApplications.taxCertificateNumber,
                status: businessApplications.status,
                appliedAt: businessApplications.appliedAt,
                rejectionReason: businessApplications.rejectionReason,
                reviewedAt: businessApplications.reviewedAt,
            })
            .from(businessApplications)
            .where(eq(businessApplications.userId, parseInt(userId)));

        console.log(`✅ Found ${applications.length} application(s) for user ${userId}`);

        // Transform for frontend
        const transformedApplications = applications.map(app => ({
            id: app.applicationId,
            userId: app.userId,
            businessName: app.businessName,
            legalName: app.legalName,
            email: app.email,
            phone: app.phoneNumber,
            bin: app.tradeLicenseNumber,
            tin: app.taxCertificateNumber,
            status: app.status,
            registeredDate: app.appliedAt,
            rejectionReason: app.rejectionReason,
            reviewedAt: app.reviewedAt,
        }));

        return NextResponse.json({
            success: true,
            registrations: transformedApplications,
            total: transformedApplications.length
        });

    } catch (error: any) {
        console.error('❌ Error fetching user applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications', details: error.message },
            { status: 500 }
        );
    }
}
