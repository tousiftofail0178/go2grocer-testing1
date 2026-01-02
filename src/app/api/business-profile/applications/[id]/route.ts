import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessApplications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/business-profile/applications/[id] - Fetch application for editing
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const applicationId = parseInt(id);

        if (isNaN(applicationId)) {
            return NextResponse.json(
                { error: 'Invalid application ID' },
                { status: 400 }
            );
        }

        const application = await db
            .select()
            .from(businessApplications)
            .where(eq(businessApplications.applicationId, applicationId))
            .limit(1);

        if (application.length === 0) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        const app = application[0];

        // Only allow editing if status is 'rejected'
        if (app.status !== 'rejected') {
            return NextResponse.json(
                { error: 'Only rejected applications can be edited' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            application: app,
        });

    } catch (error: any) {
        console.error('Error fetching application:', error);
        return NextResponse.json(
            { error: 'Failed to fetch application', details: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/business-profile/applications/[id]/resubmit - Update and resubmit application
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const applicationId = parseInt(id);

        if (isNaN(applicationId)) {
            return NextResponse.json(
                { error: 'Invalid application ID' },
                { status: 400 }
            );
        }

        const updateData = await request.json();

        // Verify application exists and is rejected
        const existing = await db
            .select()
            .from(businessApplications)
            .where(eq(businessApplications.applicationId, applicationId))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        if (existing[0].status !== 'rejected') {
            return NextResponse.json(
                { error: 'Only rejected applications can be resubmitted' },
                { status: 403 }
            );
        }

        // Update application with new data and reset status to pending
        await db
            .update(businessApplications)
            .set({
                ...updateData,
                status: 'pending',
                rejectionReason: null,
                resubmittedAt: new Date(),
            })
            .where(eq(businessApplications.applicationId, applicationId));

        console.log(`✅ Application ${applicationId} resubmitted successfully`);

        return NextResponse.json({
            success: true,
            message: 'Application resubmitted successfully',
        });

    } catch (error: any) {
        console.error('Error resubmitting application:', error);
        return NextResponse.json(
            { error: 'Failed to resubmit application', details: error.message },
            { status: 500 }
        );
    }
}
