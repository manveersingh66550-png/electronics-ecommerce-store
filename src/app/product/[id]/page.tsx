import React from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './ProductDetailClient';
import styles from './page.module.css';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from('products')
        .select('name, description, images, price')
        .eq('id', id)
        .single();

    if (!product) return { title: 'Product Not Found' };

    return {
        title: product.name,
        description: product.description?.slice(0, 160) || `Shop ${product.name} at NexCart.`,
        openGraph: {
            title: product.name,
            description: product.description?.slice(0, 160) || `Shop ${product.name} at NexCart.`,
            images: product.images?.[0] ? [{ url: product.images[0], width: 800, height: 600, alt: product.name }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description?.slice(0, 160) || `Shop ${product.name} at NexCart.`,
            images: product.images?.[0] ? [product.images[0]] : [],
        },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch Product
    const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
            *,
            categories (name)
        `)
        .eq('id', id)
        .single();

    if (productError || !product) {
        notFound();
    }

    // 2. Fetch Media
    const { data: mediaData } = await supabase
        .from('product_media')
        .select('*')
        .eq('product_id', product.id)
        .order('sort_order', { ascending: true });

    const mediaList = mediaData?.map((m: any) => ({
        id: m.id,
        url: m.url,
        type: m.type === 'video' ? 'video' : 'image',
        alt: m.alt_text
    })) || [];

    // 3. Fetch Variants
    const { data: variantData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id);

    // Group variants by their "name" (e.g., Color, Size)
    const variantTypesMap: Record<string, any> = {};

    variantData?.forEach((v: any) => {
        if (!variantTypesMap[v.name]) {
            variantTypesMap[v.name] = {
                id: v.name, // using name as type id for simplicity
                name: v.name,
                options: []
            };
        }
        variantTypesMap[v.name].options.push({
            id: v.id,
            name: v.name.toLowerCase() === 'color' ? v.sku : v.sku,
            value: v.name.toLowerCase() === 'color' ? v.sku : undefined,
            inStock: v.stock > 0
        });
    });

    const variantTypes = Object.values(variantTypesMap);

    // 4. Fetch Reviews
    const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

    const reviews = reviewsData?.map((r: any) => ({
        id: r.id,
        user_name: 'Verified Customer', // If you have auth.users joined, use it. For now, mock name.
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at
    })) || [];

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
        : 5.0; // default 5 star

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        description: product.description,
                        image: product.images?.[0],
                        offers: {
                            '@type': 'Offer',
                            price: Number(product.price).toFixed(2),
                            priceCurrency: 'USD',
                            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                        },
                        ...(reviews.length > 0 && {
                            aggregateRating: {
                                '@type': 'AggregateRating',
                                ratingValue: averageRating.toFixed(1),
                                reviewCount: reviews.length,
                            },
                        }),
                    }),
                }}
            />
            <ProductDetailClient
                product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    categoryName: product.categories?.name || 'Uncategorized',
                    stock: product.stock
                }}
                media={mediaList}
                variantTypes={variantTypes}
                reviews={reviews}
                averageRating={averageRating}
                totalReviews={reviews.length || 0}
            />
        </>
    );
}
