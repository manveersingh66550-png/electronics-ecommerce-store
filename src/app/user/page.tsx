"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useWishlistStore } from '@/store/wishlistStore';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ShoppingBag, Heart, Package, ArrowRight } from 'lucide-react';
import styles from './user.module.css';

export default function UserDashboard() {
    const [supabase] = useState(() => createClient());
    const wishlistItems = useWishlistStore((s) => s.items);

    const [orderCount, setOrderCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch order count
            const { count } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            setOrderCount(count || 0);

            // Fetch recent orders
            const { data: orders } = await supabase
                .from('orders')
                .select('id, created_at, status, total_price')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentOrders(orders || []);
        };
        fetchData();
    }, []);

    const wishlistCount = mounted ? wishlistItems.length : 0;

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'delivered': return styles.delivered;
            case 'shipped': return styles.shipped;
            case 'paid': return styles.paid;
            default: return '';
        }
    };

    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>Account Overview</h1>
            </div>

            <div className={styles.statsGrid}>
                <GlassPanel className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <ShoppingBag size={20} className={styles.statIcon} />
                        <h3>Total Orders</h3>
                    </div>
                    <p className={styles.statValue}>{orderCount}</p>
                    <Link href="/user/orders" className={styles.statLink}>
                        View order history <ArrowRight size={14} />
                    </Link>
                </GlassPanel>

                <GlassPanel className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <Heart size={20} className={styles.statIcon} style={{ color: '#ef4444' }} />
                        <h3>Wishlist Items</h3>
                    </div>
                    <p className={styles.statValue}>{wishlistCount}</p>
                    <Link href="/user/wishlist" className={styles.statLink}>
                        View saved items <ArrowRight size={14} />
                    </Link>
                </GlassPanel>

                <GlassPanel className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <Package size={20} className={styles.statIcon} />
                        <h3>Active Orders</h3>
                    </div>
                    <p className={styles.statValue}>
                        {recentOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
                    </p>
                    <Link href="/user/orders" className={styles.statLink}>
                        Track shipments <ArrowRight size={14} />
                    </Link>
                </GlassPanel>
            </div>

            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <GlassPanel className={styles.ordersPanel}>
                {recentOrders.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        No orders yet. <Link href="/shop" style={{ textDecoration: 'underline' }}>Start shopping</Link>
                    </p>
                ) : (
                    <div className={styles.orderList}>
                        {recentOrders.map((order, idx) => (
                            <React.Fragment key={order.id}>
                                {idx > 0 && <div className={styles.divider}></div>}
                                <Link href={`/track-order?id=${order.id}`} className={styles.orderItem}>
                                    <div className={styles.orderCol}>
                                        <span className={styles.orderLabel}>Order ID</span>
                                        <span className={styles.orderText}>#{order.id.slice(0, 8)}</span>
                                    </div>
                                    <div className={styles.orderCol}>
                                        <span className={styles.orderLabel}>Date</span>
                                        <span className={styles.orderText}>
                                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className={styles.orderCol}>
                                        <span className={styles.orderLabel}>Status</span>
                                        <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className={styles.orderCol}>
                                        <span className={styles.orderLabel}>Total</span>
                                        <span className={styles.orderText}>₹{Number(order.total_price).toFixed(2)}</span>
                                    </div>
                                </Link>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </GlassPanel>
        </>
    );
}
