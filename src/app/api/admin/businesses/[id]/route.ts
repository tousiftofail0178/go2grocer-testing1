import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/admin/businesses/[id] - Update business
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const businessId = parseInt(params.id);
        const body = await request.json();

        console.log('Updating business:', businessId, body);

        const {
            businessName,
            legalName,
            phoneNumber,
            email,
            tradeLicenseNumber,
            taxCertificateNumber,
            expiryDate,
            verificationStatus,
        } = body;

        // Check if business exists
        const existing = await db
            .select()
            .from(businessProfiles)
            .where(eq(businessProfiles.businessId, businessId))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            );
        }

        // Update business
        const [updatedBusiness] = await db
            .update(businessProfiles)
            .set({
                businessName: businessName || existing[0].businessName,
                legalName: legalName || existing[0].legalName,
                phoneNumber: phoneNumber || existing[0].phoneNumber,
                email: email || existing[0].email,
                tradeLicenseNumber: tradeLicenseNumber || existing[0].tradeLicenseNumber,
                taxCertificateNumber: taxCertificateNumber || existing[0].taxCertificateNumber,
                expiryDate: expiryDate || existing[0].expiryDate,
                verificationStatus: verificationStatus || existing[0].verificationStatus,
            })
            .where(eq(businessProfiles.businessId, businessId))
            .returning();

        return NextResponse.json({
            success: true,
            business: updatedBusiness,
        });

    } catch (error: any) {
        console.error('Error updating business:', error);
        return NextResponse.json(
            { error: 'Failed to update business', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/businesses/[id] - Delete business
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const businessId = parseInt(params.id);

        console.log('Deleting business:', businessId);

        // Check if business exists
        const existing = await db
            .select()
            .from(businessProfiles)
            .where(eq(businessProfiles.businessId, businessId))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json(
                { error: 'Business not found' },
                { status: 404 }
            );
        }

        // Delete business
        await db
            .delete(businessProfiles)
            .where(eq(businessProfiles.businessId, businessId));

        return NextResponse.json({
            success: true,
            message: 'Business deleted successfully',
        });

    } catch (error: any) {
        console.error('Error deleting business:', error);
        return NextResponse.json(
            { error: 'Failed to delete business', details: error.message },
            { status: 500 }
        );
    }
}
