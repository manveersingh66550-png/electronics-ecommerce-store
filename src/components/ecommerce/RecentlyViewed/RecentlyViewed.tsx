"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Clock } from 'lucide-react';
import styles from './RecentlyViewed.module.css';

interface RecentlyViewedProps {
    excludeId?: string;
}

export function RecentlyViewed({ excludeId }: RecentlyViewedProps) {
    const { productIds } = useRecentlyViewedStore();
    const [products, setProducts] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted) return;
        const ids = productIds.filter(id => id !== excludeId).slice(0, 6);
        if (ids.length === 0) return;

        const fetchProducts = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('products')
                .select('id, name, price, images')
                .in('id', ids);
            if (data) {
                const sorted = ids.map(id => data.find(p => p.id === id)).filter(Boolean);
                setProducts(sorted);
            }
        };
        fetchProducts();
    }, [mounted, productIds, excludeId]);

    if (!mounted || products.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <Clock size={18} />
                <h3 className={styles.title}>Recently Viewed</h3>
            </div>
            <div className={styles.scrollContainer}>
                {products.map((product: any) => (
                    <Link key={product.id} href={`/product/${product.id}`} className={styles.card}>
                        <div className={styles.imageWrapper}>
                            {product.images?.[0] ? (
                                <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'contain' }} />
                            ) : (
                                <div className={styles.placeholder} />
                            )}
                        </div>
                        <p className={styles.name}>{product.name}</p>
                        <p className={styles.price}>₹{Number(product.price).toFixed(2)}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
