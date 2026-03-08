"use client";

import React, { useState, useEffect } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { Check, X } from 'lucide-react';
import styles from './FilterBottomDrawer.module.css';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface FilterBottomDrawerProps {
    isOpen: boolean;
    onClose: () => void;

    categories: Category[];
    activeCategory: string | null;
    onCategoryChange: (categoryId: string | null) => void;

    minPrice: number;
    maxPrice: number;
    onPriceChange: (min: number, max: number) => void;

    inStockOnly: boolean;
    onStockToggle: (checked: boolean) => void;

    onSaleOnly: boolean;
    onSaleToggle: (checked: boolean) => void;
}

export const FilterBottomDrawer = ({
    isOpen,
    onClose,
    categories,
    activeCategory,
    onCategoryChange,
    minPrice,
    maxPrice,
    onPriceChange,
    inStockOnly,
    onStockToggle,
    onSaleOnly,
    onSaleToggle
}: FilterBottomDrawerProps) => {
    const [localMin, setLocalMin] = useState(minPrice.toString());
    const [localMax, setLocalMax] = useState(maxPrice.toString());

    // Sync local state when props change
    useEffect(() => {
        setLocalMin(minPrice.toString());
        setLocalMax(maxPrice.toString());
    }, [minPrice, maxPrice, isOpen]);

    if (!isOpen) return null;

    const handleApplyAll = () => {
        const min = parseInt(localMin) || 0;
        const max = parseInt(localMax) || Infinity;
        onPriceChange(min, max);
        onClose();
    };

    const handleClearAll = () => {
        onCategoryChange(null);
        onPriceChange(0, 999999);
        onStockToggle(false);
        onSaleToggle(false);
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <GlassPanel className={styles.drawer}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Filters</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close filters">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    {/* Categories */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Categories</h3>
                        <div className={styles.list}>
                            <button
                                className={`${styles.categoryItem} ${!activeCategory ? styles.active : ''}`}
                                onClick={() => onCategoryChange(null)}
                            >
                                All Products
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={`${styles.categoryItem} ${activeCategory === category.id ? styles.active : ''}`}
                                    onClick={() => onCategoryChange(category.id)}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Price Range</h3>
                        <div className={styles.priceInputs}>
                            <div className={styles.priceInputWrapper}>
                                <span className={styles.currencySymbol}>₹</span>
                                <input
                                    type="number"
                                    className={styles.priceInput}
                                    placeholder="Min"
                                    value={localMin}
                                    onChange={(e) => setLocalMin(e.target.value)}
                                />
                            </div>
                            <span className={styles.priceSeparator}>-</span>
                            <div className={styles.priceInputWrapper}>
                                <span className={styles.currencySymbol}>₹</span>
                                <input
                                    type="number"
                                    className={styles.priceInput}
                                    placeholder="Max"
                                    value={localMax}
                                    onChange={(e) => setLocalMax(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Availability */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Availability</h3>
                        <div className={styles.list}>
                            <label className={styles.checkboxItem}>
                                <input
                                    type="checkbox"
                                    className={styles.checkboxInput}
                                    checked={inStockOnly}
                                    onChange={(e) => onStockToggle(e.target.checked)}
                                />
                                <div className={styles.checkboxCustom}>
                                    <Check strokeWidth={3} className={styles.checkIcon} />
                                </div>
                                <span className={styles.checkboxLabel}>In Stock Only</span>
                            </label>
                            <label className={styles.checkboxItem}>
                                <input
                                    type="checkbox"
                                    className={styles.checkboxInput}
                                    checked={onSaleOnly}
                                    onChange={(e) => onSaleToggle(e.target.checked)}
                                />
                                <div className={styles.checkboxCustom}>
                                    <Check strokeWidth={3} className={styles.checkIcon} />
                                </div>
                                <span className={styles.checkboxLabel}>On Sale</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button variant="secondary" onClick={handleClearAll}>
                        Clear
                    </Button>
                    <Button variant="primary" onClick={handleApplyAll}>
                        Apply Filters
                    </Button>
                </div>
            </GlassPanel>
        </div>
    );
};
