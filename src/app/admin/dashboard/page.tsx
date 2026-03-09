"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DollarSign, ShoppingBag, Users, TrendingUp, Package } from 'lucide-react';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
    const supabase = createClient();

    const [revenue, setRevenue] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            // Revenue & order count
            const { data: orders } = await supabase
                .from('orders')
                .select('id, total_price, created_at, status, user_id');

            if (orders) {
                setOrderCount(orders.length);
                setRevenue(orders.reduce((sum: number, o: any) => sum + Number(o.total_price || 0), 0));
            }

            // Customer count
            const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            setCustomerCount(count || 0);

            // Recent orders with profile info
            const { data: recent } = await supabase
                .from('orders')
                .select('id, total_price, status, created_at, user_id, profiles(full_name)')
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentOrders(recent || []);
            setLoading(false);
        };
        fetchStats();
    }, []);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'delivered':
            case 'paid': return styles.statusSuccess;
            default: return styles.statusPending;
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Dashboard Overview</h1>
                <p className={styles.subtitle}>Welcome back, Admin</p>
            </header>

            <div className={styles.statsGrid}>
                <GlassPanel className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Total Revenue</p>
                        <h3 className={styles.statValue}>
                            {loading ? '...' : `₹${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        </h3>
                    </div>
                </GlassPanel>

                <GlassPanel className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <ShoppingBag size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Total Orders</p>
                        <h3 className={styles.statValue}>{loading ? '...' : orderCount.toLocaleString()}</h3>
                    </div>
                </GlassPanel>

                <GlassPanel className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Customers</p>
                        <h3 className={styles.statValue}>{loading ? '...' : customerCount.toLocaleString()}</h3>
                    </div>
                </GlassPanel>
            </div>

            <div className={styles.mainGrid}>
                <GlassPanel className={styles.recentOrdersPanel}>
                    <h2 className={styles.panelTitle}>Recent Orders</h2>
                    {loading ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</p>
                    ) : recentOrders.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No orders yet.</p>
                    ) : (
                        <div className={styles.orderList}>
                            {recentOrders.map((order, idx) => (
                                <React.Fragment key={order.id}>
                                    {idx > 0 && <div className={styles.divider}></div>}
                                    <Link href={`/track-order?id=${order.id}`} className={styles.orderRow}>
                                        <div>
                                            <p className={styles.orderId}>#{order.id.slice(0, 8)}</p>
                                            <p className={styles.orderCustomer}>
                                                {order.profiles?.full_name || 'Guest'}
                                            </p>
                                        </div>
                                        <div className={styles.orderStatusContainer}>
                                            <span className={styles.orderAmount}>₹{Number(order.total_price).toFixed(2)}</span>
                                            <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </Link>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </GlassPanel>

                <GlassPanel className={styles.chartPanel}>
                    <h2 className={styles.panelTitle}>Quick Stats</h2>
                    <div className={styles.quickStats}>
                        <div className={styles.quickStatItem}>
                            <Package size={20} />
                            <div>
                                <span className={styles.quickStatValue}>
                                    {recentOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
                                </span>
                                <span className={styles.quickStatLabel}>Active Orders</span>
                            </div>
                        </div>
                        <div className={styles.quickStatItem}>
                            <TrendingUp size={20} />
                            <div>
                                <span className={styles.quickStatValue}>
                                    ${orderCount > 0 ? (revenue / orderCount).toFixed(0) : '0'}
                                </span>
                                <span className={styles.quickStatLabel}>Avg. Order Value</span>
                            </div>
                        </div>
                    </div>
                </GlassPanel>
            </div>
        </div>
    );
}
