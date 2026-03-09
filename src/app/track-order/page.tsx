"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Search, Package, CheckCircle2, Truck, CreditCard, Clock, Loader2 } from 'lucide-react';
import styles from './track-order.module.css';

const ORDER_STEPS = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'paid', label: 'Payment Confirmed', icon: CreditCard },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

function TrackOrderContent() {
    const searchParams = useSearchParams();
    const initialId = searchParams.get('id') || '';
    const supabase = createClient();

    const [orderId, setOrderId] = useState(initialId);
    const [order, setOrder] = useState<any>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const fetchOrder = async (id: string) => {
        if (!id.trim()) return;
        setLoading(true);
        setError(null);
        setSearched(true);

        const { data: orderData, error: orderErr } = await supabase
            .from('orders')
            .select('*, addresses(*)')
            .eq('id', id.trim())
            .single();

        if (orderErr || !orderData) {
            setError('Order not found. Please check your order ID and try again.');
            setOrder(null);
            setOrderItems([]);
            setLoading(false);
            return;
        }

        // Fetch order items
        const { data: itemsData } = await supabase
            .from('order_items')
            .select('*, products(name, images)')
            .eq('order_id', id.trim());

        setOrder(orderData);
        setOrderItems(itemsData || []);
        setLoading(false);
    };

    useEffect(() => {
        if (initialId) fetchOrder(initialId);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchOrder(orderId);
    };

    // Determine which step the order is at
    const currentStepIndex = order ? ORDER_STEPS.findIndex(s => s.key === order.status) : -1;

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Track Your Order</h1>
            <p className={styles.subtitle}>Enter your order ID to check the status of your shipment.</p>

            <form className={styles.searchForm} onSubmit={handleSubmit}>
                <div className={styles.searchInputWrapper}>
                    <Input
                        placeholder="Enter Order ID"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                    />
                </div>
                <Button variant="primary" type="submit" disabled={loading || !orderId.trim()}>
                    {loading ? <Loader2 size={18} className={styles.spinnerIcon} /> : <Search size={18} />}
                    Track
                </Button>
            </form>

            {error && (
                <div className={styles.errorBanner}>{error}</div>
            )}

            {order && (
                <div className={styles.resultContainer}>
                    {/* Timeline */}
                    <GlassPanel className={styles.timelineCard}>
                        <h2 className={styles.sectionTitle}>Order Status</h2>
                        <div className={styles.timeline}>
                            {ORDER_STEPS.map((step, idx) => {
                                const isComplete = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                const StepIcon = step.icon;

                                return (
                                    <div key={step.key} className={`${styles.timelineStep} ${isComplete ? styles.stepComplete : ''} ${isCurrent ? styles.stepCurrent : ''}`}>
                                        <div className={styles.timelineDotWrapper}>
                                            <div className={styles.timelineDot}>
                                                <StepIcon size={16} />
                                            </div>
                                            {idx < ORDER_STEPS.length - 1 && (
                                                <div className={`${styles.timelineConnector} ${isComplete && idx < currentStepIndex ? styles.connectorComplete : ''}`} />
                                            )}
                                        </div>
                                        <div className={styles.timelineContent}>
                                            <span className={styles.timelineLabel}>{step.label}</span>
                                            {isCurrent && <span className={styles.currentBadge}>Current</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </GlassPanel>

                    {/* Order Details */}
                    <GlassPanel className={styles.detailsCard}>
                        <h2 className={styles.sectionTitle}>Order Details</h2>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Order ID</span>
                                <span className={styles.detailValue}>{order.id.slice(0, 8)}...</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Date</span>
                                <span className={styles.detailValue}>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Total</span>
                                <span className={styles.detailValue}>₹{Number(order.total_price).toFixed(2)}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Payment</span>
                                <span className={styles.detailValue} style={{ textTransform: 'capitalize' }}>{order.payment_status}</span>
                            </div>
                        </div>

                        {orderItems.length > 0 && (
                            <>
                                <h3 className={styles.itemsTitle}>Items</h3>
                                <div className={styles.itemsList}>
                                    {orderItems.map(item => (
                                        <div key={item.id} className={styles.orderItem}>
                                            <span className={styles.orderItemName}>
                                                {item.quantity}× {(() => {
                                                    const p = Array.isArray(item.products) ? item.products[0] : item.products;
                                                    return p?.name || 'Product';
                                                })()}
                                            </span>
                                            <span className={styles.orderItemPrice}>
                                                ₹{(Number(item.price) * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {order.addresses && (
                            <div className={styles.addressBlock}>
                                <span className={styles.detailLabel}>Shipping Address</span>
                                <p>{order.addresses.street}, {order.addresses.city}, {order.addresses.state} {order.addresses.zip}</p>
                            </div>
                        )}
                    </GlassPanel>
                </div>
            )}

            {searched && !order && !loading && !error && (
                <div className={styles.notFound}>
                    <Package size={48} />
                    <p>No order found with that ID.</p>
                </div>
            )}
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div style={{ padding: '8rem', textAlign: 'center' }}>Loading...</div>}>
            <TrackOrderContent />
        </Suspense>
    );
}
