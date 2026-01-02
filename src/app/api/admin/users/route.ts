import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, customerProfiles } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

// GET /api/admin/users - List all users for dropdown selection
export async function GET(request: NextRequest) {
    try {
        console.log('Fetching all users for dropdown');

        const allUsers = await db
            .select({
                id: users.id,
                email: users.email,
                role: users.role,
                isVerified: users.isVerified,
                createdAt: users.createdAt,
            })
            .from(users)
            .orderBy(desc(users.id));

        // Get customer names where available
        const usersWithNames = await Promise.all(
            allUsers.map(async (user) => {
                // Try to get customer profile for name
                const customerProfile = await db
                    .select({
                        firstName: customerProfiles.firstName,
                        lastName: customerProfiles.lastName,
                    })
                    .from(customerProfiles)
                    .where(eq(customerProfiles.userId, user.id))
                    .limit(1);

                const profile = customerProfile[0];
                const name = profile ? `${profile.firstName} ${profile.lastName}` : null;

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt,
                };
            })
        );

        return NextResponse.json({
            users: usersWithNames,
            total: usersWithNames.length,
        });

    } catch (error: any) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users', details: error.message },
            { status: 500 }
        );
    }
}
