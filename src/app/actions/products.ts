"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid'; // You might need to install uuid or use another ID generator if not available. 
// If uuid is not installed, I'll use a simple random string for now or check package.json

export async function getProducts() {
    try {
        const allProducts = await db.select().from(products).orderBy(desc(products.inStock));
        return { success: true, products: allProducts };
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return { success: false, error: "Failed to fetch products" };
    }
}

export async function getProduct(id: string) {
    try {
        const product = await db.select().from(products).where(eq(products.id, id));
        if (product.length === 0) return { success: false, error: "Product not found" };
        return { success: true, product: product[0] };
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return { success: false, error: "Failed to fetch product" };
    }
}

export async function createProduct(data: any) {
    try {
        const id = 'prod-' + Date.now(); // Simple ID generation
        await db.insert(products).values({
            id: id,
            name: data.name,
            price: parseInt(data.price),
            originalPrice: data.originalPrice ? parseInt(data.originalPrice) : null,
            weight: data.weight,
            image: data.image,
            category: data.category,
            inStock: data.inStock === 'true' || data.inStock === true,
            isNew: data.isNew === 'true' || data.isNew === true,
            discount: data.discount ? parseInt(data.discount) : 0,
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

export async function updateProduct(id: string, data: any) {
    try {
        await db.update(products).set({
            name: data.name,
            price: parseInt(data.price),
            originalPrice: data.originalPrice ? parseInt(data.originalPrice) : null,
            weight: data.weight,
            image: data.image,
            category: data.category,
            inStock: data.inStock === 'true' || data.inStock === true,
            isNew: data.isNew === 'true' || data.isNew === true,
            discount: data.discount ? parseInt(data.discount) : 0,
        }).where(eq(products.id, id));

        revalidatePath("/admin/products");
        revalidatePath("/shop");
        revalidatePath(`/product/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update product:", error);
        return { success: false, error: "Failed to update product" };
    }
}

export async function deleteProduct(id: string) {
    try {
        await db.delete(products).where(eq(products.id, id));
        revalidatePath("/admin/products");
        revalidatePath("/shop");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete product:", error);
        return { success: false, error: "Failed to delete product" };
    }
}
