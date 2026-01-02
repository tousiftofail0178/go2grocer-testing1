import { db } from "@/db"; // Adjust path to your db instance
import { globalCatalog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProcurementPDP from "./ProcurementPDP";

// Shared Interface
interface ProcurementProduct {
    id: string;
    name: string;
    origin: "Local" | "Imported";
    storageType: string;
    grade: string;
    variants: {
        sku: string;
        packSize: string;
        warehouseStock: number;
        price: number;
        effectiveMargin: number;
    }[];
    policyStatus: "APPROVE" | "REVIEW" | "BLOCK";
}

// Next.js 15: params is a Promise
export default async function ProcurementPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. Await params (Fixes the NaN error)
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);

    if (isNaN(productId)) {
        return notFound();
    }

    // 2. Fetch variants
    const rows = await db.select()
        .from(globalCatalog)
        .where(eq(globalCatalog.variantGroupId, productId));

    if (!rows || rows.length === 0) {
        return notFound();
    }

    // 3. Transform Data
    const productData: ProcurementProduct = {
        id: resolvedParams.id,
        name: rows[0].name, // Take name from first variant
        origin: "Local", // Hardcoded for MVP or add to DB later
        storageType: "Ambient / Dry",
        grade: "A-Grade Commercial",
        policyStatus: "APPROVE", // Default, will be overridden by frontend margin logic
        variants: rows.map((row) => {
            const cost = parseFloat(row.costPrice || "0");
            const sell = parseFloat(row.sellingPrice || "0");

            // Calculate Margin: (Sell - Cost) / Sell * 100
            const margin = sell > 0 ? ((sell - cost) / sell) * 100 : 0;

            return {
                sku: row.skuBarcode || "UNKNOWN",
                packSize: row.packSizeLabel || row.baseUnit,
                warehouseStock: row.stockQuantity || 0,
                price: sell,
                effectiveMargin: margin,
            };
        }),
    };

    return <ProcurementPDP product={productData} />;
}
