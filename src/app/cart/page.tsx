"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cartStore';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Trash2, ArrowRight, Minus, Plus, ShoppingBag, Tag, Loader2 } from 'lucide-react';
import styles from './cart.module.css';

function CartContent() {
    const { items, removeItem, updateQuantity, getSubtotal, getTotalItems, applyCoupon: storeApplyCoupon, clearCoupon: storeClearCoupon } = useCartStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; value: number } | null>(null);

    // Dynamic Store settings
    const [storeSettings, setStoreSettings] = useState({ tax_rate: 8, free_shipping_threshold: 150 });

    const applyCouponByCode = useCallback(async (codeToApply: string) => {
        if (!codeToApply.trim()) return;
        setCouponLoading(true);
        setCouponError(null);

        const supabase = createClient();
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', codeToApply.trim().toUpperCase())
            .single();

        if (error || !data) {
            setCouponError('Invalid coupon code.');
            setCouponLoading(false);
            return;
        }

        // Check expiry
        if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
            setCouponError('This coupon has expired.');
            setCouponLoading(false);
            return;
        }

        // Check usage limit
        if (data.usage_limit && data.times_used >= data.usage_limit) {
            setCouponError('This coupon has been fully redeemed.');
            setCouponLoading(false);
            return;
        }

        // Check dynamic minimum order value from database
        if (data.min_cart_value && data.min_cart_value > 0) {
            const currentSubtotal = getSubtotal();
            if (currentSubtotal < data.min_cart_value) {
                setCouponError(`This coupon requires a minimum order of ₹${data.min_cart_value.toLocaleString('en-IN')}. Add ₹${(data.min_cart_value - currentSubtotal).toLocaleString('en-IN')} more.`);
                setCouponLoading(false);
                return;
            }
        }

        let calculatedDiscount = 0;
        const currentSubtotal = getSubtotal();
        if (data.discount_type === 'percentage') {
            calculatedDiscount = currentSubtotal * (data.value / 100);
        } else {
            calculatedDiscount = Math.min(data.value, currentSubtotal);
        }

        setAppliedCoupon({
            code: data.code,
            discount_type: data.discount_type,
            value: data.value,
        });
        setCouponCode(data.code); // Update the input field visually
        storeApplyCoupon(data.code, calculatedDiscount);
        setCouponLoading(false);

        // Remove the coupon parameter from the URL to clean it up
        router.replace('/cart', { scroll: false });
    }, [router, getSubtotal, storeApplyCoupon]);

    useEffect(() => {
        const fetchSettings = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('store_settings').select('*').eq('id', 'global').single();
            if (data) {
                setStoreSettings({
                    tax_rate: Number(data.tax_rate),
                    free_shipping_threshold: Number(data.free_shipping_threshold)
                });
            }
            setMounted(true);
        };
        fetchSettings();

        const urlCoupon = searchParams.get('coupon');
        if (urlCoupon && !appliedCoupon) {
            applyCouponByCode(urlCoupon);
        }
    }, [searchParams, appliedCoupon, applyCouponByCode]);

    if (!mounted) {
        return (
            <div className={styles.container}>
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading cart...</div>
            </div>
        );
    }

    const subtotal = getSubtotal();
    const taxRate = storeSettings.tax_rate / 100;
    const tax = subtotal * taxRate;
    const shippingThreshold = storeSettings.free_shipping_threshold;
    const shippingCost = subtotal >= shippingThreshold ? 0 : 499; // Assume express shipping base cost

    // Calculate discount - it's already in the store and recalculates if subtotal changes but for now we read it or calc here
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'percentage') {
            discount = subtotal * (appliedCoupon.value / 100);
        } else {
            discount = Math.min(appliedCoupon.value, subtotal);
        }
        // Update store with new discount if subtotal changed
        storeApplyCoupon(appliedCoupon.code, discount);
    }

    const total = subtotal - discount + tax + shippingCost;

    const handleApplyCoupon = async () => {
        applyCouponByCode(couponCode);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError(null);
        storeClearCoupon();
    };

    if (items.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <ShoppingBag size={56} />
                    </div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven&apos;t added anything yet.</p>
                    <Link href="/shop">
                        <Button variant="primary">Start Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Shopping Cart <span className={styles.itemCountBadge}>{getTotalItems()}</span></h1>

            <div className={styles.grid}>
                <div className={styles.cartItems}>
                    {items.map((item) => (
                        <GlassPanel key={item.id} className={styles.cartItem}>
                            <div className={styles.itemImage}>
                                <Image src={item.image_url || '/hero-headphone.png'} alt={item.name} fill style={{ objectFit: 'contain' }} />
                            </div>
                            <div className={styles.itemDetails}>
                                <h3 className={styles.itemName}>{item.name}</h3>
                                <p className={styles.itemPrice}>₹{item.price.toFixed(2)}</p>
                                {item.variant_id && <p className={styles.variantLabel}>Variant: {item.variant_id}</p>}
                                <div className={styles.itemActions}>
                                    <div className={styles.quantityControl}>
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                            <Minus size={14} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Remove item">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className={styles.itemTotal}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                        </GlassPanel>
                    ))}
                </div>

                <div className={styles.summarySection}>
                    <GlassPanel className={styles.summaryCard}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>

                        {/* Promo Code */}
                        <div className={styles.promoSection}>
                            {appliedCoupon ? (
                                <div className={styles.appliedCoupon}>
                                    <div className={styles.couponBadge}>
                                        <Tag size={14} />
                                        <span>{appliedCoupon.code}</span>
                                    </div>
                                    <button onClick={handleRemoveCoupon} className={styles.removeCouponBtn}>Remove</button>
                                </div>
                            ) : (
                                <div className={styles.promoInput}>
                                    <Input
                                        placeholder="Promo code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                    <Button
                                        variant="secondary"
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading}
                                        className={styles.applyBtn}
                                    >
                                        {couponLoading ? <Loader2 size={16} className={styles.spinnerIcon} /> : 'Apply'}
                                    </Button>
                                </div>
                            )}
                            {couponError && <p className={styles.couponError}>{couponError}</p>}
                        </div>

                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                                <span>Discount ({appliedCoupon?.discount_type === 'percentage' ? `${appliedCoupon.value}%` : 'Fixed'})</span>
                                <span>-${discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className={styles.summaryRow}>
                            <span>Estimated Tax ({storeSettings.tax_rate}%)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
                        </div>
                        {shippingCost > 0 && (
                            <p className={styles.shippingNote}>
                                Add ₹{(shippingThreshold - subtotal).toFixed(2)} more for free shipping
                            </p>
                        )}

                        <div className={styles.divider}></div>

                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>

                        <Link href="/checkout" style={{ width: '100%', display: 'block' }}>
                            <Button variant="primary" className={styles.checkoutBtn}>
                                Proceed to Checkout <ArrowRight size={18} />
                            </Button>
                        </Link>
                        <Link href="/shop" className={styles.continueLink}>
                            Continue Shopping
                        </Link>
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
}

export default function CartPage() {
    return (
        <Suspense fallback={<div className={styles.container} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading cart...</div>}>
            <CartContent />
        </Suspense>
    );
}
