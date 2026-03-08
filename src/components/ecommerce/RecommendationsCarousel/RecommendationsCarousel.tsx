"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight } from 'lucide-react';
import styles from './RecommendationsCarousel.module.css';

interface RecommendationsCarouselProps {
    productId: string;
    categoryName: string;
    title?: string;
}

export function RecommendationsCarousel({ productId, categoryName, title = 'You May Also Like' }: RecommendationsCarouselProps) {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchRelated = async () => {
            const supabase = createClient();

            // Try same category first
            const { data: catData } = await supabase
                .from('categories')
                .select('id')
                .eq('name', categoryName)
                .single();

            let query = supabase
                .from('products')
                .select('id, name, price, images')
                .neq('id', productId)
                .limit(6);

            if (catData) {
                query = query.eq('category_id', catData.id);
            }

            const { data } = await query;

            if (data && data.length > 0) {
                setProducts(data);
            } else {
                // Fallback: fetch any random products
                const { data: fallback } = await supabase
                    .from('products')
                    .select('id, name, price, images')
                    .neq('id', productId)
                    .limit(6);
                setProducts(fallback || []);
            }
        };
        fetchRelated();
    }, [productId, categoryName]);

    if (products.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <Link href="/shop" className={styles.viewAll}>
                    View all <ArrowRight size={16} />
                </Link>
            </div>
            <div className={styles.grid}>
                {products.map((product: any) => (
                    <Link key={product.id} href={`/product/${product.id}`} className={styles.card}>
                        <div className={styles.imageWrapper}>
                            {product.images?.[0] ? (
                                <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'contain' }} />
                            ) : (
                                <div className={styles.placeholder} />
                            )}
                        </div>
                        <div className={styles.info}>
                            <p className={styles.name}>{product.name}</p>
                            <p className={styles.price}>₹{Number(product.price).toFixed(2)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
