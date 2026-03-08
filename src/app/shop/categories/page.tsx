"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AnimatedSection } from '@/components/home/AnimatedSection/AnimatedSection';
import { LiquidGlass } from '@/components/home/LiquidGlass/LiquidGlass';
import {
    Smartphone, Laptop, Headphones, Watch, Monitor, Gamepad2,
    Camera, Speaker, Keyboard, Mouse, Tablet, Cable, LayoutGrid
} from 'lucide-react';
import styles from './page.module.css';

// Map category slugs/names to icons
const CATEGORY_ICONS: Record<string, any> = {
    smartphones: Smartphone,
    laptops: Laptop,
    audio: Headphones,
    wearables: Watch,
    monitors: Monitor,
    gaming: Gamepad2,
    cameras: Camera,
    speakers: Speaker,
    keyboards: Keyboard,
    mice: Mouse,
    tablets: Tablet,
    accessories: Cable,
};

function getIcon(slug: string) {
    return CATEGORY_ICONS[slug] || LayoutGrid;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*, products(id)')
                    .order('name');

                if (error) console.error('Categories query error:', error);

                if (data && !error) {
                    const formatted = data.map((cat: any) => ({
                        ...cat,
                        productCount: cat.products?.length || 0,
                    }));
                    setCategories(formatted);
                }
            } catch (err) {
                console.error('fetchCategories unexpected error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Header */}
            <AnimatedSection direction="up" delay={0.1}>
                <section className={styles.hero}>
                    <span className={styles.heroBadge}>BROWSE</span>
                    <h1 className={styles.heroTitle}>All Categories</h1>
                    <p className={styles.heroDesc}>
                        Explore our curated electronics catalog organized by category. Find exactly what you need.
                    </p>
                </section>
            </AnimatedSection>

            {/* Category Grid */}
            {isLoading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    <p>Loading categories...</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {categories.map((cat, idx) => {
                        const Icon = getIcon(cat.slug);
                        return (
                            <AnimatedSection key={cat.id} direction="up" delay={0.1 + idx * 0.06}>
                                <Link href={`/shop?category=${cat.id}`} className={styles.cardLink}>
                                    <LiquidGlass className={styles.card} config={{ radius: 28, frost: 0.12, blur: 14 }}>
                                        <div className={styles.cardContent}>
                                            <div className={styles.iconWrap}>
                                                <Icon size={32} strokeWidth={1.5} className={styles.icon} />
                                            </div>
                                            <h3 className={styles.cardTitle}>{cat.name}</h3>
                                            <span className={styles.cardCount}>
                                                {cat.productCount} {cat.productCount === 1 ? 'product' : 'products'}
                                            </span>
                                            <div className={styles.cardArrow}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </LiquidGlass>
                                </Link>
                            </AnimatedSection>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
