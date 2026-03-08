"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import styles from './products.module.css';

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    description: string;
    category_id: string | null;
    images: string[];
    categories?: { name: string } | null;
}

const EMPTY_FORM = {
    name: '',
    price: '',
    stock: '',
    description: '',
    category_id: '',
    imageFile: null as File | null,
    existingImage: ''
};

export default function AdminProducts() {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const fetchProducts = async () => {
        let query = supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });

        if (search) query = query.ilike('name', `%${search}%`);
        if (categoryFilter) query = query.eq('category_id', categoryFilter);

        const { data } = await query;
        setProducts(data || []);
        setLoading(false);
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').order('name');
        setCategories(data || []);
    };

    useEffect(() => { fetchCategories(); }, []);
    useEffect(() => { fetchProducts(); }, [search, categoryFilter]);

    const handleSave = async () => {
        setSaving(true);
        try {
            let imageUrl = form.existingImage;

            // Upload new image if provided
            if (form.imageFile) {
                const fileExt = form.imageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, form.imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error("Storage upload error:", uploadError);
                    alert("Failed to upload image: " + uploadError.message);
                    setSaving(false);
                    return;
                }

                const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
                imageUrl = data.publicUrl;
            }

            const payload = {
                name: form.name,
                price: parseFloat(form.price),
                stock: parseInt(form.stock),
                description: form.description,
                category_id: form.category_id || null,
                images: imageUrl ? [imageUrl] : [],
            };

            if (editingId) {
                const { error } = await supabase.from('products').update(payload).eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('products').insert(payload);
                if (error) throw error;
            }

            setShowForm(false);
            setEditingId(null);
            setForm(EMPTY_FORM);
            fetchProducts();
        } catch (error: any) {
            console.error("Database error:", error);
            alert("Error saving product: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (p: Product) => {
        setForm({
            name: p.name,
            price: String(p.price),
            stock: String(p.stock),
            description: p.description || '',
            category_id: p.category_id || '',
            imageFile: null,
            existingImage: p.images?.[0] || '',
        });
        setEditingId(p.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        await supabase.from('products').delete().eq('id', id);
        fetchProducts();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Products</h1>
                    <p className={styles.subtitle}>Manage your store catalog ({products.length} products)</p>
                </div>
                <Button variant="primary" className={styles.addBtn} onClick={() => setShowForm(true)}>
                    <Plus size={20} /> Add Product
                </Button>
            </header>

            {/* Add/Edit Form */}
            {showForm && (
                <GlassPanel className={styles.tablePanel}>
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 500, fontSize: '1.1rem' }}>{editingId ? 'Edit Product' : 'New Product'}</h3>
                            <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Input placeholder="Product Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                            </div>
                            <Input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
                            <Input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))} />
                            <select
                                value={form.category_id}
                                onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))}
                                className={styles.filterSelect}
                            >
                                <option value="">No Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>

                            {/* Native file picker for image upload */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Product Image (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setForm(f => ({ ...f, imageFile: e.target.files![0] }));
                                        }
                                    }}
                                    style={{ fontSize: '0.9rem' }}
                                />
                                {form.existingImage && !form.imageFile && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--status-active)' }}>Has existing image</span>
                                )}
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <Input placeholder="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                            <Button variant="primary" onClick={handleSave} disabled={!form.name || !form.price || saving}>
                                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : (editingId ? 'Save Changes' : 'Add Product')}
                            </Button>
                        </div>
                    </div>
                </GlassPanel>
            )}

            <GlassPanel className={styles.tablePanel}>
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className={styles.searchInput}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={styles.filters}>
                        <select
                            className={styles.filterSelect}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No products found.</td></tr>
                            ) : products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div className={styles.productCell}>
                                            <div className={styles.productImgWrapper}>
                                                {product.images?.[0] ? (
                                                    <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'contain' }} />
                                                ) : (
                                                    <div className={styles.placeholderImg}></div>
                                                )}
                                            </div>
                                            <span className={styles.productName}>{product.name}</span>
                                        </div>
                                    </td>
                                    <td>{product.categories?.name || '—'}</td>
                                    <td>₹{Number(product.price).toFixed(2)}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${product.stock > 0 ? styles.statusActive : styles.statusOut}`}>
                                            {product.stock > 0 ? 'Active' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionCell}>
                                            <Button variant="icon" size="sm" className={styles.iconBtn} onClick={() => handleEdit(product)}>
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button variant="icon" size="sm" className={styles.iconBtnDelete} onClick={() => handleDelete(product.id)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
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
