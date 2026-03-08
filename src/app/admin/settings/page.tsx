"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Tag, Plus, Trash2, X, Loader2, Percent, Store, Save } from 'lucide-react';
import styles from './settings.module.css';

export default function AdminSettings() {
    const supabase = createClient();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Store Settings
    const [storeSettings, setStoreSettings] = useState({
        tax_rate: '8',
        free_shipping_threshold: '1000'
    });
    const [savingSettings, setSavingSettings] = useState(false);

    // Coupon form
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ code: '', discount_percent: '', max_uses: '', min_cart_value: '' });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        const [couponsRes, settingsRes] = await Promise.all([
            supabase.from('coupons').select('*').order('created_at', { ascending: false }),
            supabase.from('store_settings').select('*').eq('id', 'global').single()
        ]);

        setCoupons(couponsRes.data || []);
        if (settingsRes.data) {
            setStoreSettings({
                tax_rate: String(settingsRes.data.tax_rate),
                free_shipping_threshold: String(settingsRes.data.free_shipping_threshold)
            });
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            const { error } = await supabase.from('store_settings').upsert({
                id: 'global',
                tax_rate: parseFloat(storeSettings.tax_rate),
                free_shipping_threshold: parseFloat(storeSettings.free_shipping_threshold),
            });
            if (error) throw error;
            alert("Settings saved successfully!");
        } catch (err: any) {
            console.error(err);
            alert("Failed to save settings: " + err.message);
        } finally {
            setSavingSettings(false);
        }
    };

    const handleAddCoupon = async () => {
        setSaving(true);
        try {
            const { error } = await supabase.from('coupons').insert({
                code: form.code.toUpperCase(),
                discount_type: 'percentage',
                value: parseFloat(form.discount_percent),
                usage_limit: form.max_uses ? parseInt(form.max_uses) : null,
                min_cart_value: form.min_cart_value ? parseFloat(form.min_cart_value) : 0,
                is_active: true,
            });

            if (error) throw error;

            setForm({ code: '', discount_percent: '', max_uses: '', min_cart_value: '' });
            setShowForm(false);
            fetchData();
        } catch (err: any) {
            console.error(err);
            alert("Error creating coupon: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        await supabase.from('coupons').delete().eq('id', id);
        fetchData();
    };

    const handleToggleCoupon = async (id: string, currentActive: boolean) => {
        await supabase.from('coupons').update({ is_active: !currentActive }).eq('id', id);
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentActive } : c));
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Admin Settings</h1>
            </header>

            {/* Global Store Settings */}
            <GlassPanel className={styles.section} style={{ marginBottom: '2rem' }}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitleRow}>
                        <Store size={20} />
                        <h2>Store Configuration</h2>
                    </div>
                </div>

                <div className={styles.formGrid}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tax Rate (%)</label>
                        <Input
                            type="number"
                            value={storeSettings.tax_rate}
                            onChange={(e) => setStoreSettings(s => ({ ...s, tax_rate: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Free Shipping Threshold (₹)</label>
                        <Input
                            type="number"
                            value={storeSettings.free_shipping_threshold}
                            onChange={(e) => setStoreSettings(s => ({ ...s, free_shipping_threshold: e.target.value }))}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <Button variant="primary" onClick={handleSaveSettings} disabled={savingSettings}>
                        {savingSettings ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <><Save size={16} /> Save Settings</>}
                    </Button>
                </div>
            </GlassPanel>

            {/* Coupon Management */}
            <GlassPanel className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitleRow}>
                        <Tag size={20} />
                        <h2>Coupon Management</h2>
                    </div>
                    {!showForm && (
                        <Button variant="primary" onClick={() => setShowForm(true)}>
                            <Plus size={16} /> Add Coupon
                        </Button>
                    )}
                </div>

                {showForm && (
                    <div className={styles.formCard}>
                        <div className={styles.formHeader}>
                            <h3>New Coupon</h3>
                            <button className={styles.closeBtn} onClick={() => setShowForm(false)}><X size={18} /></button>
                        </div>
                        <div className={styles.formGrid}>
                            <Input placeholder="Coupon Code (e.g. SAVE20)" value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))} />
                            <Input placeholder="Discount %" type="number" value={form.discount_percent} onChange={(e) => setForm(f => ({ ...f, discount_percent: e.target.value }))} />
                            <Input placeholder="Min Cart Value (₹)" type="number" value={form.min_cart_value} onChange={(e) => setForm(f => ({ ...f, min_cart_value: e.target.value }))} />
                            <Input placeholder="Max Uses (optional)" type="number" value={form.max_uses} onChange={(e) => setForm(f => ({ ...f, max_uses: e.target.value }))} />
                        </div>
                        <div className={styles.formActions}>
                            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleAddCoupon} disabled={!form.code || !form.discount_percent || saving}>
                                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Coupon'}
                            </Button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>Loading coupons...</p>
                ) : coupons.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No coupons yet.</p>
                ) : (
                    <div className={styles.couponList}>
                        {coupons.map(coupon => (
                            <div key={coupon.id} className={styles.couponCard}>
                                <div className={styles.couponInfo}>
                                    <div className={styles.couponCode}>{coupon.code}</div>
                                    <div className={styles.couponMeta}>
                                        <span className={styles.couponDiscount}>
                                            <Percent size={12} /> {coupon.value}% off
                                        </span>
                                        {coupon.min_cart_value > 0 && <span>• Min Order: ₹{coupon.min_cart_value}</span>}
                                        {coupon.usage_limit && <span>• Max {coupon.usage_limit} uses</span>}
                                        {coupon.times_used > 0 && <span>• Used {coupon.times_used}x</span>}
                                    </div>
                                </div>
                                <div className={styles.couponActions}>
                                    <button
                                        className={`${styles.toggleBtn} ${coupon.is_active ? styles.toggleActive : ''}`}
                                        onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}
                                    >
                                        {coupon.is_active ? 'Active' : 'Disabled'}
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => handleDeleteCoupon(coupon.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassPanel>
        </div>
    );
}
