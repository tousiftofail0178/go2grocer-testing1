import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, businessProfiles, businessApplications, addresses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// GET /api/admin/registrations - Get business registrations (supports status filter)
export async function GET(request: NextRequest) {
    try {
        // Get status filter from query params
        const searchParams = request.nextUrl.searchParams;
        const statusFilter = searchParams.get('status'); // 'pending', 'rejected', etc.

        // Build the base query
        const baseQuery = db
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
                userEmail: users.email,
                userRole: users.role,
                isVerified: users.isVerified,
                createdAt: users.createdAt,
            })
            .from(businessApplications)
            .leftJoin(users, eq(businessApplications.userId, users.id));

        // Apply status filter
        const registrations = statusFilter
            ? await baseQuery.where(eq(businessApplications.status, statusFilter as any))
            : await baseQuery.where(eq(businessApplications.status, 'pending'));

        console.log(`Found ${registrations.length} ${statusFilter || 'pending'} registrations`);

        // Transform data for frontend
        const transformedRegistrations = registrations.map(reg => ({
            id: reg.applicationId,
            userId: reg.userId,
            businessName: reg.businessName,
            legalName: reg.legalName,
            email: reg.email,
            phone: reg.phoneNumber,
            bin: reg.tradeLicenseNumber,
            tin: reg.taxCertificateNumber,
            tradeLicense: reg.tradeLicenseNumber,
            taxCertificate: reg.taxCertificateNumber,
            status: reg.status,
            registeredDate: reg.appliedAt,
            rejectionReason: reg.rejectionReason,
            reviewedAt: reg.reviewedAt,
            userEmail: reg.userEmail,
            currentRole: reg.userRole,
            isUserVerified: reg.isVerified,
        }));

        return NextResponse.json({
            success: true,
            registrations: transformedRegistrations,
            total: transformedRegistrations.length
        });

    } catch (error: any) {
        console.error('Error fetching pending registrations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch registrations' },
            { status: 500 }
        );
    }
}

// POST /api/admin/registrations - Create new business registration
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('📥 Received registration request:', JSON.stringify(body, null, 2));

        const {
            businessName,
            legalName,
            email,
            phoneNumber,
            // businessAddress not 'address' - supporting both for now, but preferring businessAddress from new form
            businessAddress,
            tradeLicenseNumber,
            taxCertificateNumber,
            licenseExpiryDate,
            ownerId, // Owner's public_id (UUID) from auth store
        } = body;

        // Validate required fields
        if (!businessName || !legalName || !email || !phoneNumber || !tradeLicenseNumber || !taxCertificateNumber || !licenseExpiryDate) {
            console.error('❌ Missing required fields');
            return NextResponse.json(
                { error: 'All fields are required. Please fill in all form fields.' },
                { status: 400 }
            );
        }

        console.log('📝 Creating business registration for:', businessName);

        // Check if ownerId exists - ownerId is now numeric ID
        let numericOwnerId = ownerId;

        if (typeof ownerId === 'string' && !ownerId.match(/^\d+$/)) {
            // If it's not a numeric string, assume it's user ID
            numericOwnerId = parseInt(ownerId);
        }

        // Check if user exists
        const ownerUser = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, numericOwnerId))
            .limit(1);

        if (ownerUser.length === 0) {
            // Create a new user account with business_owner role
            const passwordHash = crypto.createHash('sha256').update('TempPass123!').digest('hex');

            const newUser = await db
                .insert(users)
                .values({
                    email,
                    phoneNumber, // Full phone number including country code
                    role: 'business_owner', // ✅ FIXED: Create as business_owner, not consumer
                    passwordHash,
                    isVerified: false,
                })
                .returning({ id: users.id });

            numericOwnerId = newUser[0].id;
            console.log('✅ Created new business owner user with ID:', numericOwnerId);
        } else {
            numericOwnerId = ownerUser[0].id;
        }

        // Check for existing application
        const existingApplication = await db
            .select()
            .from(businessApplications)
            .where(eq(businessApplications.email, email))
            .limit(1);

        if (existingApplication.length > 0) {
            return NextResponse.json(
                { error: 'An application with this email already exists' },
                { status: 400 }
            );
        }

        // --- Start Transaction for Address + Application ---
        // Using a manual approach for "transaction" logic here since atomic transactions across these steps 
        // are best handled by ensure the first step (address) works before the second.

        let addressId = null;

        // 1. Create Address Record
        if (businessAddress) {
            try {
                // Ensure custom area is handled if "Other" logic was used on frontend
                // The frontend AddressFormFields component handles standardizing "area" vs "customArea"
                // logic: if businessAddress.area is "Other", we assume CustomArea text is passed, 
                // but checking the type definition, businessAddress likely has { street, area, city, postalCode, customArea? }

                // If the frontend passed "Other" as area, we should look for customArea or expect area to be the custom string already.
                // Based on previous verification, AddressFormFields usually handles this upstream or we check here.
                // Let's safe-guard:

                let finalArea = businessAddress.area;
                if (finalArea === 'Other' && businessAddress.customArea) {
                    finalArea = businessAddress.customArea;
                }

                // Import 'addresses' is needed at top of file, ensuring it is imported
                // Importing in this scope just to be explicit about what we are doing if not already available
                // But generally 'db/schema' exports 'addresses'.

                const [newAddress] = await db.insert(addresses).values({
                    streetAddress: businessAddress.street,
                    area: finalArea, // Use the resolved area name
                    city: businessAddress.city || 'Dhaka',
                    postalCode: businessAddress.postalCode,
                    country: 'Bangladesh',
                }).returning({ id: addresses.id });

                addressId = newAddress.id;
                console.log('✅ Created new address record:', addressId);
            } catch (err: any) {
                console.error('❌ Failed to create address:', err);
                // If address creation fails, we SHOULD FAIL the whole request to maintain consistency
                return NextResponse.json(
                    { error: 'Failed to save address details. Please verify your address.' },
                    { status: 500 }
                );
            }
        }

        // 2. Create Business Application linked to Address
        const newApplication = await db
            .insert(businessApplications)
            .values({
                userId: numericOwnerId,
                businessName,
                legalName,
                addressId: addressId, // Link to the new address
                email,
                phoneNumber,
                tradeLicenseNumber,
                taxCertificateNumber,
                status: 'pending', // ✅ Awaits admin approval
            })
            .returning();

        console.log('✅ Business application submitted (pending approval):', newApplication[0].applicationId);

        return NextResponse.json({
            success: true,
            applicationId: newApplication[0].applicationId,
            message: 'Business registration submitted successfully. Awaiting admin approval.',
        });

    } catch (error: any) {
        console.error('Error creating business registration:', error);
        return NextResponse.json(
            { error: 'Failed to create business registration', details: error.message },
            { status: 500 }
        );
    }
}
