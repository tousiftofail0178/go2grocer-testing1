import { Metadata } from 'next';
import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata: Metadata = genMeta({
    title: 'Go2Grocer – Fresh Groceries Delivered in Chittagong',
    description: 'Order fresh vegetables, fruits, fish, meat, and daily essentials online in Chittagong. Fast delivery in 30-60 minutes. 100% fresh and organic produce.',
    url: '/',
    keywords: ['grocery delivery Chittagong', 'fresh vegetables', 'online grocery Bangladesh', 'fast delivery', 'organic produce'],
});
