import React from 'react';

interface JsonLdProps {
    data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export function ProductJsonLd({
    name,
    description,
    price,
    currency = 'USD',
    image,
    url,
    rating,
    reviewCount,
    inStock,
}: {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    image?: string;
    url?: string;
    rating?: number;
    reviewCount?: number;
    inStock?: boolean;
}) {
    const data: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image: image || undefined,
        url: url || undefined,
        offers: {
            '@type': 'Offer',
            price: price.toFixed(2),
            priceCurrency: currency,
            availability: inStock !== false
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
        },
    };

    if (rating && reviewCount) {
        data.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating.toFixed(1),
            reviewCount,
        };
    }

    return <JsonLd data={data} />;
}
