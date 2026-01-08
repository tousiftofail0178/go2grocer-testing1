import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessApplications, businessProfiles, vendorDocuments } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/admin/business-applications/[id]/approve
// Approves a business application and creates business profile
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const applicationId = parseInt(params.id);

        // 1. Get application (using business_applications table)
        const [application] = await db
            .select()
            .from(businessApplications)
            .where(eq(businessApplications.applicationId, applicationId))
            .limit(1);

        if (!application) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        if (application.status === 'verified') {
            return NextResponse.json(
                { error: 'Application already approved' },
                { status: 400 }
            );
        }

        // 2. Create business profile from application
        const [newBusiness] = await db
            .insert(businessProfiles)
            .values({
                ownerId: application.userId, // Required: Business Owner FK
                userId: application.userId, // Backward compatibility
                businessName: application.businessName || 'New Business',
                legalName: application.businessName || 'New Business',
                addressId: application.addressId, // FIX: Map addressId
                phoneNumber: application.phoneNumber,
                email: application.email,
                tradeLicenseNumber: application.tradeLicenseNumber || 'PENDING',
                taxCertificateNumber: application.taxCertificateNumber || 'PENDING',
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                verificationStatus: 'verified',
            })
            .returning();

        // 3. Update application status
        await db
            .update(businessApplications)
            .set({
                status: 'verified', // status column in businessApplications is 'status', not 'applicationStatus'
            })
            .where(eq(businessApplications.applicationId, applicationId));

        console.log('Business approved:', {
            applicationId,
            businessId: newBusiness.businessId,
            userId: newBusiness.userId,
        });

        return NextResponse.json({
            success: true,
            businessId: newBusiness.businessId,
            message: 'Business application approved and profile created',
        });

    } catch (error: any) {
        console.error('Error approving business application:', error);
        return NextResponse.json(
            { error: 'Failed to approve application', details: error.message },
            { status: 500 }
        );
    }
}
