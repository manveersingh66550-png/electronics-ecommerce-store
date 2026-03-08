"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Search, Users as UsersIcon } from 'lucide-react';
import styles from './customers.module.css';

export default function AdminCustomers() {
    const supabase = createClient();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, created_at')
                .order('created_at', { ascending: false });

            if (!profiles) { setLoading(false); return; }

            // Fetch order counts per user
            const { data: orders } = await supabase
                .from('orders')
                .select('user_id');

            const orderCounts: Record<string, number> = {};
            (orders || []).forEach(o => {
                orderCounts[o.user_id] = (orderCounts[o.user_id] || 0) + 1;
            });

            const enriched = profiles.map(p => ({
                ...p,
                orderCount: orderCounts[p.id] || 0,
            }));

            setCustomers(enriched);
            setLoading(false);
        };
        fetchCustomers();
    }, []);

    const filtered = search
        ? customers.filter(c =>
            c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase())
        )
        : customers;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Customers</h1>
                    <p className={styles.subtitle}>{customers.length} registered customer{customers.length !== 1 ? 's' : ''}</p>
                </div>
            </header>

            <GlassPanel className={styles.tablePanel}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className={styles.searchInput}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Joined</th>
                                <th>Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No customers found.</td></tr>
                            ) : filtered.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div className={styles.customerCell}>
                                            <div className={styles.avatar}>
                                                {c.full_name ? c.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : c.email?.slice(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{c.full_name || 'Unnamed'}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{c.email}</td>
                                    <td>
                                        {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td>
                                        <span className={styles.orderCountBadge}>{c.orderCount}</span>
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
