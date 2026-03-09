"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { Search, Eye, ChevronDown } from 'lucide-react';
import styles from '../products/products.module.css';

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
    const supabase = createClient();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchOrders = async () => {
        let query = supabase
            .from('orders')
            .select('id, created_at, status, total_price, user_id, profiles(full_name, email)')
            .order('created_at', { ascending: false });

        if (statusFilter) query = query.eq('status', statusFilter);

        const { data } = await query;
        let filtered = data || [];

        if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter((o: any) => {
                const profile = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
                return (
                    o.id.toLowerCase().includes(s) ||
                    profile?.full_name?.toLowerCase().includes(s) ||
                    profile?.email?.toLowerCase().includes(s)
                );
            });
        }

        setOrders(filtered);
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, [statusFilter]);
    useEffect(() => {
        const timer = setTimeout(() => fetchOrders(), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);

        if (error) {
            console.error("Error updating order:", error);
            alert("Failed to update status: " + error.message);
        } else {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        }

        setUpdatingId(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return styles.statusActive;
            case 'cancelled': return styles.statusOut;
            default: return '';
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Orders</h1>
                    <p className={styles.subtitle}>Manage customer orders ({orders.length} total)</p>
                </div>
            </header>

            <GlassPanel className={styles.tablePanel}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by ID or customer..."
                            className={styles.searchInput}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={styles.filters}>
                        <select
                            className={styles.filterSelect}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No orders found.</td></tr>
                            ) : orders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: 500, fontFamily: 'monospace' }}>#{order.id.slice(0, 8)}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>
                                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td>{(() => { const p = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles; return p?.full_name || p?.email || 'Guest'; })()}</td>
                                    <td style={{ fontWeight: 500 }}>₹{Number(order.total_price).toFixed(2)}</td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            disabled={updatingId === order.id}
                                            className={styles.filterSelect}
                                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', minWidth: '120px' }}
                                        >
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <Link href={`/track-order?id=${order.id}`}>
                                            <Button variant="icon" size="sm" className={styles.iconBtn}>
                                                <Eye size={16} />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassPanel>
        </div>
    );
}
