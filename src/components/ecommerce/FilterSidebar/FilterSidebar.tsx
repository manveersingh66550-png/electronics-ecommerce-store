import React, { useState } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { Check } from 'lucide-react';
import styles from './FilterSidebar.module.css';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface FilterSidebarProps {
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

export const FilterSidebar = ({
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
}: FilterSidebarProps) => {
    const [localMin, setLocalMin] = useState(minPrice.toString());
    const [localMax, setLocalMax] = useState(maxPrice.toString());

    const handlePriceApply = () => {
        const min = parseInt(localMin) || 0;
        const max = parseInt(localMax) || Infinity;
        onPriceChange(min, max);
    };

    return (
        <GlassPanel className={styles.sidebar}>
            {/* Categories */}
            <div className={styles.section}>
                <h3 className={styles.title}>Categories</h3>
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
                <h3 className={styles.title}>Price Range</h3>
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
                <Button
                    variant="secondary"
                    size="sm"
                    className={styles.applyBtn}
                    onClick={handlePriceApply}
                >
                    Apply Filter
                </Button>
            </div>

            {/* Availability */}
            <div className={styles.section}>
                <h3 className={styles.title}>Availability</h3>
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
        </GlassPanel>
    );
};
