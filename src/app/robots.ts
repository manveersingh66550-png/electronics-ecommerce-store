import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexcart.store';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/user/', '/checkout/', '/api/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
