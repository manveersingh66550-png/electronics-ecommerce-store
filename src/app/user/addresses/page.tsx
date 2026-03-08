"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { MapPin, Plus, Trash2, Edit3, X, Loader2 } from 'lucide-react';
import styles from './addresses.module.css';

interface Address {
    id: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

const INDIA_LOCATIONS: Record<string, string[]> = {
    "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Mayabunder"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
    "Chandigarh": ["Chandigarh"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    "Kerala": ["Trivandrum", "Kochi", "Kozhikode", "Thrissur", "Malappuram"],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Kavaratti"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    "Manipur": ["Imphal"],
    "Meghalaya": ["Shillong"],
    "Mizoram": ["Aizawl"],
    "Nagaland": ["Kohima", "Dimapur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur"],
    "Puducherry": ["Puducherry", "Karaikal"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer"],
    "Sikkim": ["Gangtok"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
    "Tripura": ["Agartala"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"]
};

const EMPTY_FORM = { street: '', city: '', state: '', zip: '', country: 'India' };

export default function AddressesPage() {
    const [supabase] = useState(() => createClient());
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const fetchAddresses = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        setAddresses(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchAddresses(); }, []);

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (editingId) {
            await supabase.from('addresses').update(form).eq('id', editingId);
        } else {
            await supabase.from('addresses').insert({ ...form, user_id: user.id });
        }

        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setSaving(false);
        fetchAddresses();
    };

    const handleEdit = (addr: Address) => {
        setForm({ street: addr.street, city: addr.city, state: addr.state, zip: addr.zip, country: addr.country });
        setEditingId(addr.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        await supabase.from('addresses').delete().eq('id', id);
        fetchAddresses();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const isValid = form.street && form.city && form.state && form.zip;

    return (
        <>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Saved Addresses</h1>
                    <p className={styles.subtitle}>{addresses.length} address{addresses.length !== 1 ? 'es' : ''} saved</p>
                </div>
                {!showForm && (
                    <Button variant="primary" onClick={() => setShowForm(true)}>
                        <Plus size={16} /> Add Address
                    </Button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <GlassPanel className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <h3>{editingId ? 'Edit Address' : 'New Address'}</h3>
                        <button className={styles.closeBtn} onClick={handleCancel}><X size={18} /></button>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.fullWidth}>
                            <Input placeholder="Street Address" value={form.street} onChange={(e) => setForm(f => ({ ...f, street: e.target.value }))} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>State</label>
                            <select
                                className={styles.select}
                                value={form.state}
                                onChange={(e) => setForm(f => ({ ...f, state: e.target.value, city: '' }))}
                                required
                            >
                                <option value="">Select State</option>
                                {Object.keys(INDIA_LOCATIONS).sort().map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>City</label>
                            <select
                                className={styles.select}
                                value={form.city}
                                onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                                disabled={!form.state}
                                required
                            >
                                <option value="">Select City</option>
                                {form.state && INDIA_LOCATIONS[form.state].sort().map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <Input placeholder="ZIP Code" value={form.zip} onChange={(e) => setForm(f => ({ ...f, zip: e.target.value }))} required />
                        <div className={styles.fullWidth}>
                            <Input placeholder="Country" value={form.country} readOnly disabled />
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave} disabled={!isValid || saving}>
                            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : (editingId ? 'Save Changes' : 'Add Address')}
                        </Button>
                    </div>
                </GlassPanel>
            )}

            {/* Address List */}
            {loading ? (
                <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</p>
            ) : addresses.length === 0 && !showForm ? (
                <GlassPanel className={styles.emptyState}>
                    <MapPin size={48} />
                    <h3>No saved addresses</h3>
                    <p>Add an address for faster checkout.</p>
                </GlassPanel>
            ) : (
                <div className={styles.addressGrid}>
                    {addresses.map((addr) => (
                        <GlassPanel key={addr.id} className={styles.addressCard}>
                            <div className={styles.addressContent}>
                                <p className={styles.addressLine}>{addr.street}</p>
                                <p className={styles.addressLine}>{addr.city}, {addr.state} {addr.zip}</p>
                                <p className={styles.addressCountry}>{addr.country}</p>
                            </div>
                            <div className={styles.addressActions}>
                                <button className={styles.editBtn} onClick={() => handleEdit(addr)}>
                                    <Edit3 size={14} /> Edit
                                </button>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(addr.id)}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </GlassPanel>
                    ))}
                </div>
            )}
        </>
    );
}
