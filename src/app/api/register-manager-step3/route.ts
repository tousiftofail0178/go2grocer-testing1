import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { managerApplications, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/register-manager-step3 - Register manager during business application Step 3
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            applicationId,
            businessOwnerId,
            managerEmail,
            managerPhone,
            managerFirstName,
            managerLastName,
        } = body;

        console.log('📝 Step 3: Registering manager for application:', applicationId);

        // Validate required fields
        if (!applicationId || !businessOwnerId || !managerEmail || !managerPhone || !managerFirstName || !managerLastName) {
            return NextResponse.json(
                { error: 'All manager fields are required' },
                { status: 400 }
            );
        }

        // Verify the business owner exists
        const owner = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, businessOwnerId))
            .limit(1);

        if (owner.length === 0) {
            return NextResponse.json(
                { error: 'Business owner not found' },
                { status: 404 }
            );
        }

        // ✅ TRANSACTION: Ensure no orphaned records
        // Insert manager application linked to pending business application
        try {
            const managerApp = await db
                .insert(managerApplications)
                .values({
                    businessOwnerId,
                    linkedApplicationId: applicationId, // Link to pending business application
                    businessId: null, // Will be populated after business approval
                    managerEmail,
                    managerPhone,
                    managerFirstName,
                    managerLastName,
                    status: 'pending',
                })
                .returning();

            console.log('✅ Manager application created:', managerApp[0].applicationId);

            return NextResponse.json({
                success: true,
                message: 'Manager registered successfully',
                managerApplicationId: managerApp[0].applicationId,
            });
        } catch (dbError: any) {
            console.error('❌ Database insert failed:', dbError);

            // NOTE: If you created a user/profile for the manager in this endpoint,
            // you would need to rollback those changes here.
            // Currently, this endpoint only creates the manager_application record.

            return NextResponse.json(
                { error: 'Failed to create manager application', details: dbError.message },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('❌ Error registering manager:', error);
        return NextResponse.json(
            { error: 'Failed to register manager', details: error.message },
            { status: 500 }
        );
    }
}
