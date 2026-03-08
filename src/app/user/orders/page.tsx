"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Package, ExternalLink } from 'lucide-react';
import styles from './orders.module.css';

export default function OrdersPage() {
    const [supabase] = useState(() => createClient());
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('orders')
                .select('id, created_at, status, payment_status, total_price, tax_amount, shipping_amount')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setOrders(data || []);
            setLoading(false);
        };
        fetchOrders();
    }, []);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'delivered': return styles.statusDelivered;
            case 'shipped': return styles.statusShipped;
            case 'paid':
            case 'processing': return styles.statusProcessing;
            case 'cancelled': return styles.statusCancelled;
            default: return styles.statusPending;
        }
    };

    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>My Orders</h1>
                <p className={styles.subtitle}>{orders.length} total orders</p>
            </div>

            {loading ? (
                <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
                <GlassPanel className={styles.emptyState}>
                    <Package size={48} />
                    <h3>No orders yet</h3>
                    <p>Your order history will appear here after your first purchase.</p>
                    <Link href="/shop" className={styles.shopLink}>Start Shopping</Link>
                </GlassPanel>
            ) : (
                <div className={styles.ordersList}>
                    {/* Table Header */}
                    <div className={styles.tableHeader}>
                        <span>Order</span>
                        <span>Date</span>
                        <span>Status</span>
                        <span>Total</span>
                        <span></span>
                    </div>

                    {orders.map((order) => (
                        <GlassPanel key={order.id} className={styles.orderRow}>
                            <div className={styles.orderCell}>
                                <span className={styles.orderId}>#{order.id.slice(0, 8)}</span>
                            </div>
                            <div className={styles.orderCell}>
                                <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className={styles.orderCell}>
                                <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className={styles.orderCell}>
                                <span className={styles.totalAmount}>₹{Number(order.total_price).toFixed(2)}</span>
                            </div>
                            <div className={styles.orderCell}>
                                <Link href={`/track-order?id=${order.id}`} className={styles.trackLink}>
                                    <ExternalLink size={14} /> Track
                                </Link>
                            </div>
                        </GlassPanel>
                    ))}
                </div>
            )}
        </>
    );
}
