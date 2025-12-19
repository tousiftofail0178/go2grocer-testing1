import { Metadata } from 'next';

export interface SEOConfig {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    keywords?: string[];
}

const defaultConfig = {
    siteName: 'Go2Grocer',
    domain: 'https://go2grocer.netlify.app',
    defaultImage: '/og-image.png',
    twitterHandle: '@go2grocer',
};

export function generateMetadata(config: SEOConfig): Metadata {
    const {
        title,
        description,
        image = defaultConfig.defaultImage,
        url,
        type = 'website',
        keywords = [],
    } = config;

    const fullTitle = title.includes('Go2Grocer') ? title : `${title} | ${defaultConfig.siteName}`;
    const fullUrl = url ? `${defaultConfig.domain}${url}` : defaultConfig.domain;
    const fullImage = image.startsWith('http') ? image : `${defaultConfig.domain}${image}`;

    // Use correct OpenGraph type
    const ogType: 'website' | 'article' = type === 'product' ? 'website' : type === 'article' ? 'article' : 'website';

    return {
        title: fullTitle,
        description,
        keywords: [
            'grocery delivery',
            'Chittagong',
            'Bangladesh',
            'fresh vegetables',
            'online grocery',
            'fast delivery',
            ...keywords,
        ],
        authors: [{ name: 'Go2Grocer' }],
        openGraph: {
            type: ogType,
            locale: 'en_BD',
            url: fullUrl,
            siteName: defaultConfig.siteName,
            title: fullTitle,
            description,
            images: [
                {
                    url: fullImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            site: defaultConfig.twitterHandle,
            creator: defaultConfig.twitterHandle,
            title: fullTitle,
            description,
            images: [fullImage],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: fullUrl,
        },
        verification: {
            google: 'your-google-verification-code', // Placeholder
        }
    };
}

export function generateProductSchema(product: {
    name: string;
    description?: string;
    price: number;
    image: string;
    rating?: number;
    reviewCount?: number;
    availability?: 'InStock' | 'OutOfStock';
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || `Fresh ${product.name} from Go2Grocer`,
        image: product.image.startsWith('http') ? product.image : `${defaultConfig.domain}${product.image}`,
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'BDT',
            availability: `https://schema.org/${product.availability || 'InStock'}`,
        },
        aggregateRating: product.rating
            ? {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount || 0,
            }
            : undefined,
    };
}

export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Go2Grocer',
        url: defaultConfig.domain,
        logo: `${defaultConfig.domain}/icon.png`,
        description: 'Fresh groceries delivered to your doorstep in Chittagong, Bangladesh',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Chittagong',
            addressCountry: 'BD',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+880-1234-567890',
            contactType: 'Customer Service',
        },
        sameAs: [
            'https://facebook.com/go2grocer',
            'https://instagram.com/go2grocer',
            'https://twitter.com/go2grocer',
        ],
    };
}
