import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, customerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/customers/[id] - Get single customer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customerId = parseInt(id);

        if (isNaN(customerId)) {
            return NextResponse.json(
                { error: 'Invalid customer ID' },
                { status: 400 }
            );
        }

        // Fetch customer with user data
        const customerData = await db
            .select({
                profileId: customerProfiles.profileId,
                userId: customerProfiles.userId,
                firstName: customerProfiles.firstName,
                lastName: customerProfiles.lastName,
                email: customerProfiles.email,
                phoneNumber: customerProfiles.phoneNumber,
                dateOfBirth: customerProfiles.dateOfBirth,
                loyaltyPoints: customerProfiles.loyaltyPoints,
                userEmail: users.email,
                createdAt: users.createdAt,
            })
            .from(customerProfiles)
            .leftJoin(users, eq(customerProfiles.userId, users.id))
            .where(eq(customerProfiles.profileId, customerId))
            .limit(1);

        if (customerData.length === 0) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        const customer = customerData[0];

        return NextResponse.json({
            success: true,
            customer: {
                id: customer.profileId,
                userId: customer.userId,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phoneNumber,
                dateOfBirth: customer.dateOfBirth,
                loyaltyPoints: customer.loyaltyPoints,
                joinDate: customer.createdAt,
            }
        });

    } catch (error: any) {
        console.error('Error fetching customer:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        );
    }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customerId = parseInt(id);

        if (isNaN(customerId)) {
            return NextResponse.json(
                { error: 'Invalid customer ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { firstName, lastName, email, phone, dateOfBirth } = body;

        // Validation
        if (!firstName || !lastName || !email || !phone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if customer exists
        const existingCustomer = await db
            .select()
            .from(customerProfiles)
            .where(eq(customerProfiles.profileId, customerId))
            .limit(1);

        if (existingCustomer.length === 0) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        // Check if email is being changed and if new email already exists
        if (email !== existingCustomer[0].email) {
            const emailExists = await db
                .select()
                .from(customerProfiles)
                .where(eq(customerProfiles.email, email))
                .limit(1);

            if (emailExists.length > 0) {
                return NextResponse.json(
                    { error: 'Email already exists' },
                    { status: 400 }
                );
            }
        }

        // Check if phone is being changed and if new phone already exists
        if (phone !== existingCustomer[0].phoneNumber) {
            const phoneExists = await db
                .select()
                .from(customerProfiles)
                .where(eq(customerProfiles.phoneNumber, phone))
                .limit(1);

            if (phoneExists.length > 0) {
                return NextResponse.json(
                    { error: 'Phone number already exists' },
                    { status: 400 }
                );
            }
        }

        // Update customer profile
        const [updatedCustomer] = await db
            .update(customerProfiles)
            .set({
                firstName,
                lastName,
                email,
                phoneNumber: phone,
                dateOfBirth: dateOfBirth || null,
            })
            .where(eq(customerProfiles.profileId, customerId))
            .returning();

        // Update user email if changed
        if (email !== existingCustomer[0].email) {
            await db
                .update(users)
                .set({ email })
                .where(eq(users.id, existingCustomer[0].userId));
        }

        return NextResponse.json({
            success: true,
            customer: {
                id: updatedCustomer.profileId,
                userId: updatedCustomer.userId,
                firstName: updatedCustomer.firstName,
                lastName: updatedCustomer.lastName,
                email: updatedCustomer.email,
                phone: updatedCustomer.phoneNumber,
                dateOfBirth: updatedCustomer.dateOfBirth,
                loyaltyPoints: updatedCustomer.loyaltyPoints,
            }
        });

    } catch (error: any) {
        console.error('Error updating customer:', error);

        // Handle PostgreSQL unique constraint violations
        if (error.code === '23505' || error.message?.includes('duplicate key value')) {
            if (error.message?.includes('email')) {
                return NextResponse.json(
                    { error: 'This email address is already registered' },
                    { status: 400 }
                );
            }
            if (error.message?.includes('phone') || error.message?.includes('phone_number')) {
                return NextResponse.json(
                    { error: 'This phone number is already registered' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        );
    }
}
