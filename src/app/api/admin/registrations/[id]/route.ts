import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, businessProfiles, businessApplications, managerApplications, customerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH /api/admin/registrations/[id] - Reject application with feedback
export async function PATCH(
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

        const body = await request.json();

        // Check if this is a rejection action
        if (body.action === 'reject') {
            const { reason } = body;

            if (!reason || reason.trim().length === 0) {
                return NextResponse.json(
                    { error: 'Rejection reason is required' },
                    { status: 400 }
                );
            }

            console.log(`⚠️ Rejecting application ${applicationId} with reason: ${reason}`);

            // Fetch application to get user email
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

            // Update status to 'rejected' instead of deleting
            await db
                .update(businessApplications)
                .set({
                    status: 'rejected',
                    rejectionReason: reason,
                    reviewedAt: new Date(),
                })
                .where(eq(businessApplications.applicationId, applicationId));

            console.log(`✅ Application ${applicationId} marked as rejected`);

            // Send email notification to business owner
            try {
                const { sendRejectionEmail } = await import('@/lib/email');
                await sendRejectionEmail({
                    to: app.email,
                    businessName: app.businessName,
                    reason: reason,
                });
                console.log(`📧 Rejection email sent to ${app.email}`);
            } catch (emailError) {
                console.error('Failed to send rejection email:', emailError);
                // Don't fail the request if email fails
            }

            return NextResponse.json({
                success: true,
                message: 'Application rejected successfully',
            });
        }

        // Check if this is a reopen action (move rejected back to pending)
        if (body.action === 'reopen') {
            console.log(`🔄 Reopening application ${applicationId}`);

            // Fetch application to verify it exists and is rejected
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

            if (app.status !== 'rejected') {
                return NextResponse.json(
                    { error: 'Only rejected applications can be reopened' },
                    { status: 400 }
                );
            }

            // Update status back to 'pending'
            await db
                .update(businessApplications)
                .set({
                    status: 'pending',
                    rejectionReason: null, // Clear rejection reason
                    resubmittedAt: new Date(), // Track when it was reopened
                })
                .where(eq(businessApplications.applicationId, applicationId));

            console.log(`✅ Application ${applicationId} reopened and moved back to pending`);

            return NextResponse.json({
                success: true,
                message: 'Application reopened successfully',
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );

    } catch (error: any) {
        console.error('Error rejecting application:', error);
        return NextResponse.json(
            { error: 'Failed to reject application', details: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/admin/registrations/[id] - Approve business application
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

        const body = await request.json();
        const { action, role } = body;

        if (action !== 'approve') {
            return NextResponse.json(
                { error: 'Use PATCH method for rejection' },
                { status: 400 }
            );
        }

        // Validate role for approval
        if (!role || !['business_owner', 'business_manager'].includes(role)) {
            return NextResponse.json(
                { error: 'Valid role required for approval (business_owner or business_manager)' },
                { status: 400 }
            );
        }

        // Fetch from business_applications
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

        console.log(`✅ Approving application ${applicationId} for user ${app.userId}`);

        // ✅ SMART APPROVAL: Check if user is already a business owner
        const existingUser = await db
            .select({ role: users.role, isVerified: users.isVerified })
            .from(users)
            .where(eq(users.id, app.userId))
            .limit(1);

        const isExistingOwner = existingUser.length > 0 &&
            existingUser[0].role === 'business_owner' &&
            existingUser[0].isVerified === true; // ✅ FIX: Only skip if ALREADY verified

        if (isExistingOwner) {
            console.log(`✅ User ${app.userId} is already a verified business owner. Skipping role update.`);
        } else {
            // 1. Update user role and verification status
            await db
                .update(users)
                .set({
                    role: 'business_owner',
                    isVerified: true,
                })
                .where(eq(users.id, app.userId));

            console.log(`✅ Updated user ${app.userId} to verified business_owner`);
        }

        // 2. CREATE business profile from application data (always done)
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const newBusiness = await db
            .insert(businessProfiles)
            .values({
                ownerId: app.userId,
                userId: app.userId,
                businessName: app.businessName,
                legalName: app.legalName,
                email: app.email,
                phoneNumber: app.phoneNumber,
                tradeLicenseNumber: app.tradeLicenseNumber,
                taxCertificateNumber: app.taxCertificateNumber,
                expiryDate: expiryDate.toISOString().split('T')[0],
                verificationStatus: 'verified',
                verifiedAt: new Date(),
            })
            .returning();

        console.log(`✅ Created business profile: ${newBusiness[0].businessId}`);

        // 2a. LINK Owner Profile to Business (The Gap Fix)
        await db
            .update(customerProfiles)
            .set({
                employerBusinessId: newBusiness[0].businessId
            })
            .where(eq(customerProfiles.userId, app.userId));

        console.log(`✅ Linked Owner ${app.userId} to Business ${newBusiness[0].businessId}`);

        // 3. Update application status
        await db
            .update(businessApplications)
            .set({
                status: 'verified',
                reviewedAt: new Date(),
            })
            .where(eq(businessApplications.applicationId, applicationId));

        console.log(`✅ Application ${applicationId} approved and business profile created`);

        // 4. Migrate linked manager applications (if any)
        // Find manager applications that are linked to this pending business application
        const linkedManagerApps = await db
            .select()
            .from(managerApplications)
            .where(eq(managerApplications.linkedApplicationId, applicationId));

        if (linkedManagerApps.length > 0) {
            console.log(`🔄 Found ${linkedManagerApps.length} linked manager application(s), migrating...`);

            // Update each manager application to link to the new business
            await db
                .update(managerApplications)
                .set({
                    businessId: newBusiness[0].businessId, // Set the actual business ID
                    linkedApplicationId: null, // Clear the pending application link (optional: keep for history)
                })
                .where(eq(managerApplications.linkedApplicationId, applicationId));

            console.log(`✅ Migrated ${linkedManagerApps.length} manager application(s) to business ${newBusiness[0].businessId}`);
        }

        return NextResponse.json({
            success: true,
            message: 'Application approved successfully',
            businessId: newBusiness[0].businessId,
            migratedManagers: linkedManagerApps.length,
        });

    } catch (error: any) {
        console.error('Error processing application:', error);
        return NextResponse.json(
            { error: 'Failed to process application', details: error.message },
            { status: 500 }
        );
    }
}
