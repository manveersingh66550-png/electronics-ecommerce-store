"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { LiquidGlass } from '@/components/home/LiquidGlass/LiquidGlass';
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

interface VariantForm {
    id?: string;
    sku: string;
    price: string;
    stock: string;
    color_name: string;
    color_value: string;
    attribute_name: string;
    attribute_value: string;
    attribute2_name: string;
    attribute2_value: string;
}

const EMPTY_FORM = {
    name: '',
    price: '',
    stock: '',
    description: '',
    category_id: '',
    imageFile: null as File | null,
    existingImage: '',
    hasVariants: false,
    variants: [] as VariantForm[]
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
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

            let productId = editingId;
            if (editingId) {
                const { error } = await supabase.from('products').update(payload).eq('id', editingId);
                if (error) throw error;
            } else {
                const { data: newProd, error } = await supabase.from('products').insert(payload).select().single();
                if (error) throw error;
                productId = newProd.id;
            }

            // Save variants if enabled
            if (form.hasVariants && form.variants.length > 0) {
                const variantPayloads = form.variants.map(v => ({
                    ...(v.id ? { id: v.id } : {}),
                    product_id: productId,
                    name: `${form.name} - ${v.color_name || ''} ${v.attribute_value || ''} ${v.attribute2_value || ''}`.trim(),
                    sku: v.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    price: parseFloat(v.price) || payload.price,
                    stock: parseInt(v.stock) || 0,
                    color_name: v.color_name || null,
                    color_value: v.color_value || null,
                    attribute_name: v.attribute_name || null,
                    attribute_value: v.attribute_value || null,
                    attribute2_name: v.attribute2_name || null,
                    attribute2_value: v.attribute2_value || null,
                }));

                const { error: variantError } = await supabase
                    .from('product_variants')
                    .upsert(variantPayloads, { onConflict: 'id' });
                
                if (variantError) throw variantError;
            } else if (!form.hasVariants && productId) {
                // If variants disabled, delete existing ones just in case
                await supabase.from('product_variants').delete().eq('product_id', productId);
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

    const handleEdit = async (p: Product) => {
        // Fetch variants if they exist
        const { data: variantsData } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', p.id);

        const hasVariants = variantsData && variantsData.length > 0;
        
        setForm({
            name: p.name,
            price: String(p.price),
            stock: String(p.stock),
            description: p.description || '',
            category_id: p.category_id || '',
            imageFile: null,
            existingImage: p.images?.[0] || '',
            hasVariants: hasVariants || false,
            variants: hasVariants ? (variantsData as any[]).map((v: any) => ({
                id: v.id,
                sku: v.sku || '',
                price: String(v.price),
                stock: String(v.stock),
                color_name: v.color_name || '',
                color_value: v.color_value || '',
                attribute_name: v.attribute_name || '',
                attribute_value: v.attribute_value || '',
                attribute2_name: v.attribute2_name || '',
                attribute2_value: v.attribute2_value || ''
            })) : []
        });
        setEditingId(p.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        setDeleteConfirmId(null);
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
                            
                            {/* Variants Toggle */}
                            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                                    <input 
                                        type="checkbox" 
                                        checked={form.hasVariants} 
                                        onChange={(e) => setForm(f => ({ ...f, hasVariants: e.target.checked, variants: e.target.checked && f.variants.length === 0 ? [{ sku: '', price: f.price, stock: f.stock, color_name: '', color_value: '', attribute_name: '', attribute_value: '', attribute2_name: '', attribute2_value: '' }] : f.variants }))} 
                                    />
                                    Product has variations (Colors, Storage, RAM)
                                </label>
                                
                                {form.hasVariants && (
                                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {form.variants.map((v, i) => (
                                            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)' }}>
                                                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Variant {i + 1} {v.id && '(Saved)'}</span>
                                                    <button onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))} style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: '0.85rem' }}>Remove</button>
                                                </div>
                                                <Input placeholder="SKU" value={v.sku} onChange={(e) => { const nv = [...form.variants]; nv[i].sku = e.target.value; setForm(f => ({ ...f, variants: nv })); }} />
                                                <Input placeholder="Price Override" type="number" value={v.price} onChange={(e) => { const nv = [...form.variants]; nv[i].price = e.target.value; setForm(f => ({ ...f, variants: nv })); }} />
                                                <Input placeholder="Stock" type="number" value={v.stock} onChange={(e) => { const nv = [...form.variants]; nv[i].stock = e.target.value; setForm(f => ({ ...f, variants: nv })); }} />
                                                <Input placeholder="Attr 1 Name (e.g. RAM)" value={v.attribute_name} onChange={(e) => { const nv = [...form.variants]; nv[i].attribute_name = e.target.value; setForm(f => ({ ...f, variants: nv })); }} />
                                                <Input placeholder="Attr 1 Value (e.g. 16GB)" value={v.attribute_value} onChange={(e) => { const nv = [...form.variants]; nv[i].attribute_value = e.target.value; setForm(f => ({ ...f, variants: nv })); }} />
                                                <Input placeholder="Attr 2 Name (e.g. Storage)" value={v.attribute2_name} onChange={(e) => { const nv = [...form.variants]; nv[i].attribute2_name = e.target.value; setForm(f => ({ ...f, variants: nv })); }} />
                                                <Input placeholder="Attr 2 Value (e.g. 1TB)" value={v.attribute2_value} onChange={(e) => { const nv = [...form.variants]; nv[i].attribute2_value = e.target.value; setForm(f => ({ ...f, variants: nv })); }} />
                                                <Input placeholder="Color Name (e.g. Space Gray)" value={v.color_name} onChange={(e) => { const nv = [...form.variants]; nv[i].color_name = e.target.value; setForm(f => ({ ...f, variants: nv })); }} />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Input placeholder="Hex Code (e.g. #000000)" value={v.color_value} onChange={(e) => { const nv = [...form.variants]; nv[i].color_value = e.target.value; setForm(f => ({ ...f, variants: nv })); }} />
                                                    {v.color_value && <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: v.color_value, border: '1px solid rgba(0,0,0,0.1)' }} />}
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="secondary" onClick={() => setForm(f => ({ ...f, variants: [...f.variants, { sku: '', price: f.price, stock: '0', color_name: '', color_value: '', attribute_name: '', attribute_value: '', attribute2_name: '', attribute2_value: '' }] }))} style={{ alignSelf: 'flex-start' }}>
                                            <Plus size={16} /> Add Variant Option
                                        </Button>
                                    </div>
                                )}
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

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(12px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                        <LiquidGlass config={{ radius: 32, frost: 0.15, blur: 25, lightness: 98, alpha: 0.95, border: 0.05 }}>
                            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 59, 48, 0.08)',
                                    color: '#ff3b30', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.5rem auto'
                                }}>
                                    <Trash2 size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Are you sure?</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                                    This action cannot be undone. This product will be permanently removed from your catalog.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <Button variant="secondary" onClick={() => setDeleteConfirmId(null)} style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        style={{ background: '#ff3b30', borderColor: '#ff3b30', color: 'white' }}
                                        onClick={() => handleDelete(deleteConfirmId)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </LiquidGlass>
                    </div>
                </div>
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
                                            <Button variant="icon" size="sm" className={styles.iconBtnDelete} onClick={() => setDeleteConfirmId(product.id)}>
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
