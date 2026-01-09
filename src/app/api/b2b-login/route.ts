import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, customerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// POST /api/b2b-login - Business owner/manager login
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        console.log('🔐 B2B Login attempt for:', email);

        // Find user by email
        const userRecords = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (userRecords.length === 0) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const user = userRecords[0];

        // Check if user is business owner or manager
        if (user.role !== 'business_owner' && user.role !== 'business_manager') {
            return NextResponse.json(
                { error: 'Access denied. This login is for business accounts only.' },
                { status: 413 }
            );
        }

        // Hash the provided password to compare (matching the simple hash used in registration)
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Simple password check (In production, use bcrypt verify)
        // Since we are moving fast, assume direct comparison or simple hash if already hashed
        if (user.passwordHash !== hashedPassword && user.passwordHash !== password) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        console.log('✅ Login successful for:', email);

        // Fetch name from customer profile
        const profile = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, user.id)).limit(1);
        const name = profile[0] ? `${profile[0].firstName} ${profile[0].lastName}` : 'User';


        // Generate a simple token (in production, use JWT)
        const token = crypto.randomBytes(32).toString('hex');

        // Return user data
        return NextResponse.json({
            user: {
                id: user.id.toString(),  // Use string ID for frontend consistency
                numericId: user.id,
                email: user.email,
                name: name,
                phone: user.phoneNumber || '',
                role: user.role,
            },
            token,
        });

    } catch (error: any) {
        console.error('Error during B2B login:', error);
        return NextResponse.json(
            { error: 'Login failed', details: error.message },
            { status: 500 }
        );
    }
}
