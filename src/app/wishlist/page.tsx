"use client";

import React, { useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/wishlistStore';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/ecommerce/ProductCard/ProductCard';
import { Button } from '@/components/ui/Button/Button';
import { HeartCrack, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import styles from './wishlist.module.css';

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    category_id: string;
    categories?: { name: string };
    stock: number;
    rating: number;
    reviews_count: number;
}

export default function WishlistPage() {
    const { items: wishlistIds } = useWishlistStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            if (!wishlistIds || wishlistIds.length === 0) {
                setProducts([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Fetch basic product info + category names
                const { data, error: fetchError } = await supabase
                    .from('products')
                    .select(`
                        id, 
                        name, 
                        price, 
                        images, 
                        stock, 
                        category_id,
                        categories(name)
                    `)
                    .in('id', wishlistIds);

                if (fetchError) throw fetchError;

                // Format data correctly for ProductCard
                const formattedProducts = data?.map((p: any) => ({
                    ...p,
                    rating: 5, // Mock default rating
                    reviews_count: 12 // Mock default reviews
                })) || [];

                setProducts(formattedProducts);
            } catch (err: any) {
                console.error('Error fetching wishlist products:', err);
                setError('Failed to load your wishlist. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        // We only want to refetch from DB when the user navigates here or reloads, 
        // to stay relatively fast, but we will filter out products locally 
        // if they remove them while ON the wishlist page.
        fetchWishlistProducts();
    }, [supabase, JSON.stringify(wishlistIds)]);

    // Local override: if user removes an item from wishlist WHILE on this page, 
    // instantly hide it from the grid without a DB roundtrip.
    const displayProducts = products.filter(p => wishlistIds.includes(p.id));

    // Handle hydration mismatch cleanly since Zustand + NextJS SSR can be tricky
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className={styles.container} style={{ minHeight: '100vh' }} />;

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loader}>
                    <div className={styles.spinner}></div>
                    <p>Loading your favorite items...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>
                    <HeartCrack size={48} opacity={0.5} />
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <Button variant="secondary" onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Your Wishlist</h1>
                    <p className={styles.subtitle}>
                        {displayProducts.length} {displayProducts.length === 1 ? 'item' : 'items'} saved for later
                    </p>
                </div>
            </div>

            {displayProducts.length === 0 ? (
                <div className={styles.emptyState}>
                    <HeartCrack size={64} style={{ color: 'var(--primary-color)', opacity: 0.8 }} />
                    <h2>Your wishlist is empty</h2>
                    <p>Looks like you haven't added any premium electronics to your wishlist yet. Explore our shop to find your next favorite tech.</p>
                    <Link href="/shop" style={{ marginTop: '1rem' }}>
                        <Button variant="primary">
                            <ShoppingBag size={18} style={{ marginRight: '8px' }} />
                            Start Shopping
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {displayProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={{
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                categoryName: product.categories?.name || 'Category',
                                imageUrl: product.images?.[0] || 'https://images.unsplash.com/photo-1542393545-10f5cde2f810?q=80&w=500&auto=format&fit=crop',
                                rating: product.rating
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
