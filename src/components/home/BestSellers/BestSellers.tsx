"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ArrowRight, TrendingUp, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cartStore';
import { AnimatedSection } from '@/components/home/AnimatedSection/AnimatedSection';
import styles from './BestSellers.module.css';

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    categories: { name: string } | null;
    sales_count: number;
}

export const BestSellers = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        const supabase = createClient();

        async function fetchBestSellers() {
            const { data, error } = await supabase
                .from('products')
                .select(`
          id,
          name,
          price,
          images,
          stock,
          sales_count,
          categories(name)
        `)
                .order('sales_count', { ascending: false })
                .limit(4);

            if (!error && data) {
                setProducts(data as any[]);
            }
            setLoading(false);
        }

        fetchBestSellers();

        // Real-time subscription for sales_count updates
        const channel = supabase
            .channel('best-sellers-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'products',
                },
                (payload: any) => {
                    // Only re-fetch if the record changed in a way that might affect best sellers
                    // (e.g. sales_count changed, or a product was renamed/priced differently)
                    if (payload.old && payload.new && 
                        payload.old.sales_count === payload.new.sales_count &&
                        payload.old.name === payload.new.name &&
                        payload.old.price === payload.new.price) {
                        return;
                    }
                    fetchBestSellers();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault(); // Prevent navigation from the parent Link
        e.stopPropagation();
        addItem({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.images?.[0] || '/placeholder.png',
            stock: product.stock || 10,
        });

        // Show brief "added" feedback
        setAddedIds((prev) => new Set(prev).add(product.id));
        setTimeout(() => {
            setAddedIds((prev) => {
                const next = new Set(prev);
                next.delete(product.id);
                return next;
            });
        }, 1200);
    };

    if (loading || products.length === 0) return null;

    return (
        <section className={styles.bestSellersSection}>
            <div className={styles.container}>
                <AnimatedSection delay={0.1}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.titleBadge}>
                            <TrendingUp size={16} className={styles.badgeIcon} />
                            <span>Most Wanted</span>
                        </div>
                        <h2 className={styles.sectionTitle}>Best Sellers</h2>
                        <p className={styles.sectionDesc}>Our most popular tech essentials, loved by thousands.</p>
                    </div>
                </AnimatedSection>

                <div className={styles.productGrid}>
                    {products.map((product, idx) => (
                        <AnimatedSection direction="up" delay={0.2 + idx * 0.1} key={product.id}>
                            <Link href={`/product/${product.id}`} className={styles.productLink}>
                                <div className={styles.productCard}>
                                    <div className={styles.productImageWrap}>
                                        <Image
                                            src={product.images[0] || '/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                            style={{ objectFit: 'contain' }}
                                            className={styles.productImage}
                                        />
                                        <div className={styles.rankBadge}>#{idx + 1}</div>
                                    </div>

                                    <div className={styles.productDetails}>
                                        <span className={styles.productCat}>
                                            {product.categories ? product.categories.name : 'Uncategorized'}
                                        </span>
                                        <h3 className={styles.productName}>{product.name}</h3>
                                        <div className={styles.productFooter}>
                                            <span className={styles.productPrice}>₹{product.price.toFixed(2)}</span>
                                            <button
                                                className={`${styles.addBtn} ${addedIds.has(product.id) ? styles.addBtnAdded : ''}`}
                                                aria-label="Add to cart"
                                                onClick={(e) => handleAddToCart(e, product)}
                                            >
                                                {addedIds.has(product.id) ? (
                                                    <Check size={20} strokeWidth={2.5} />
                                                ) : (
                                                    <Plus size={20} strokeWidth={2.5} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </AnimatedSection>
                    ))}
                </div>

                <AnimatedSection direction="up" delay={0.6} className={styles.actionWrap}>
                    <Link href="/shop" style={{ textDecoration: 'none' }}>
                        <button className={styles.exploreBtn}>
                            Explore More <ArrowRight size={18} />
                        </button>
                    </Link>
                </AnimatedSection>
            </div>
        </section>
    );
};
