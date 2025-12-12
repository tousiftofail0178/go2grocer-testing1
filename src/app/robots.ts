import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://go2grocer.com'; // Update with actual domain

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/_next/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
