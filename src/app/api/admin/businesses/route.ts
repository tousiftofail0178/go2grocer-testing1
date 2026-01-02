import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { businessProfiles, users, orders, orderItems } from '@/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

// GET /api/admin/businesses - List all businesses with performance metrics
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        console.log('Fetching businesses, search:', search);

        // Fetch all businesses with their associated user info
        const businesses = await db
            .select({
                businessId: businessProfiles.businessId,
                userId: businessProfiles.userId,
                businessName: businessProfiles.businessName,
                legalName: businessProfiles.legalName,
                phoneNumber: businessProfiles.phoneNumber,
                email: businessProfiles.email,
                tradeLicenseNumber: businessProfiles.tradeLicenseNumber,
                taxCertificateNumber: businessProfiles.taxCertificateNumber,
                expiryDate: businessProfiles.expiryDate,
                verificationStatus: businessProfiles.verificationStatus,
                verifiedAt: businessProfiles.verifiedAt,
                userEmail: users.email,
                userRole: users.role,
                userCreatedAt: users.createdAt,
            })
            .from(businessProfiles)
            .leftJoin(users, eq(businessProfiles.userId, users.id))
            .orderBy(desc(businessProfiles.businessId));

        // Transform businesses data (simplified  without order stats for now)
        const businessStats = businesses.map((business) => ({
            id: business.businessId,
            businessName: business.businessName,
            legalName: business.legalName,
            email: business.email,
            phone: business.phoneNumber,
            tradeLicense: business.tradeLicenseNumber,
            taxCertificate: business.taxCertificateNumber,
            expiryDate: business.expiryDate,
            status: business.verificationStatus,
            verifiedAt: business.verifiedAt,
            userId: business.userId,
            userEmail: business.userEmail,
            userRole: business.userRole,
            joinDate: business.userCreatedAt,
            totalOrders: 0, // Simplified for now
            totalRevenue: 0, // Simplified for now
        }));

        // Calculate performance metrics
        const totalBusinesses = businessStats.length;
        const totalRevenue = 0;
        const totalOrders = 0;

        // Top performers (by revenue) - all zeros for now
        const topPerformers = businessStats.slice(0, 5);

        return NextResponse.json({
            businesses: businessStats,
            metrics: {
                totalBusinesses,
                totalRevenue,
                totalOrders,
                averageOrderValue: 0,
            },
            topPerformers,
        });

    } catch (error: any) {
        console.error('Error fetching businesses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch businesses', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/admin/businesses - Create new business
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Creating new business:', body);

        const {
            userId,
            businessName,
            legalName,
            phoneNumber,
            email,
            tradeLicenseNumber,
            taxCertificateNumber,
            expiryDate,
        } = body;

        // Validation
        if (!userId || !businessName || !legalName || !phoneNumber || !email || !tradeLicenseNumber || !taxCertificateNumber || !expiryDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (existingUser.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if business already exists for this user
        const existingBusiness = await db
            .select()
            .from(businessProfiles)
            .where(eq(businessProfiles.userId, userId))
            .limit(1);

        if (existingBusiness.length > 0) {
            return NextResponse.json(
                { error: 'Business profile already exists for this user' },
                { status: 400 }
            );
        }

        // Create business profile
        const [newBusiness] = await db
            .insert(businessProfiles)
            .values({
                userId,
                businessName,
                legalName,
                phoneNumber,
                email,
                tradeLicenseNumber,
                taxCertificateNumber,
                expiryDate,
                verificationStatus: 'pending',
            })
            .returning();

        console.log('Created business:', newBusiness.businessId);

        return NextResponse.json({
            success: true,
            business: {
                id: newBusiness.businessId,
                businessName: newBusiness.businessName,
                legalName: newBusiness.legalName,
                email: newBusiness.email,
                phone: newBusiness.phoneNumber,
                status: newBusiness.verificationStatus,
            },
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating business:', error);

        // Handle PostgreSQL unique constraint violations
        if (error.code === '23505' || error.message?.includes('duplicate key value')) {
            if (error.message?.includes('email')) {
                return NextResponse.json(
                    { error: 'This email address is already registered' },
                    { status: 400 }
                );
            }
            if (error.message?.includes('phone')) {
                return NextResponse.json(
                    { error: 'This phone number is already registered' },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: 'A business with these details already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create business. Please try again.' },
            { status: 500 }
        );
    }
}
