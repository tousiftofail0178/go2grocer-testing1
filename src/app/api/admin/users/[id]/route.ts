import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH /api/admin/users/[id] - Update user details
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { role, isVerified, name } = body;

        console.log(`📝 Updating user ${userId}:`, body);

        // Build update object dynamically
        const updateData: any = {};
        if (role !== undefined) updateData.role = role;
        if (isVerified !== undefined) updateData.isVerified = isVerified;
        if (name !== undefined) updateData.name = name;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        // Update user
        const updatedUser = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning();

        if (updatedUser.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        console.log('✅ User updated successfully');

        return NextResponse.json({
            success: true,
            user: updatedUser[0],
        });

    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user', details: error.message },
            { status: 500 }
        );
    }
}
