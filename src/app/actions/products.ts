"use server";

import { db } from "@/db";
import { globalCatalog, categories } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export async function getProducts() {
    try {
        const allProducts = await db.select().from(globalCatalog).orderBy(desc(globalCatalog.stockQuantity));
        return { success: true, products: allProducts };
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return { success: false, error: "Failed to fetch products" };
    }
}

export async function getProduct(id: number) {
    try {
        const product = await db.select().from(globalCatalog).where(eq(globalCatalog.globalProductId, id));
        if (product.length === 0) return { success: false, error: "Product not found" };
        return { success: true, product: product[0] };
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return { success: false, error: "Failed to fetch product" };
    }
}

export async function createProduct(data: any) {
    try {
        // Get category ID from category name
        let categoryId: number | undefined = undefined;
        if (data.category) {
            const categoryResult = await db.select().from(categories).where(eq(categories.name, data.category));
            if (categoryResult.length > 0) {
                categoryId = categoryResult[0].categoryId;
            }
        }

        await db.insert(globalCatalog).values({
            name: data.name,
            descriptionHtml: data.description || '',
            categoryId: categoryId,
            baseUnit: data.weight || 'unit',
            stockQuantity: data.inStock ? 100 : 0,
            baseImageUrl: data.image || '/placeholder.png',
            rating: '0',
        });
        revalidatePath("/admin/products");
        revalidatePath("/shop");
        return { success: true };
    } catch (error) {
        console.error("Failed to create product:", error);
        return { success: false, error: "Failed to create product" };
    }
}

export async function updateProduct(id: number, data: any) {
    try {
        // Get category ID from category name
        let categoryId: number | undefined = undefined;
        if (data.category) {
            const categoryResult = await db.select().from(categories).where(eq(categories.name, data.category));
            if (categoryResult.length > 0) {
                categoryId = categoryResult[0].categoryId;
            }
        }

        await db.update(globalCatalog).set({
            name: data.name,
            descriptionHtml: data.description,
            categoryId: categoryId,
            baseUnit: data.weight,
            stockQuantity: data.inStock ? 100 : 0,
            baseImageUrl: data.image,
        }).where(eq(globalCatalog.globalProductId, id));

        revalidatePath("/admin/products");
        revalidatePath("/shop");
        revalidatePath(`/product/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update product:", error);
        return { success: false, error: "Failed to update product" };
    }
}

export async function deleteProduct(id: number) {
    try {
        await db.delete(globalCatalog).where(eq(globalCatalog.globalProductId, id));
        revalidatePath("/admin/products");
        revalidatePath("/shop");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete product:", error);
        return { success: false, error: "Failed to delete product" };
    }
}


export async function getCategories() {
    try {
        const allCategories = await db.select().from(categories);
        return { success: true, categories: allCategories };
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return { success: false, error: "Failed to fetch categories" };
    }
}

/**
 * Get grouped products for B2B display
 * Groups variants by variant_group_id
 */
export async function getGroupedProducts() {
    try {
        const { isNotNull, sql } = await import("drizzle-orm");

        // Get grouped products (parent products)
        const groupedProducts = await db
            .select({
                variantGroupId: globalCatalog.variantGroupId,
                name: globalCatalog.name,
                baseImageUrl: globalCatalog.baseImageUrl,
                categoryId: globalCatalog.categoryId,
                variantCount: sql<number>`count(*)::int`,
                minPrice: sql<number>`min(${globalCatalog.sellingPrice})::numeric`,
                maxPrice: sql<number>`max(${globalCatalog.sellingPrice})::numeric`,
                totalStock: sql<number>`sum(${globalCatalog.stockQuantity})::int`
            })
            .from(globalCatalog)
            .where(isNotNull(globalCatalog.variantGroupId))
            .groupBy(
                globalCatalog.variantGroupId,
                globalCatalog.name,
                globalCatalog.baseImageUrl,
                globalCatalog.categoryId
            )
            .orderBy(sql`${globalCatalog.variantGroupId} DESC`);

        return { success: true, products: groupedProducts };
    } catch (error) {
        console.error("Failed to fetch grouped products:", error);
        return { success: false, error: "Failed to fetch products" };
    }
}

/**
 * Get all variants for a specific variant group
 */
export async function getVariantsByGroupId(groupId: number) {
    try {
        const variants = await db
            .select()
            .from(globalCatalog)
            .where(eq(globalCatalog.variantGroupId, groupId));

        return { success: true, variants };
    } catch (error) {
        console.error("Failed to fetch variants:", error);
        return { success: false, error: "Failed to fetch variants" };
    }
}

/**
 * Delete all variants in a product group
 */
export async function deleteProductGroup(groupId: number) {
    try {
        await db
            .delete(globalCatalog)
            .where(eq(globalCatalog.variantGroupId, groupId));

        revalidatePath("/admin/products");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete product group:", error);
        return { success: false, error: "Failed to delete product group" };
    }
}
