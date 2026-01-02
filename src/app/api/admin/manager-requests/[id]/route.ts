import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { managerApplications, users, customerProfiles, businessProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// ⚠️ DEPRECATED: managerRequests table is no longer used
// ✅ NOW USING: managerApplications table

// PUT /api/admin/manager-requests/[id] - Approve or reject manager application
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const applicationId = parseInt(id);
        const { action, adminUserId } = await request.json();

        console.log(`🔍 Processing manager application ${applicationId}, action: ${action}`);

        if (!action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

        // ✅ FIXED: Query managerApplications instead of managerRequests
        const [managerApp] = await db
            .select()
            .from(managerApplications)
            .where(eq(managerApplications.applicationId, applicationId))
            .limit(1);

        if (!managerApp) {
            console.error('❌ Manager application not found:', applicationId);
            console.error('Searched in manager_applications table');
            return NextResponse.json(
                { error: 'Manager request not found' },
                { status: 404 }
            );
        }

        console.log('✅ Found manager application:', {
            id: managerApp.applicationId,
            email: managerApp.managerEmail,
            status: managerApp.status,
            businessId: managerApp.businessId,
            linkedApplicationId: managerApp.linkedApplicationId,
        });

        if (managerApp.status !== 'pending') {
            return NextResponse.json(
                { error: 'Request already processed' },
                { status: 400 }
            );
        }

        // AdminUserId is expected to be numeric ID directly
        let numericAdminId = null;
        if (adminUserId) {
            numericAdminId = parseInt(adminUserId);
        }

        if (action === 'approve') {
            console.log('✅ Approving manager application...');

            // Check if user with this email already exists
            const existingUsers = await db
                .select()
                .from(users)
                .where(eq(users.email, managerApp.managerEmail))
                .limit(1);

            let managerId: number;

            if (existingUsers.length > 0) {
                console.log('👤 User already exists with ID:', existingUsers[0].id);
                managerId = existingUsers[0].id;

                // Update role if needed
                if (existingUsers[0].role !== 'business_manager') {
                    await db
                        .update(users)
                        .set({
                            role: 'business_manager',
                            isVerified: true
                        })
                        .where(eq(users.id, managerId));
                    console.log('✅ Updated user role to business_manager');
                }
            } else {
                // Create user account
                // TODO: In production, use proper password hashing (bcrypt)
                const passwordHash = crypto.createHash('sha256').update('tempPassword123').digest('hex');

                const newUsers = await db
                    .insert(users)
                    .values({
                        email: managerApp.managerEmail,
                        phoneNumber: managerApp.managerPhone, // Already includes country code
                        passwordHash,
                        role: 'business_manager',
                        isVerified: true,
                    })
                    .returning();

                if (!newUsers || newUsers.length === 0) {
                    throw new Error('Failed to create user account');
                }

                managerId = newUsers[0].id;
                console.log('👤 User account created:', managerId);
            }

            // Determine the actual business_id
            let actualBusinessId = managerApp.businessId;

            // If linked to pending application, we can't assign business yet
            if (!actualBusinessId && managerApp.linkedApplicationId) {
                console.log('ℹ️ Manager linked to pending application, will assign business after approval');
            }

            // Create or update customer profile
            try {
                // Check if profile exists
                const existingProfile = await db
                    .select()
                    .from(customerProfiles)
                    .where(eq(customerProfiles.userId, managerId))
                    .limit(1);

                if (existingProfile.length === 0) {
                    // Create new profile
                    await db
                        .insert(customerProfiles)
                        .values({
                            userId: managerId,
                            firstName: managerApp.managerFirstName,
                            lastName: managerApp.managerLastName,
                            phoneNumber: managerApp.managerPhone,
                            email: managerApp.managerEmail,
                            employerBusinessId: actualBusinessId, // Can be null for pending
                            roleType: 'MANAGER',
                        });
                    console.log('✅ Customer profile created');
                } else {
                    // Update existing profile
                    await db
                        .update(customerProfiles)
                        .set({
                            employerBusinessId: actualBusinessId,
                            roleType: 'MANAGER',
                        })
                        .where(eq(customerProfiles.userId, managerId));
                    console.log('✅ Customer profile updated');
                }
            } catch (profileError: any) {
                console.error('❌ Error with customer profile:', profileError.message);
                // Continue anyway - profile creation is not critical
            }

            // ✅ FIXED: Update managerApplications status
            await db
                .update(managerApplications)
                .set({
                    status: 'verified',
                    reviewedAt: new Date(),
                })
                .where(eq(managerApplications.applicationId, applicationId));

            console.log('✅ Manager application approved successfully');

            return NextResponse.json({
                success: true,
                message: 'Manager request approved',
                managerId: managerId,
            });

        } else if (action === 'reject') {
            console.log('❌ Rejecting manager application...');

            // ✅ FIXED: Update managerApplications status
            await db
                .update(managerApplications)
                .set({
                    status: 'rejected',
                    reviewedAt: new Date(),
                })
                .where(eq(managerApplications.applicationId, applicationId));

            return NextResponse.json({
                success: true,
                message: 'Manager request rejected',
            });
        }

    } catch (error: any) {
        console.error('❌ Error processing manager request:', error);
        return NextResponse.json(
            { error: 'Failed to process request', details: error.message },
            { status: 500 }
        );
    }
}
