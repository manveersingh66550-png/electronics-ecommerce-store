import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexcart.store';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/deals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${SITE_URL}/cart`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
        { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${SITE_URL}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${SITE_URL}/track-order`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },
    ];

    // Dynamic product pages
    let productPages: MetadataRoute.Sitemap = [];
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: products } = await supabase
            .from('products')
            .select('id, updated_at')
            .order('created_at', { ascending: false });

        if (products) {
            productPages = products.map((p) => ({
                url: `${SITE_URL}/product/${p.id}`,
                lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));
        }
    } catch {
        // Silently continue if DB fetch fails
    }

    return [...staticPages, ...productPages];
}
