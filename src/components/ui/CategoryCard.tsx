import React from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import styles from './CategoryCard.module.css';
import { Category } from '@/lib/data';

interface CategoryCardProps {
    category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    // Dynamically render icon based on string name, fallback to Package
    const IconComponent = (Icons[category.icon as keyof typeof Icons] || Icons.Package) as React.ElementType;

    return (
        <Link href={`/shop?category=${category.slug}`} className={styles.card}>
            <div className={styles.iconWrapper}>
                <IconComponent size={32} strokeWidth={1.5} />
            </div>
            <span className={styles.name}>{category.name}</span>
        </Link>
    );
};
