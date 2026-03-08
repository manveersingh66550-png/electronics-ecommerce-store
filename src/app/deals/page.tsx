"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TicketPercent, Copy, Check, ArrowRight, Clock, Zap, Plus, Sparkles, Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cartStore';
import { AnimatedSection } from '@/components/home/AnimatedSection/AnimatedSection';
import styles from './page.module.css';

interface Coupon {
    id: string;
    code: string;
    discount_type: string;
    value: number;
    usage_limit: number | null;
    times_used: number;
    expiry_date: string | null;
    created_at: string;
}

function CouponCard({ coupon }: { coupon: Coupon }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const discountLabel = coupon.discount_type === 'percentage'
        ? `${coupon.value}% OFF`
        : coupon.value
            ? `₹${coupon.value} OFF`
            : 'SPECIAL DEAL';

    const isExpiringSoon = coupon.expiry_date
        && new Date(coupon.expiry_date).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

    return (
        <div className={styles.couponCard}>
            <div className={styles.couponLeft}>
                <div className={styles.couponDiscount}>
                    <TicketPercent size={20} />
                    <span>{discountLabel}</span>
                </div>
                {isExpiringSoon && (
                    <div className={styles.couponExpiry}>
                        <Clock size={12} />
                        <span>Expires soon</span>
                    </div>
                )}
                {coupon.expiry_date && !isExpiringSoon && (
                    <div className={styles.couponExpiryNormal}>
                        <Clock size={12} />
                        <span>Valid till {new Date(coupon.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                )}
            </div>
            <div className={styles.couponRight}>
                <div className={styles.couponCodeBox}>
                    <span className={styles.couponCode}>{coupon.code}</span>
                </div>
                <button className={styles.copyBtn} onClick={handleCopy}>
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
                <Link href={`/cart?coupon=${coupon.code}`} className={styles.applyLink}>
                    Apply & Shop →
                </Link>
            </div>
        </div>
    );
}

export default function DealsPage() {
    const [supabase] = useState(() => createClient());
    const addItem = useCartStore((state) => state.addItem);

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [dealProducts, setDealProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchDeals() {
            try {
                // Fetch active coupons
                const { data: couponData, error: couponError } = await supabase
                    .from('coupons')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });

                if (couponError) console.error('Coupons fetch error:', couponError);

                if (couponData) {
                    // Filter out expired coupons
                    const validCoupons = couponData.filter((c: Coupon) => {
                        if (!c.expiry_date) return true;
                        return new Date(c.expiry_date) > new Date();
                    });
                    setCoupons(validCoupons);
                }

                // Fetch deal products (best value / popular items)
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select(`
                        id, name, price, images, stock, sales_count,
                        categories(name),
                        product_media(url)
                    `)
                    .order('sales_count', { ascending: false })
                    .limit(8);

                if (productError) console.error('Products fetch error:', productError);

                if (productData) {
                    setDealProducts(productData.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        stock: p.stock || 0,
                        categoryName: p.categories?.name,
                        imageUrl: p.product_media?.[0]?.url || (p.images?.[0] || ''),
                    })));
                }
            } catch (err) {
                console.error('fetchDeals unexpected error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchDeals();
    }, []);

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

    return (
        <div className={styles.dealsPage}>
            {/* Hero Section */}
            <AnimatedSection direction="up" delay={0.1}>
                <section className={styles.hero}>
                    <div className={styles.heroGlow} />
                    <span className={styles.heroBadge}>
                        <Zap size={14} /> EXCLUSIVE DEALS
                    </span>
                    <h1 className={styles.heroTitle}>Deals & Offers</h1>
                    <p className={styles.heroDesc}>
                        Grab exclusive discounts, voucher codes, and limited-time offers on premium electronics.
                    </p>
                </section>
            </AnimatedSection>

            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    <p>Loading deals...</p>
                </div>
            ) : (
                <>
                    {/* Active Coupons Section */}
                    {coupons.length > 0 && (
                        <AnimatedSection direction="up" delay={0.15}>
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionBadge}>
                                        <Tag size={14} />
                                        <span>Vouchers</span>
                                    </div>
                                    <h2 className={styles.sectionTitle}>Active Coupons</h2>
                                    <p className={styles.sectionDesc}>Use these codes at checkout to save on your order.</p>
                                </div>
                                <div className={styles.couponGrid}>
                                    {coupons.map((coupon) => (
                                        <CouponCard key={coupon.id} coupon={coupon} />
                                    ))}
                                </div>
                            </section>
                        </AnimatedSection>
                    )}

                    {/* No coupons state */}
                    {coupons.length === 0 && (
                        <AnimatedSection direction="up" delay={0.15}>
                            <section className={styles.noCoupons}>
                                <Sparkles size={40} strokeWidth={1} className={styles.noCouponsIcon} />
                                <h3>No active coupons right now</h3>
                                <p>Check back soon — we regularly drop exclusive deals!</p>
                            </section>
                        </AnimatedSection>
                    )}

                    {/* Deal Products */}
                    {dealProducts.length > 0 && (
                        <AnimatedSection direction="up" delay={0.2}>
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionBadge}>
                                        <Zap size={14} />
                                        <span>Top Picks</span>
                                    </div>
                                    <h2 className={styles.sectionTitle}>Featured Deals</h2>
                                    <p className={styles.sectionDesc}>Popular products at the best prices. Apply a coupon above for extra savings.</p>
                                </div>
                                <div className={styles.productGrid}>
                                    {dealProducts.map((product, idx) => (
                                        <AnimatedSection key={product.id} direction="up" delay={0.05 + idx * 0.03}>
                                            <div className={styles.productCard}>
                                                <Link href={`/product/${product.id}`} className={styles.productImageLink}>
                                                    <div className={styles.productImage}>
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
                                                <div className={styles.productBody}>
                                                    {product.categoryName && (
                                                        <span className={styles.productCat}>{product.categoryName}</span>
                                                    )}
                                                    <Link href={`/product/${product.id}`} className={styles.productTitleLink}>
                                                        <h3 className={styles.productName}>{product.name}</h3>
                                                    </Link>
                                                    <div className={styles.productFooter}>
                                                        <span className={styles.productPrice}>₹{product.price.toLocaleString('en-IN')}</span>
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
                                <div className={styles.actionWrap}>
                                    <Link href="/shop" className={styles.shopAllBtn}>
                                        Browse All Products <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </section>
                        </AnimatedSection>
                    )}
                </>
            )}
        </div>
    );
}
