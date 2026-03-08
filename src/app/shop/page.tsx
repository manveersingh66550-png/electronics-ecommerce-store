"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SlidersHorizontal, ChevronDown, X, Plus, Check, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cartStore';
import { AnimatedSection } from '@/components/home/AnimatedSection/AnimatedSection';
import styles from './page.module.css';

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [supabase] = useState(() => createClient());
    const addItem = useCartStore((state) => state.addItem);

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

    // Filters from URL
    const categoryId = searchParams.get('category');
    const minPrice = parseInt(searchParams.get('price_min') || '0');
    const maxPrice = parseInt(searchParams.get('price_max') || '999999');
    const inStockOnly = searchParams.get('in_stock') === 'true';
    const sort = searchParams.get('sort') || 'featured';
    const queryTerm = searchParams.get('q') || '';

    // Active filter count
    const activeFilterCount = [
        categoryId,
        minPrice > 0,
        maxPrice < 999999,
        inStockOnly,
    ].filter(Boolean).length;

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*').order('name');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                let query = supabase.from('products').select(`
                    *,
                    categories (name),
                    product_media (url)
                `);

                if (categoryId) query = query.eq('category_id', categoryId);
                if (minPrice > 0) query = query.gte('price', minPrice);
                if (maxPrice < 999999) query = query.lte('price', maxPrice);
                if (inStockOnly) query = query.gt('stock', 0);
                if (queryTerm) query = query.ilike('name', `%${queryTerm}%`);

                switch (sort) {
                    case 'price_asc': query = query.order('price', { ascending: true }); break;
                    case 'price_desc': query = query.order('price', { ascending: false }); break;
                    case 'newest': query = query.order('created_at', { ascending: false }); break;
                    default: query = query.order('name', { ascending: true });
                }

                const { data, error } = await query;
                if (error) console.error('Products query error:', error);

                if (data && !error) {
                    setProducts(data.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        stock: p.stock || 0,
                        categoryName: p.categories?.name,
                        imageUrl: p.product_media?.[0]?.url || (p.images?.[0] || ''),
                        rating: p.rating || 4.5,
                    })));
                }
            } catch (err) {
                console.error('fetchProducts unexpected error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [categoryId, minPrice, maxPrice, inStockOnly, sort, queryTerm]);

    const updateURL = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === null || value === '') params.delete(key);
        else params.set(key, value);
        router.push(`/shop?${params.toString()}`);
    };

    const clearAllFilters = () => router.push('/shop');

    const handleAddToCart = (product: any) => {
        addItem({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.imageUrl || '/placeholder.png',
            stock: product.stock || 10,
        });
        setAddedIds((prev) => new Set(prev).add(product.id));
        setTimeout(() => {
            setAddedIds((prev) => { const n = new Set(prev); n.delete(product.id); return n; });
        }, 1200);
    };

    const getCategoryName = () => {
        if (!categoryId) return null;
        const cat = categories.find((c: any) => c.id === categoryId);
        return cat?.name || null;
    };

    return (
        <div className={styles.shopPage}>
            {/* Hero */}
            <AnimatedSection direction="up" delay={0.1}>
                <header className={styles.hero}>
                    <span className={styles.heroBadge}>SHOP</span>
                    <h1 className={styles.heroTitle}>
                        {queryTerm ? `Results for "${queryTerm}"` : getCategoryName() || 'All Products'}
                    </h1>
                    <p className={styles.heroDesc}>
                        {queryTerm
                            ? `Showing results matching your search.`
                            : 'Discover our curated collection of premium electronics.'}
                    </p>
                </header>
            </AnimatedSection>

            {/* Toolbar: Filters + Sort */}
            <div className={styles.toolbar}>
                <button
                    className={`${styles.filterToggle} ${filterOpen ? styles.filterToggleActive : ''}`}
                    onClick={() => setFilterOpen(!filterOpen)}
                >
                    <SlidersHorizontal size={18} />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className={styles.filterBadge}>{activeFilterCount}</span>
                    )}
                </button>

                <div className={styles.toolbarRight}>
                    <span className={styles.resultCount}>{products.length} products</span>
                    <div className={styles.sortWrap}>
                        <select
                            className={styles.sortSelect}
                            value={sort}
                            onChange={(e) => updateURL('sort', e.target.value)}
                        >
                            <option value="featured">Featured</option>
                            <option value="price_asc">Price: Low → High</option>
                            <option value="price_desc">Price: High → Low</option>
                            <option value="newest">Newest</option>
                        </select>
                        <ChevronDown size={14} className={styles.sortChevron} />
                    </div>
                </div>
            </div>

            {/* Filter Panel (collapsible) */}
            <div className={`${styles.filterPanel} ${filterOpen ? styles.filterPanelOpen : ''}`}>
                <div className={styles.filterInner}>
                    {/* Category chips */}
                    <div className={styles.filterGroup}>
                        <h4 className={styles.filterLabel}>Category</h4>
                        <div className={styles.chipRow}>
                            <button
                                className={`${styles.chip} ${!categoryId ? styles.chipActive : ''}`}
                                onClick={() => updateURL('category', null)}
                            >
                                All
                            </button>
                            {categories.map((cat: any) => (
                                <button
                                    key={cat.id}
                                    className={`${styles.chip} ${categoryId === cat.id ? styles.chipActive : ''}`}
                                    onClick={() => updateURL('category', cat.id)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price range */}
                    <div className={styles.filterGroup}>
                        <h4 className={styles.filterLabel}>Price Range</h4>
                        <div className={styles.priceInputs}>
                            <input
                                type="number"
                                placeholder="Min ₹"
                                className={styles.priceInput}
                                defaultValue={minPrice > 0 ? minPrice : ''}
                                onBlur={(e) => updateURL('price_min', e.target.value || null)}
                            />
                            <span className={styles.priceDash}>—</span>
                            <input
                                type="number"
                                placeholder="Max ₹"
                                className={styles.priceInput}
                                defaultValue={maxPrice < 999999 ? maxPrice : ''}
                                onBlur={(e) => updateURL('price_max', e.target.value || null)}
                            />
                        </div>
                    </div>

                    {/* In stock toggle */}
                    <div className={styles.filterGroup}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={inStockOnly}
                                onChange={(e) => updateURL('in_stock', e.target.checked ? 'true' : null)}
                                className={styles.toggleInput}
                            />
                            <span className={styles.toggleSwitch} />
                            In Stock Only
                        </label>
                    </div>

                    {/* Clear all */}
                    {activeFilterCount > 0 && (
                        <button className={styles.clearBtn} onClick={clearAllFilters}>
                            <X size={14} /> Clear all filters
                        </button>
                    )}
                </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    <p>Loading products...</p>
                </div>
            ) : products.length > 0 ? (
                <div className={styles.productGrid}>
                    {products.map((product, idx) => (
                        <AnimatedSection key={product.id} direction="up" delay={0.05 + idx * 0.03}>
                            <div className={styles.card}>
                                <Link href={`/product/${product.id}`} className={styles.cardImageLink}>
                                    <div className={styles.cardImage}>
                                        {product.imageUrl ? (
                                            <Image
                                                src={product.imageUrl}
                                                alt={product.name}
                                                fill
                                                style={{ objectFit: 'contain' }}
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                        ) : (
                                            <div className={styles.noImage}>No image</div>
                                        )}
                                    </div>
                                </Link>

                                <div className={styles.cardBody}>
                                    {product.categoryName && (
                                        <span className={styles.cardCategory}>{product.categoryName}</span>
                                    )}
                                    <Link href={`/product/${product.id}`} className={styles.cardTitleLink}>
                                        <h3 className={styles.cardTitle}>{product.name}</h3>
                                    </Link>
                                    <div className={styles.cardFooter}>
                                        <span className={styles.cardPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                                        <button
                                            className={`${styles.addBtn} ${addedIds.has(product.id) ? styles.addBtnDone : ''}`}
                                            onClick={() => handleAddToCart(product)}
                                            title="Add to cart"
                                        >
                                            {addedIds.has(product.id)
                                                ? <Check size={18} strokeWidth={2.5} />
                                                : <Plus size={18} strokeWidth={2.5} />
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <Search size={48} strokeWidth={1} className={styles.emptyIcon} />
                    <h2>No products found</h2>
                    <p>Try adjusting your filters or search criteria.</p>
                    {activeFilterCount > 0 && (
                        <button className={styles.clearBtn} onClick={clearAllFilters}>
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div style={{ padding: '8rem', textAlign: 'center' }}>Loading Shop...</div>}>
            <ShopContent />
        </Suspense>
    );
}
