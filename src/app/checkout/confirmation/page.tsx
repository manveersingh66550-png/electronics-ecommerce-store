"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { CheckCircle2, Package, ArrowRight, Copy, Check } from 'lucide-react';
import styles from './confirmation.module.css';

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const supabase = createClient();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) { setLoading(false); return; }

            const { data } = await supabase
                .from('orders')
                .select('*, addresses(*)')
                .eq('id', orderId)
                .single();

            if (data) setOrder(data);
            setLoading(false);
        };
        fetchOrder();
    }, [orderId]);

    const handleCopyOrderId = () => {
        if (orderId) {
            navigator.clipboard.writeText(orderId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return <div className={styles.container}><div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div></div>;
    }

    if (!order) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <Package size={48} />
                    <h2>Order not found</h2>
                    <Link href="/shop"><Button variant="primary">Continue Shopping</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.successHeader}>
                <div className={styles.successIcon}>
                    <CheckCircle2 size={64} />
                </div>
                <h1 className={styles.title}>Order Confirmed!</h1>
                <p className={styles.subtitle}>
                    Thank you for your purchase. Your order has been received and is being processed.
                </p>
            </div>

            <GlassPanel className={styles.orderCard}>
                <div className={styles.orderIdRow}>
                    <div>
                        <span className={styles.label}>Order ID</span>
                        <span className={styles.orderId}>{orderId?.slice(0, 8)}...</span>
                    </div>
                    <button className={styles.copyBtn} onClick={handleCopyOrderId}>
                        {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                    </button>
                </div>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailBlock}>
                        <span className={styles.label}>Status</span>
                        <span className={styles.badge}>{order.status}</span>
                    </div>
                    <div className={styles.detailBlock}>
                        <span className={styles.label}>Total</span>
                        <span className={styles.amount}>₹{Number(order.total_price).toFixed(2)}</span>
                    </div>
                    <div className={styles.detailBlock}>
                        <span className={styles.label}>Date</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    {order.addresses && (
                        <div className={styles.detailBlock}>
                            <span className={styles.label}>Shipping To</span>
                            <span>{order.addresses.city}, {order.addresses.state}</span>
                        </div>
                    )}
                </div>

                <div className={styles.estimateBox}>
                    <Package size={20} />
                    <div>
                        <strong>Estimated Delivery</strong>
                        <p>
                            {order.shipping_method === 'express' ? 'Your order will arrive in 2–3 business days.' :
                             order.shipping_method === 'overnight' ? 'Your order will arrive in 1 business day.' :
                             'Your order will arrive in 5–7 business days.'}
                        </p>
                    </div>
                </div>
            </GlassPanel>

            <div className={styles.actions}>
                <Link href={`/track-order?id=${orderId}`}>
                    <Button variant="secondary">Track Order</Button>
                </Link>
                <Link href="/shop">
                    <Button variant="primary">
                        Continue Shopping <ArrowRight size={18} />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div style={{ padding: '8rem', textAlign: 'center' }}>Loading confirmation...</div>}>
            <ConfirmationContent />
        </Suspense>
    );
}
