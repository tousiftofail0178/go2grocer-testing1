
'use server';

import { db } from '@/db';
import { users, businesses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { User } from '@/lib/data';

export async function authenticateUser(userId: string, passwordAttempt: string) {
    try {
        // 1. Find user by userId (e.g. G2G-001)
        const foundUsers = await db.select().from(users).where(eq(users.userId, userId));
        const user = foundUsers[0];

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // 2. Verify password (simple string comparison for now, as requested)
        // TODO: Use bcrypt or similar for real production
        if (user.password !== passwordAttempt) {
            return { success: false, error: 'Invalid password' };
        }

        // 2.5 Fetch Businesses (if any)
        const userBusinesses = await db.select().from(businesses).where(eq(businesses.userId, user.userId));

        // 3. Keep legacy mapping for client-side structure if needed, or simple return
        // Returning data matching the User interface
        const authenticatedUser: User = {
            id: user.userId, // Using the G2G-001 ID as the main ID for the frontend
            name: user.name,
            phone: user.phone,
            email: user.email || undefined,
            role: user.role as User['role'],
        };

        return { success: true, user: authenticatedUser, businesses: userBusinesses };

    } catch (error: any) {
        console.error('Login error:', error);
        return { success: false, error: 'Authentication failed' };
    }
}

export async function registerB2BUser(data: {
    businessName: string;
    userId: string;
    password: string;
    phone: string;
    email: string;
    role: 'owner' | 'manager';
}) {
    try {
        // Check if exists
        const existing = await db.select().from(users).where(eq(users.userId, data.userId));
        if (existing.length > 0) {
            return { success: false, error: 'User ID already exists' };
        }

        // Insert
        await db.insert(users).values({
            userId: data.userId,
            name: data.businessName,
            phone: data.phone,
            password: data.password,
            email: data.email,
            role: 'b2b', // Storing as generic B2B role, or could differentiate
        });

        // Return user format
        const newUser: User = {
            id: data.userId,
            name: data.businessName,
            phone: data.phone,
            email: data.email,
            role: 'b2b',
        };

        return { success: true, user: newUser };

    } catch (error: any) {
        console.error('Registration error:', error);
        return { success: false, error: 'Registration failed' };
    }
}

export async function verifyOtpUser(phone: string) {
    try {
        // 1. Find user by phone
        const foundUsers = await db.select().from(users).where(eq(users.phone, phone));
        const user = foundUsers[0];

        if (user) {
            // Return existing user
            return {
                success: true,
                user: {
                    id: user.userId,
                    name: user.name,
                    phone: user.phone,
                    email: user.email || undefined,
                    address: user.address || undefined,
                    role: user.role as User['role'],
                }
            };
        } else {
            // 2. Create new consumer user if not exists
            const newUserId = `C-${Date.now()}`; // Simple ID generation
            await db.insert(users).values({
                userId: newUserId,
                name: 'Guest User',
                phone: phone,
                role: 'consumer',
            });

            return {
                success: true,
                user: {
                    id: newUserId,
                    name: 'Guest User',
                    phone: phone,
                    role: 'consumer' as const,
                }
            };
        }
    } catch (error: any) {
        console.error('OTP Verification error:', error);
        return { success: false, error: 'Verification failed' };
    }
}

export async function updateUserProfile(userId: string, data: { name?: string; email?: string; phone?: string; address?: string }) {
    try {
        await db.update(users)
            .set({
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address
            })
            .where(eq(users.userId, userId));

        return { success: true };
    } catch (error: any) {
        console.error('Profile update error:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}
