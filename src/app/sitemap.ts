import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://go2grocer.com'; // Update with actual domain

    // Static pages
    const staticPages = [
        '',
        '/shop',
        '/cart',
        '/checkout',
        '/login',
        '/about',
        '/contact',
        '/faq',
        '/delivery-info',
        '/loyalty',
        '/app-download',
        '/profile',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic product pages (example - in production, fetch from API)
    const productIds = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const productPages = productIds.map((id) => ({
        url: `${baseUrl}/product/${id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
    }));

    return [...staticPages, ...productPages];
}
