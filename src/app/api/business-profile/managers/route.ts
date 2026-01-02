import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, customerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// GET /api/business-profile/managers?businessId={id}
// Fetch all managers for a specific business
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json(
                { error: 'Business ID is required' },
                { status: 400 }
            );
        }

        console.log('📋 Fetching managers for business:', businessId);

        // Fetch managers with MANAGER roleType for this business
        const managers = await db
            .select({
                profileId: customerProfiles.profileId,
                userId: customerProfiles.userId,
                firstName: customerProfiles.firstName,
                lastName: customerProfiles.lastName,
                email: customerProfiles.email,
                phoneNumber: customerProfiles.phoneNumber,
                roleType: customerProfiles.roleType,
            })
            .from(customerProfiles)
            .where(eq(customerProfiles.employerBusinessId, parseInt(businessId)));

        console.log(`✅ Found ${managers.length} managers`);

        return NextResponse.json({
            managers: managers,
            total: managers.length,
        });

    } catch (error: any) {
        console.error('❌ Error fetching managers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch managers', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/business-profile/managers
// Creates a new manager for a business
export async function POST(request: NextRequest) {
    try {
        const {
            businessId,
            email,
            firstName,
            lastName,
            phone,
            password,
        } = await request.json();

        // Validation
        if (!businessId || !email || !firstName || !lastName || !phone || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Hash password (using simple crypto for now - in production use bcrypt)
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        // 1. Create user account
        const [newUser] = await db
            .insert(users)
            .values({
                publicId: crypto.randomUUID(),
                email: email,
                phoneCountryCode: '+880',
                phoneNumber: phone,
                passwordHash: passwordHash,
                role: 'business_manager',
                isVerified: true,
            })
            .returning();

        // 2. Create customer profile with manager role and business link
        await db
            .insert(customerProfiles)
            .values({
                userId: newUser.id,
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phone,
                email: email,
                roleType: 'MANAGER',
                employerBusinessId: businessId,
            });

        console.log('Manager created:', {
            userId: newUser.publicId,
            businessId,
            email,
        });

        return NextResponse.json({
            success: true,
            userId: newUser.publicId,
            message: 'Manager created successfully',
        });

    } catch (error: any) {
        console.error('Error creating manager:', error);
        return NextResponse.json(
            { error: 'Failed to create manager', details: error.message },
            { status: 500 }
        );
    }
}
