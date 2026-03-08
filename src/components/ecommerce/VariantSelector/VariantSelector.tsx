"use client";

import React from 'react';
import styles from './VariantSelector.module.css';

export interface VariantOption {
    id: string;
    name: string;
    value?: string; // e.g. hex code for colors
    inStock: boolean;
}

export interface VariantType {
    id: string;
    name: string; // "Color", "Size", "Storage"
    options: VariantOption[];
}

interface VariantSelectorProps {
    variantTypes: VariantType[];
    selectedVariants: Record<string, string>; // { typeId: optionId }
    onVariantSelect: (typeId: string, optionId: string) => void;
}

export const VariantSelector = ({ variantTypes, selectedVariants, onVariantSelect }: VariantSelectorProps) => {

    if (!variantTypes || variantTypes.length === 0) return null;

    return (
        <div className={styles.container}>
            {variantTypes.map((type) => {
                const selectedOption = type.options.find(opt => opt.id === selectedVariants[type.id]);
                const isColor = type.name.toLowerCase() === 'color';

                return (
                    <div key={type.id} className={styles.variantGroup}>
                        <div className={styles.groupHeader}>
                            <span className={styles.groupName}>{type.name}</span>
                            {selectedOption && (
                                <span className={styles.selectedValue}>{selectedOption.name}</span>
                            )}
                        </div>
                        <div className={styles.optionsList}>
                            {type.options.map((option) => {
                                const isActive = selectedVariants[type.id] === option.id;

                                if (isColor && option.value) {
                                    return (
                                        <button
                                            key={option.id}
                                            className={`${styles.colorOption} ${isActive ? styles.active : ''} ${!option.inStock ? styles.disabled : ''}`}
                                            onClick={() => option.inStock && onVariantSelect(type.id, option.id)}
                                            aria-label={`Select color ${option.name}`}
                                            disabled={!option.inStock}
                                        >
                                            <span
                                                className={styles.colorOptionInner}
                                                style={{ backgroundColor: option.value }}
                                            />
                                        </button>
                                    );
                                }

                                return (
                                    <button
                                        key={option.id}
                                        className={`${styles.optionBtn} ${isActive ? styles.active : ''} ${!option.inStock ? styles.disabled : ''}`}
                                        onClick={() => option.inStock && onVariantSelect(type.id, option.id)}
                                        disabled={!option.inStock}
                                    >
                                        {option.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
