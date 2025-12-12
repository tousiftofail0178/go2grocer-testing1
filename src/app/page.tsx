"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Download, Star, ShieldCheck, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { ProductCard } from '@/components/ui/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { productApi } from '@/lib/api';
import { Product, Category } from '@/lib/data';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './page.module.css';

export default function Home() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addItem, items, updateQuantity } = useCartStore();

  const getQuantity = (productId: string) => {
    return items.find(item => item.id === productId)?.quantity || 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, prods] = await Promise.all([
          productApi.getCategories(),
          productApi.getProducts({ limit: 10, sort: 'popular' })
        ]);
        setCategories(Array.isArray(cats) ? cats : cats.data || []);
        setPopularProducts(Array.isArray(prods) ? prods : prods.data || []);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
        // Fallback
        const { categories: mockCats, products: mockProds } = await import('@/lib/data');
        setCategories(mockCats);
        setPopularProducts(mockProds.slice(0, 10));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.container}>


      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Fresh Groceries <br />
            <span className={styles.highlight}>Delivered in Minutes</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Get fresh vegetables, fruits, fish, meat, and daily essentials delivered to your doorstep in Chittagong.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/shop">
              <Button icon={<ArrowRight size={20} />}>Shop Now</Button>
            </Link>
            <Link href="/app-download">
              <Button variant="secondary" icon={<Download size={20} />}>Download App</Button>
            </Link>
          </div>
        </div>
        <div className={styles.heroImageWrapper}>
          <div className={styles.heroImage}>
            {/* Placeholder for Hero Image */}
            <div style={{ width: '100%', height: '100%', background: '#E8F5E9', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image src="/images/hero-basket.png" alt="Grocery Basket" width={400} height={300} style={{ objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <Link href="/shop" className={styles.viewAll}>View All</Link>
        </div>
        <div className={styles.categoriesGrid}>
          {isLoading
            ? Array(8).fill(0).map((_, i) => (
              <div key={i} className={styles.categorySkeleton} />
            ))
            : categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          }
        </div>
      </section>

      {/* Popular Products */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Popular Right Now</h2>
          <Link href="/shop" className={styles.viewAll}>View All</Link>
        </div>
        <div className={styles.productsGrid}>
          {isLoading
            ? Array(4).fill(0).map((_, i) => (
              <div key={i} className={styles.productSkeleton} />
            ))
            : popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={addItem}
                quantity={getQuantity(product.id)}
                onUpdateQuantity={(q) => updateQuantity(product.id, q)}
              />
            ))
          }
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIconWrapper}><Truck size={32} /></div>
          <h3>Super Fast Delivery</h3>
          <p>Get your order delivered within 30-60 minutes.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIconWrapper}><ShieldCheck size={32} /></div>
          <h3>Freshness Guaranteed</h3>
          <p>100% fresh and organic produce directly from farmers.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIconWrapper}><Clock size={32} /></div>
          <h3>24/7 Support</h3>
          <p>We are here to help you anytime, anywhere.</p>
        </div>
      </section>

      {/* Loyalty Promo */}
      {user?.role !== 'b2b' && (
        <section className={styles.loyaltySection}>
          <div className={styles.loyaltyContent}>
            <div className={styles.loyaltyIconWrapper}>
              <Star size={40} className={styles.loyaltyIconMain} />
              <div className={styles.loyaltyIconDecoration}></div>
            </div>
            <div className={styles.loyaltyText}>
              <h2>Join Go2Points</h2>
              <p>Earn points on every order and redeem them for exclusive rewards.</p>
            </div>
            <Link href="/loyalty" className={styles.loyaltyButtonWrapper}>
              <button className={styles.joinButton}>
                <Star size={18} fill="currentColor" /> Join Now
              </button>
            </Link>
          </div>
        </section>
      )}

      {/* App Download */}
      {/* App Download */}
      <section className={styles.appSection}>
        <div className={styles.appContent}>
          <h2 className={styles.appTitle}>Shop on the Go</h2>
          <p className={styles.appSubtitle}>Download the Go2Grocer app for a better shopping experience.</p>
          <div className={styles.appButtons}>
            <Button variant="primary" icon={<Download size={20} />}>App Store</Button>
            <Button variant="primary" icon={<Download size={20} />}>Google Play</Button>
          </div>
        </div>
      </section>
    </div >
  );
}
