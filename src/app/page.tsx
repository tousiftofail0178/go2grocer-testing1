import { db } from "@/db";
import { categories, globalCatalog } from "@/db/schema";
import Link from "next/link";
import { eq } from "drizzle-orm";
import {
  Wheat, Droplet, Cookie, Utensils,
  Carrot, ChefHat, Soup, IceCream, Sparkles, Box,
  Truck, ShieldCheck, Clock
} from "lucide-react";
import styles from './page.module.css';
import { LiveMarketCard } from '@/components/homepage/LiveMarketCard';

export const dynamic = 'force-dynamic';

// Icon Mapper
const getCategoryIcon = (id: number) => {
  switch (id) {
    case 1: return <Wheat size={32} />;
    case 2: return <Droplet size={32} />;
    case 3: return <Cookie size={32} />;
    case 4: return <Utensils size={32} />;
    case 5: return <Carrot size={32} />;
    case 6: return <ChefHat size={32} />;
    case 7: return <Soup size={32} />;
    case 8: return <IceCream size={32} />;
    case 9: return <Sparkles size={32} />;
    default: return <Box size={32} />;
  }
};

export default async function HomePage() {
  // 1. Fetch Categories
  const categoryList = await db.select().from(categories).orderBy(categories.categoryId);

  // 2. Fetch Hero Product (Safe Select Method)
  const heroProducts = await db.select()
    .from(globalCatalog)
    .where(eq(globalCatalog.skuBarcode, 'RICE-MIN-50'))
    .limit(1);

  const heroProduct = heroProducts[0] || null;

  return (
    <div className={styles.container}>

      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            🚀 Now Live in Chittagong
          </div>
          <h1 className={styles.heroTitle}>
            Wholesale Supply <br />
            <span className={styles.highlight}>Simplified.</span>
          </h1>
          <div className={styles.heroButtons}>
            <Link href="/dashboard/lists" className={styles.primaryButton}>
              Start Ordering
            </Link>
            {/* Browse Catalog: Points to Shop Catalog */}
            <Link href="/shop" className={styles.secondaryButtonAlt}>
              Browse Catalog
            </Link>
          </div>
        </div>

        {/* Dynamic Hero Visual Card - Rotates every minute */}
        <LiveMarketCard initialProduct={heroProduct} />
      </section>

      {/* CATEGORY GRID */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Explore Our Catalog</h2>
          <p className={styles.sectionSubtitle}>Everything your kitchen needs, organized for speed.</p>
        </div>

        <div className={styles.categoriesGridB2B}>
          {categoryList.map((cat) => (
            <Link
              key={cat.categoryId}
              href={`/shop?category=${cat.categoryId}`}
              className={styles.categoryCardB2B}
            >
              <div className={styles.categoryIconWrapper}>
                {getCategoryIcon(cat.categoryId)}
              </div>
              <span className={styles.categoryName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIconWrapper}>
            <Truck size={32} />
          </div>
          <h3>Bulk Delivery</h3>
          <p>Order 50kg sacks, drums, and wholesale packs delivered to your business.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIconWrapper}>
            <ShieldCheck size={32} />
          </div>
          <h3>Margin Protection</h3>
          <p>Smart pricing ensures your business maintains healthy profit margins.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIconWrapper}>
            <Clock size={32} />
          </div>
          <h3>SLA Guaranteed</h3>
          <p>Business-critical supply chain with delivery guarantees.</p>
        </div>
      </section>
    </div>
  );
}
