"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import styles from './wishlist.module.css';

export default function WishlistPage() {
    const [supabase] = useState(() => createClient());
    const { items: wishlistIds, toggleItem } = useWishlistStore();
    const addToCart = useCartStore((s) => s.addItem);

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const fetchProducts = async () => {
            if (wishlistIds.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('products')
                .select('id, name, price, images, stock, rating')
                .in('id', wishlistIds);

            setProducts(data || []);
            setLoading(false);
        };
        fetchProducts();
    }, [mounted, wishlistIds.length]);

    const handleAddToCart = (product: any) => {
        addToCart({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.images?.[0] || '',
            stock: product.stock || 10,
        });
    };

    if (!mounted) {
        return <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading...</p>;
    }

    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>My Wishlist</h1>
                <p className={styles.subtitle}>{wishlistIds.length} saved item{wishlistIds.length !== 1 ? 's' : ''}</p>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
            ) : wishlistIds.length === 0 ? (
                <GlassPanel className={styles.emptyState}>
                    <Heart size={48} />
                    <h3>Your wishlist is empty</h3>
                    <p>Save items you love to come back to them later.</p>
                    <Link href="/shop">
                        <Button variant="primary">Browse Products</Button>
                    </Link>
                </GlassPanel>
            ) : (
                <div className={styles.grid}>
                    {products.map((product) => (
                        <GlassPanel key={product.id} className={styles.card}>
                            <Link href={`/product/${product.id}`} className={styles.imageWrapper}>
                                <Image
                                    src={product.images?.[0] || '/hero-headphone.png'}
                                    alt={product.name}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                />
                            </Link>
                            <div className={styles.cardBody}>
                                <Link href={`/product/${product.id}`} className={styles.productName}>
                                    {product.name}
                                </Link>
                                <p className={styles.price}>₹{Number(product.price).toFixed(2)}</p>
                                <div className={styles.cardActions}>
                                    <Button
                                        variant="primary"
                                        className={styles.addToCartBtn}
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        <ShoppingCart size={16} /> Add to Cart
                                    </Button>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => toggleItem(product.id)}
                                        aria-label="Remove from wishlist"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </GlassPanel>
                    ))}
                </div>
            )}
        </>
    );
}
