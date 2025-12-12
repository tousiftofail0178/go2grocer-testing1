import { Metadata } from 'next';
import { generateMetadata as genMeta, generateProductSchema } from '@/lib/seo';
import { products } from '@/lib/data';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    // In production, fetch from API
    const product = products.find(p => p.id === params.id);

    if (!product) {
        return genMeta({
            title: 'Product Not Found',
            description: 'The product you are looking for could not be found.',
            url: `/product/${params.id}`,
        });
    }

    return genMeta({
        title: product.name,
        description: `Buy ${product.name} online. Fresh and high-quality ${product.category} delivered to your door in Chittagong. Price: ৳${product.price}`,
        url: `/product/${params.id}`,
        image: product.image,
        type: 'product',
        keywords: [product.name, product.category, 'buy online', 'fresh', 'Chittagong'],
    });
}

export async function generateStaticParams() {
    // Generate static paths for known products
    return products.map((product) => ({
        id: product.id,
    }));
}
