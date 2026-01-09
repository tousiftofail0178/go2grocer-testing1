import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, customerProfiles } from '@/db/schema';
import { eq, or, ilike, sql, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// GET /api/customers - List all customers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        console.log('Fetching customers, search:', search);

        // Fetch customers with user data
        let query = db
            .select({
                profileId: customerProfiles.userId, // Schema uses userId as PK
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
            .orderBy(desc(customerProfiles.userId));

        // Apply search filter if provided
        if (search) {
            query = query.where(
                or(
                    ilike(customerProfiles.firstName, `%${search}%`),
                    ilike(customerProfiles.lastName, `%${search}%`),
                    ilike(customerProfiles.email, `%${search}%`),
                    ilike(customerProfiles.phoneNumber, `%${search}%`)
                )
            ) as any;
        }

        const customers = await query;

        console.log(`Found ${customers.length} customers`);

        // Transform data for frontend
        const transformedCustomers = customers.map(customer => ({
            id: customer.profileId, // Mapped from userId above
            userId: customer.userId,
            name: `${customer.firstName} ${customer.lastName}`,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phoneNumber,
            dateOfBirth: customer.dateOfBirth,
            loyaltyPoints: customer.loyaltyPoints || 0,
            joinDate: customer.createdAt,
            role: 'consumer', // All customers are consumers
            // These would come from orders table in real implementation
            totalOrders: 0,
            totalSpent: 0,
            status: 'active'
        }));

        return NextResponse.json({
            customers: transformedCustomers,
            total: transformedCustomers.length
        });

    } catch (error: any) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Creating new customer:', body);

        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            dateOfBirth,
            nidPassportNumber,
            role = 'consumer',
        } = body;

        // Validation
        if (!firstName || !lastName || !email || !phone || !password) {
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
                { error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Check if phone already exists
        const existingPhone = await db
            .select()
            .from(customerProfiles)
            .where(eq(customerProfiles.phoneNumber, phone))
            .limit(1);

        if (existingPhone.length > 0) {
            return NextResponse.json(
                { error: 'Phone number already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Extract country code and phone number (default to +880 for Bangladesh)
        // Schema update: phoneNumber now allows full string including country code
        const fullPhoneNumber = phone.startsWith('+') ? phone.replace(/[\s-]/g, '') : '+880' + phone.replace(/[\s-]/g, '');

        // Create user account
        const [newUser] = await db
            .insert(users)
            .values({
                email,
                phoneNumber: fullPhoneNumber,
                passwordHash: hashedPassword,
                role: role as any, // Use the role from request body
            })
            .returning();

        console.log('Created user:', newUser.id);

        // Create customer profile
        const [newCustomer] = await db
            .insert(customerProfiles)
            .values({
                userId: newUser.id,
                firstName,
                lastName,
                email,
                phoneNumber: phone,
                dateOfBirth: dateOfBirth || null,
                nidPassportNumber: nidPassportNumber || null,
                loyaltyPoints: 0,
            })
            .returning();

        console.log('Created customer profile:', newCustomer.userId);

        return NextResponse.json({
            success: true,
            customer: {
                id: newCustomer.userId,
                userId: newUser.id,
                name: `${firstName} ${lastName}`,
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth: newCustomer.dateOfBirth,
                loyaltyPoints: 0,
                joinDate: newUser.createdAt,
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating customer:', error);

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
            return NextResponse.json(
                { error: 'A customer with these details already exists' },
                { status: 400 }
            );
        }

        // Generic error
        return NextResponse.json(
            { error: 'Failed to create customer. Please try again.' },
            { status: 500 }
        );
    }
}
