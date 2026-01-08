'use server';

import { db } from '@/db';
import {
    users,
    businessProfiles,
    customerProfiles,
    shoppingLists,
    shoppingListItems,
    globalCatalog
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';

// ============================================
// PERMISSION HELPER FUNCTIONS
// ============================================

/**
 * Verify if a user has access to a business as either Owner or Manager
 * 
 * @param userId - The user ID to check
 * @param businessId - The business ID to verify access for
 * @returns Object with success boolean and user role in the business
 */
async function verifyBusinessAccess(userId: number, businessId: number) {
    try {
        // 1. Check if user is the business owner
        const ownerCheck = await db.select()
            .from(businessProfiles)
            .where(
                and(
                    eq(businessProfiles.businessId, businessId),
                    eq(businessProfiles.ownerId, userId)
                )
            );

        if (ownerCheck.length > 0) {
            return {
                success: true,
                role: 'OWNER' as const,
                business: ownerCheck[0]
            };
        }

        // 2. Check if user is a manager of this business
        const managerCheck = await db.select()
            .from(customerProfiles)
            .where(
                and(
                    eq(customerProfiles.userId, userId),
                    eq(customerProfiles.employerBusinessId, businessId),
                    eq(customerProfiles.roleType, 'MANAGER')
                )
            );

        if (managerCheck.length > 0) {
            return {
                success: true,
                role: 'MANAGER' as const,
                manager: managerCheck[0]
            };
        }

        return {
            success: false,
            error: 'You do not have permission to access this business'
        };

    } catch (error) {
        console.error('Permission check error:', error);
        return {
            success: false,
            error: 'Failed to verify permissions'
        };
    }
}

/**
 * Get the current authenticated user from session cookies
 * Reads userId and userEmail from HTTP cookies set during login
 */
async function getCurrentUser(): Promise<{ id: number; email: string } | null> {
    try {
        const cookieStore = await cookies();

        // Read authentication cookies
        // These should be set during login in your auth actions
        const userId = cookieStore.get('userId')?.value;
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userId || !userEmail) {
            return null;
        }

        return {
            id: Number(userId),
            email: userEmail
        };

    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// ============================================
// SHOPPING LIST ACTIONS
// ============================================

/**
 * Get all shopping lists for a business
 * Only accessible by business owners and managers
 */
export async function getListsForBusiness(businessId: number) {
    try {
        console.log('🔍 [SERVER] getListsForBusiness called with businessId:', businessId);

        // 1. Get current user
        const currentUser = await getCurrentUser();
        console.log('👤 [SERVER] Current user:', currentUser);

        if (!currentUser) {
            console.error('❌ [SERVER] Not authenticated');
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        // 2. Verify permission
        const accessCheck = await verifyBusinessAccess(currentUser.id, businessId);
        console.log('🔐 [SERVER] Access check result:', accessCheck);

        if (!accessCheck.success) {
            console.error('❌ [SERVER] Access denied:', accessCheck.error);
            return {
                success: false,
                error: accessCheck.error || 'Access denied'
            };
        }

        console.log('🔎 [SERVER] Verifying access for User:', currentUser.id, 'Business:', businessId, 'Role:', accessCheck.role);

        // 3. Fetch lists with items and products
        console.log('🗄️ [SERVER] Starting database query...');
        const lists = await db.query.shoppingLists.findMany({
            where: eq(shoppingLists.businessId, businessId),
            with: {
                items: {
                    with: {
                        product: true, // Include full product details
                    },
                },
            },
            orderBy: (lists, { desc }) => [desc(lists.createdAt)],
        });

        console.log('📦 [SERVER] Fetched lists from DB:', lists);
        console.log('📊 [SERVER] Number of lists found:', lists.length);

        return {
            success: true,
            lists,
            userRole: accessCheck.role,
        };

    } catch (error) {
        console.error('❌ [SERVER] ==== CRITICAL ERROR IN getListsForBusiness ====');
        console.error('❌ [SERVER] Full error object:', error);
        console.error('❌ [SERVER] Error type:', typeof error);
        console.error('❌ [SERVER] Error name:', error instanceof Error ? error.name : 'Not an Error object');
        console.error('❌ [SERVER] Error message:', error instanceof Error ? error.message : String(error));
        console.error('❌ [SERVER] Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
        console.error('❌ [SERVER] ============================================');

        return {
            success: false,
            error: error instanceof Error ? `Server error: ${error.message}` : 'Failed to fetch shopping lists'
        };
    }
}

/**
 * Create a new shopping list for a business
 * Only accessible by business owners and managers
 */
export async function createList(businessId: number, listName: string) {
    try {
        // 1. Validate input
        if (!listName || listName.trim().length === 0) {
            return {
                success: false,
                error: 'List name is required'
            };
        }

        // 2. Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        // 3. Verify permission
        const accessCheck = await verifyBusinessAccess(currentUser.id, businessId);
        if (!accessCheck.success) {
            return {
                success: false,
                error: accessCheck.error || 'Access denied'
            };
        }

        // 4. Create the list
        const [newList] = await db.insert(shoppingLists)
            .values({
                businessId: businessId,
                name: listName.trim(),
            })
            .returning();

        return {
            success: true,
            list: newList,
        };

    } catch (error) {
        console.error('Error creating list:', error);
        return {
            success: false,
            error: 'Failed to create shopping list'
        };
    }
}

/**
 * Add item to shopping list or update quantity if it already exists
 * Access is verified via the list's business
 */
export async function addItemToList(
    listId: number,
    productId: number,
    quantity: number,
    notes?: string
) {
    try {
        // 1. Validate input
        if (quantity <= 0) {
            return {
                success: false,
                error: 'Quantity must be greater than 0'
            };
        }

        // 2. Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        // 3. Get the list to check business ownership
        const list = await db.query.shoppingLists.findFirst({
            where: eq(shoppingLists.id, listId),
        });

        if (!list) {
            return {
                success: false,
                error: 'Shopping list not found'
            };
        }

        // 4. Verify user has access to the business
        const accessCheck = await verifyBusinessAccess(currentUser.id, list.businessId);
        if (!accessCheck.success) {
            return {
                success: false,
                error: 'You do not have permission to modify this list'
            };
        }

        // 5. Verify product exists
        const product = await db.select()
            .from(globalCatalog)
            .where(eq(globalCatalog.globalProductId, productId))
            .limit(1);

        if (product.length === 0) {
            return {
                success: false,
                error: 'Product not found'
            };
        }

        // 6. Check if item already exists in the list
        const existingItem = await db.select()
            .from(shoppingListItems)
            .where(
                and(
                    eq(shoppingListItems.listId, listId),
                    eq(shoppingListItems.productId, productId)
                )
            );

        let item;

        if (existingItem.length > 0) {
            // Update existing item quantity
            const [updatedItem] = await db.update(shoppingListItems)
                .set({ quantity, notes })
                .where(eq(shoppingListItems.id, existingItem[0].id))
                .returning();

            item = updatedItem;
        } else {
            // Insert new item
            const [newItem] = await db.insert(shoppingListItems)
                .values({
                    listId,
                    productId,
                    quantity,
                    notes,
                })
                .returning();

            item = newItem;
        }

        // 7. Return item with product details
        const itemWithProduct = await db.query.shoppingListItems.findFirst({
            where: eq(shoppingListItems.id, item.id),
            with: {
                product: true,
            },
        });

        return {
            success: true,
            item: itemWithProduct,
            isUpdate: existingItem.length > 0,
        };

    } catch (error) {
        console.error('Error adding item to list:', error);
        return {
            success: false,
            error: 'Failed to add item to list'
        };
    }
}

/**
 * Remove item from shopping list
 */
export async function removeItemFromList(itemId: number) {
    try {
        // 1. Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        // 2. Get the item and its list
        const item = await db.query.shoppingListItems.findFirst({
            where: eq(shoppingListItems.id, itemId),
            with: {
                list: true,
            },
        });

        if (!item) {
            return {
                success: false,
                error: 'Item not found'
            };
        }

        // 3. Verify access to the business
        const accessCheck = await verifyBusinessAccess(currentUser.id, item.list.businessId);
        if (!accessCheck.success) {
            return {
                success: false,
                error: 'You do not have permission to modify this list'
            };
        }

        // 4. Delete the item
        await db.delete(shoppingListItems)
            .where(eq(shoppingListItems.id, itemId));

        return {
            success: true,
        };

    } catch (error) {
        console.error('Error removing item:', error);
        return {
            success: false,
            error: 'Failed to remove item'
        };
    }
}

/**
 * Update item quantity or notes
 */
export async function updateListItem(
    itemId: number,
    updates: { quantity?: number; notes?: string }
) {
    try {
        // 1. Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        // 2. Get the item and its list
        const item = await db.query.shoppingListItems.findFirst({
            where: eq(shoppingListItems.id, itemId),
            with: {
                list: true,
            },
        });

        if (!item) {
            return {
                success: false,
                error: 'Item not found'
            };
        }

        // 3. Verify access
        const accessCheck = await verifyBusinessAccess(currentUser.id, item.list.businessId);
        if (!accessCheck.success) {
            return {
                success: false,
                error: 'You do not have permission to modify this list'
            };
        }

        // 4. Validate quantity if provided
        if (updates.quantity !== undefined && updates.quantity <= 0) {
            return {
                success: false,
                error: 'Quantity must be greater than 0'
            };
        }

        // 5. Update the item
        const [updatedItem] = await db.update(shoppingListItems)
            .set(updates)
            .where(eq(shoppingListItems.id, itemId))
            .returning();

        return {
            success: true,
            item: updatedItem,
        };

    } catch (error) {
        console.error('Error updating item:', error);
        return {
            success: false,
            error: 'Failed to update item'
        };
    }
}

/**
 * Delete a shopping list (and all its items)
 */
export async function deleteList(listId: number) {
    try {
        // 1. Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'Not authenticated'
            };
        }

        // 2. Get the list
        const list = await db.query.shoppingLists.findFirst({
            where: eq(shoppingLists.id, listId),
        });

        if (!list) {
            return {
                success: false,
                error: 'List not found'
            };
        }

        // 3. Verify access
        const accessCheck = await verifyBusinessAccess(currentUser.id, list.businessId);
        if (!accessCheck.success) {
            return {
                success: false,
                error: 'You do not have permission to delete this list'
            };
        }

        // 4. Delete the list (items are automatically deleted via CASCADE)
        await db.delete(shoppingLists)
            .where(eq(shoppingLists.id, listId));

        return {
            success: true,
        };

    } catch (error) {
        console.error('Error deleting list:', error);
        return {
            success: false,
            error: 'Failed to delete list'
        };
    }
}
