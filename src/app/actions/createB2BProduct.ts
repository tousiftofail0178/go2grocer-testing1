"use server";

import { db } from "@/db";
import { globalCatalog } from "@/db/schema";
import { eq, max, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Types
interface ParentProductData {
    name: string;
    categoryId?: number;
    descriptionHtml?: string;
    baseImageUrl: string;
}

interface VariantData {
    skuBarcode: string;
    packSizeLabel: string;
    baseUnit: string;
    baseWeightGrams: number;
    costPrice: number;
    sellingPrice: number;
    stockQuantity: number;
}

interface CreateB2BProductInput {
    parent: ParentProductData;
    variants: VariantData[];
}

interface CreateB2BProductResult {
    success: boolean;
    error?: string;
    variantGroupId?: number;
}

/**
 * Creates a B2B product with multiple variants in a transaction
 * All variants share the same parent data and variant_group_id
 */
export async function createB2BProduct(
    data: CreateB2BProductInput
): Promise<CreateB2BProductResult> {
    try {
        // Validation
        if (!data.variants || data.variants.length === 0) {
            return { success: false, error: "At least one variant is required" };
        }

        // Validate each variant
        for (let i = 0; i < data.variants.length; i++) {
            const variant = data.variants[i];

            // Check cost vs selling price
            if (variant.costPrice >= variant.sellingPrice) {
                return {
                    success: false,
                    error: `Variant ${i + 1}: Cost price must be less than selling price`
                };
            }

            // Check for positive values
            if (variant.costPrice < 0 || variant.sellingPrice < 0) {
                return {
                    success: false,
                    error: `Variant ${i + 1}: Prices must be positive`
                };
            }

            if (variant.baseWeightGrams <= 0) {
                return {
                    success: false,
                    error: `Variant ${i + 1}: Weight must be positive`
                };
            }

            if (variant.stockQuantity < 0) {
                return {
                    success: false,
                    error: `Variant ${i + 1}: Stock quantity cannot be negative`
                };
            }

            // Check for required fields
            if (!variant.skuBarcode || !variant.packSizeLabel || !variant.baseUnit) {
                return {
                    success: false,
                    error: `Variant ${i + 1}: Missing required fields`
                };
            }
        }

        // Check for duplicate SKUs within the product
        const skus = data.variants.map(v => v.skuBarcode);
        const uniqueSkus = new Set(skus);
        if (skus.length !== uniqueSkus.size) {
            return {
                success: false,
                error: "Duplicate SKU barcodes found within variants"
            };
        }

        // Generate new variant_group_id
        const result = await db
            .select({ maxGroupId: max(globalCatalog.variantGroupId) })
            .from(globalCatalog)
            .where(isNotNull(globalCatalog.variantGroupId));

        const newGroupId = (result[0]?.maxGroupId || 0) + 1;

        // Transaction: Insert all variants atomically
        await db.transaction(async (tx) => {
            for (const variant of data.variants) {
                await tx.insert(globalCatalog).values({
                    // Parent data (shared across all variants)
                    name: data.parent.name,
                    categoryId: data.parent.categoryId || null,
                    descriptionHtml: data.parent.descriptionHtml || null,
                    baseImageUrl: data.parent.baseImageUrl,

                    // Variant-specific data
                    skuBarcode: variant.skuBarcode,
                    packSizeLabel: variant.packSizeLabel,
                    baseUnit: variant.baseUnit,
                    baseWeightGrams: variant.baseWeightGrams,
                    costPrice: variant.costPrice.toFixed(2),
                    sellingPrice: variant.sellingPrice.toFixed(2),
                    stockQuantity: variant.stockQuantity,

                    // Grouping
                    variantGroupId: newGroupId,

                    // Defaults
                    rating: "0"
                });
            }
        });

        // Revalidate the products page
        revalidatePath("/admin/products");

        return {
            success: true,
            variantGroupId: newGroupId
        };

    } catch (error: any) {
        console.error("Error creating B2B product:", error);

        // Check for unique constraint violations
        if (error.message?.includes("unique") || error.code === "23505") {
            return {
                success: false,
                error: "A product with one of these SKU barcodes already exists"
            };
        }

        return {
            success: false,
            error: error.message || "Failed to create product"
        };
    }
}
