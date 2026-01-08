import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { managerApplications, businessProfiles, businessApplications, users, addresses } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

// POST /api/business-profile/managers/request - Submit manager request
export async function POST(request: NextRequest) {
    try {
        const {
            businessId,
            requestedByUserId,
            firstName,
            lastName,
            email,
            phone,
            password,
            managerAddress, // Structured address object
        } = await request.json();

        console.log('📝 Manager request received:', { businessId, requestedByUserId, email });

        // Validation
        if (!businessId || !requestedByUserId || !firstName || !lastName || !email || !phone || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // ✅ CRITICAL FIX: Parse businessId as integer
        const numericBusinessId = parseInt(businessId);
        if (isNaN(numericBusinessId)) {
            return NextResponse.json(
                { error: 'Invalid business ID' },
                { status: 400 }
            );
        }

        // Convert requestedByUserId to numeric user ID if needed
        let numericRequesterId = requestedByUserId;

        if (typeof requestedByUserId === 'string' && requestedByUserId.includes('-')) {
            // It's a UUID/publicId, convert to numeric ID
            const [requester] = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.publicId, requestedByUserId))
                .limit(1);

            if (!requester) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }
            numericRequesterId = requester.id;
        } else {
            numericRequesterId = parseInt(requestedByUserId);
        }

        console.log('🔍 Parsed values:', {
            businessId: numericBusinessId,
            requesterId: numericRequesterId,
            types: { businessId: typeof numericBusinessId, requesterId: typeof numericRequesterId }
        });

        // ✅ SMART CHECK: Verify ownership in EITHER businessProfiles OR businessApplications
        // Check approved businesses first
        const [approvedBusiness] = await db
            .select()
            .from(businessProfiles)
            .where(eq(businessProfiles.businessId, numericBusinessId))
            .limit(1);

        let isOwner = false;
        let businessType = '';

        if (approvedBusiness) {
            isOwner = approvedBusiness.ownerId === numericRequesterId;
            businessType = 'approved';
            console.log('✅ Found approved business:', {
                businessId: numericBusinessId,
                ownerId: approvedBusiness.ownerId,
                requesterId: numericRequesterId,
                match: isOwner
            });
        } else {
            // Check pending applications
            const [pendingApplication] = await db
                .select()
                .from(businessApplications)
                .where(eq(businessApplications.applicationId, numericBusinessId))
                .limit(1);

            if (pendingApplication) {
                isOwner = pendingApplication.userId === numericRequesterId;
                businessType = 'pending';
                console.log('✅ Found pending application:', {
                    applicationId: numericBusinessId,
                    userId: pendingApplication.userId,
                    requesterId: numericRequesterId,
                    match: isOwner
                });
            } else {
                return NextResponse.json(
                    { error: 'Business not found' },
                    { status: 404 }
                );
            }
        }

        if (!isOwner) {
            console.error('❌ Ownership check failed for', businessType, 'business');
            return NextResponse.json(
                { error: 'You do not own this business' },
                { status: 403 }
            );
        }

        console.log(`✅ Ownership verified for ${businessType} business`);

        // Check if email already exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: 'Email already in use' },
                { status: 400 }
            );
        }

        // --- NEW: Create Address Record to link with Manager Application ---
        let addressId = null;
        if (managerAddress) {
            try {
                // Ensure custom area is handled if "Other" logic was used on frontend

                let finalArea = managerAddress.area;
                if (finalArea === 'Other' && managerAddress.customArea) {
                    finalArea = managerAddress.customArea;
                }

                // Import 'addresses' is needed at top of file

                const [newAddress] = await db.insert(addresses).values({
                    streetAddress: managerAddress.street,
                    area: finalArea, // Use resolved area
                    city: managerAddress.city || 'Dhaka',
                    postalCode: managerAddress.postalCode,
                    country: 'Bangladesh',
                }).returning({ id: addresses.id });

                addressId = newAddress.id;
                console.log('✅ Created new address record for manager:', addressId);
            } catch (err: any) {
                console.error('❌ Failed to create manager address:', err);
                return NextResponse.json(
                    { error: 'Failed to save address details' },
                    { status: 500 }
                );
            }
        }

        // ✅ FIXED: Insert into manager_applications (not manager_requests)
        // Link via business_id (if approved) or linked_application_id (if pending)
        const [newManagerApp] = await db
            .insert(managerApplications)
            .values({
                businessOwnerId: numericRequesterId,
                businessId: businessType === 'approved' ? numericBusinessId : null,
                linkedApplicationId: businessType === 'pending' ? numericBusinessId : null,
                addressId: addressId, // Link formatted address
                managerFirstName: firstName,
                managerLastName: lastName,
                managerEmail: email,
                managerPhone: phone,
                status: 'pending',
            })
            .returning();

        console.log('✅ Manager application created:', newManagerApp.applicationId);

        return NextResponse.json({
            success: true,
            applicationId: newManagerApp.applicationId,
            message: 'Manager request submitted for admin approval',
        });

    } catch (error: any) {
        console.error('❌ Error creating manager request:', error);
        return NextResponse.json(
            { error: 'Failed to create manager request', details: error.message },
            { status: 500 }
        );
    }
}
