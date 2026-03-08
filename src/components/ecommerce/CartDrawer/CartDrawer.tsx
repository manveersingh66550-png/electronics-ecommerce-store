"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingBag, X, Minus, Plus, ArrowRight } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button/Button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './CartDrawer.module.css';

export const CartDrawer = () => {
    const { isCartOpen, closeCart } = useUIStore();
    const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch for persistent store
    if (!mounted) return null;

    return (
        <>
            {isCartOpen && <div className={styles.overlay} onClick={closeCart} />}
            <div className={`${styles.drawer} ${isCartOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <ShoppingBag size={20} className={styles.headerIcon} />
                        <h2>Your Cart</h2>
                        <span className={styles.itemCount}>{items.length} items</span>
                    </div>
                    <button className={styles.closeBtn} onClick={closeCart} aria-label="Close Cart">
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {items.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIconWrapper}>
                                <ShoppingBag size={48} />
                            </div>
                            <h3>Your cart is empty</h3>
                            <p>Looks like you haven't added anything yet.</p>
                            <Button variant="primary" onClick={() => { closeCart(); router.push('/shop'); }}>
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className={styles.itemsList}>
                            {items.map((item) => (
                                <div key={item.id} className={styles.cartItem}>
                                    <div className={styles.itemImage}>
                                        <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'contain' }} />
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <div className={styles.itemHeader}>
                                            <h4>{item.name}</h4>
                                            <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="Remove item">
                                                <X size={16} />
                                            </button>
                                        </div>
                                        {item.variant_id && <p className={styles.variantInfo}>Variant: {item.variant_id}</p>}
                                        <div className={styles.itemFooter}>
                                            <div className={styles.quantityControl}>
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                                    <Minus size={14} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.subtotalRow}>
                            <span>Subtotal</span>
                            <span className={styles.subtotalValue}>₹{getSubtotal().toFixed(2)}</span>
                        </div>
                        <p className={styles.shippingNote}>Shipping and taxes calculated at checkout.</p>
                        <Button
                            variant="primary"
                            className={styles.checkoutBtn}
                            onClick={() => { closeCart(); router.push('/checkout'); }}
                        >
                            Proceed to Checkout
                            <ArrowRight size={18} />
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};
