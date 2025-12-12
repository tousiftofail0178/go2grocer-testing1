import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata: Metadata = genMeta({
    title: 'Shop Fresh Groceries Online',
    description: 'Browse our wide selection of fresh vegetables, fruits, fish, meat, dairy, and daily essentials. Quality products delivered to your door in Chittagong.',
    url: '/shop',
    keywords: ['shop groceries online', 'buy vegetables', 'fresh fruits Chittagong', 'meat delivery', 'dairy products'],
});
