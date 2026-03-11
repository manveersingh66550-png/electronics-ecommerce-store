"use client";

import React, { useState } from 'react';
import { Share2, ShieldCheck, Truck } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { ProductGallery } from '@/components/ecommerce/ProductGallery/ProductGallery';
import { VariantSelector, VariantType, VariantOption } from '@/components/ecommerce/VariantSelector/VariantSelector';
import { ReviewList, Review } from '@/components/ecommerce/ReviewList/ReviewList';
import { WishlistToggleButton } from '@/components/ecommerce/WishlistToggleButton/WishlistToggleButton';
import { RecentlyViewed } from '@/components/ecommerce/RecentlyViewed/RecentlyViewed';
import { RecommendationsCarousel } from '@/components/ecommerce/RecommendationsCarousel/RecommendationsCarousel';
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import styles from './page.module.css';

interface ProductData {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryName: string;
    stock: number;
}

export interface VariantRow {
    id: string;
    product_id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    color_name?: string;
    color_value?: string;
    attribute_name?: string;
    attribute_value?: string;
    attribute2_name?: string;
    attribute2_value?: string;
    image_url?: string;
}

interface ProductDetailClientProps {
    product: ProductData;
    media: any[];
    variants: VariantRow[];
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
}

export function ProductDetailClient({
    product,
    media,
    variants,
    reviews,
    averageRating,
    totalReviews
}: ProductDetailClientProps) {
    const { addItem } = useCartStore();
    const { openCart } = useUIStore();
    const { addProduct } = useRecentlyViewedStore();
    const [quantity, setQuantity] = useState(1);

    // Track recently viewed
    React.useEffect(() => {
        if (product.id) {
            addProduct(product.id);
        }
    }, [product.id, addProduct]);

    // Group variants into Types (Color, Storage, etc)
    const availableTypes = React.useMemo(() => {
        const types: VariantType[] = [];
        
        // Check for colors
        const colors = new Map<string, VariantOption>();
        variants.forEach(v => {
            if (v.color_name) {
                if (!colors.has(v.color_name)) {
                    colors.set(v.color_name, {
                        id: v.color_name,
                        name: v.color_name,
                        value: v.color_value || undefined,
                        inStock: false // Computed later
                    });
                }
            }
        });
        if (colors.size > 0) {
            types.push({ id: 'Color', name: 'Color', options: Array.from(colors.values()) });
        }

        // Group any other dynamic attributes by their name (e.g. Storage, RAM, Size)
        const dynamicAttributes = new Map<string, Map<string, VariantOption>>();
        
        variants.forEach(v => {
            const addAttribute = (name?: string, value?: string) => {
                if (name && value) {
                    if (!dynamicAttributes.has(name)) {
                        dynamicAttributes.set(name, new Map());
                    }
                    const optMap = dynamicAttributes.get(name)!;
                    if (!optMap.has(value)) {
                        optMap.set(value, {
                            id: value,
                            name: value,
                            inStock: false
                        });
                    }
                }
            };
            
            addAttribute(v.attribute_name, v.attribute_value);
            addAttribute(v.attribute2_name, v.attribute2_value);
        });

        dynamicAttributes.forEach((optionsMap, attrName) => {
             types.push({ id: attrName, name: attrName, options: Array.from(optionsMap.values()) });
        });

        return types;
    }, [variants]);

    // Initialize variant selection with first available option of each type
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        
        if (availableTypes.length > 0) {
            // Find the first variant with stock > 0
            const firstInStock = variants.find(v => v.stock > 0) || variants[0];
            if (firstInStock) {
                if (firstInStock.color_name) initial['Color'] = firstInStock.color_name;
                if (firstInStock.attribute_name && firstInStock.attribute_value) {
                    initial[firstInStock.attribute_name] = firstInStock.attribute_value;
                }
                if (firstInStock.attribute2_name && firstInStock.attribute2_value) {
                    initial[firstInStock.attribute2_name] = firstInStock.attribute2_value;
                }
            }
        }
        return initial;
    });

    // Compute dynamic inStock statuses based on CURRENT selection
    const computedVariantTypes = React.useMemo(() => {
        return availableTypes.map(type => {
            return {
                ...type,
                options: type.options.map(opt => {
                    // To check if this option is in stock, simulate selecting it along with OTHER current selections
                    const simulatedSelection = { ...selectedVariants, [type.id]: opt.id };
                    
                    // Find a matching variant row
                    const matchingVariant = variants.find(v => {
                        let match = true;
                        if (simulatedSelection['Color'] && v.color_name !== simulatedSelection['Color']) match = false;
                        if (v.attribute_name && simulatedSelection[v.attribute_name] && v.attribute_value !== simulatedSelection[v.attribute_name]) match = false;
                        if (v.attribute2_name && simulatedSelection[v.attribute2_name] && v.attribute2_value !== simulatedSelection[v.attribute2_name]) match = false;
                        return match;
                    });

                    return {
                        ...opt,
                        inStock: matchingVariant ? matchingVariant.stock > 0 : false
                    };
                })
            };
        });
    }, [availableTypes, selectedVariants, variants]);

    // Find the exact selected Variant Row to update price and stock display
    const currentVariant = React.useMemo(() => {
        if (variants.length === 0) return null;
        return variants.find(v => {
            let match = true;
            if (selectedVariants['Color'] && v.color_name !== selectedVariants['Color']) match = false;
            if (v.attribute_name && selectedVariants[v.attribute_name] && v.attribute_value !== selectedVariants[v.attribute_name]) match = false;
            if (v.attribute2_name && selectedVariants[v.attribute2_name] && v.attribute2_value !== selectedVariants[v.attribute2_name]) match = false;
            return match;
        }) || null;
    }, [variants, selectedVariants]);

    const displayPrice = currentVariant ? currentVariant.price : product.price;
    const displayStock = currentVariant ? currentVariant.stock : product.stock;

    const handleVariantSelect = (typeId: string, optionId: string) => {
        setSelectedVariants(prev => ({ ...prev, [typeId]: optionId }));
    };

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'inc' && quantity < displayStock) setQuantity(q => q + 1);
        if (type === 'dec' && quantity > 1) setQuantity(q => q - 1);
    };

    const handleAddToCart = () => {
        // Stringify variants for simplicity if multiple exist
        const variantDesc = computedVariantTypes.length > 0
            ? Object.entries(selectedVariants).map(([type, opt]) => `${opt}`).join(', ')
            : undefined;

        const detailedName = variantDesc ? `${product.name} - ${variantDesc}` : product.name;

        addItem({
            product_id: product.id,
            variant_id: currentVariant?.id, // Use actual variant ID if available
            name: detailedName,
            price: displayPrice,
            quantity: Math.min(quantity, displayStock),
            image_url: currentVariant?.image_url || media[0]?.url || '',
            stock: displayStock,
        });
        openCart();
    };

    return (
        <div className={styles.productContainer}>
            <div className={styles.topSection}>

                {/* Left: Gallery */}
                <div className={styles.galleryArea}>
                    <ProductGallery media={media} />
                </div>

                {/* Right: Info */}
                <div className={styles.detailsArea}>
                    <div className={styles.header}>
                        <span className={styles.category}>{product.categoryName}</span>
                        <h1 className={styles.title}>{product.name}</h1>
                        <div className={styles.rating}>
                            <svg className={styles.star} width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            <span>{totalReviews > 0 ? `${averageRating.toFixed(1)} (${totalReviews} reviews)` : "No reviews yet"}</span>
                        </div>
                    </div>

                    <div className={styles.priceBlock}>
                        <span className={styles.price}>₹{displayPrice.toFixed(2)}</span>
                    </div>

                    <p className={styles.description}>{product.description}</p>

                    {computedVariantTypes.length > 0 && (
                        <VariantSelector
                            variantTypes={computedVariantTypes}
                            selectedVariants={selectedVariants}
                            onVariantSelect={handleVariantSelect}
                        />
                    )}

                    <div className={styles.actions}>
                        <div className={styles.mainActionBox}>
                            <div className={styles.quantityControl}>
                                <button onClick={() => handleQuantityChange('dec')} disabled={quantity <= 1}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => handleQuantityChange('inc')} disabled={quantity >= displayStock}>+</button>
                            </div>
                            <Button variant="primary" className={styles.addToCartBtn} onClick={handleAddToCart} disabled={displayStock <= 0}>
                                {displayStock > 0 ? `Add to Cart - ₹${(displayPrice * quantity).toFixed(2)}` : 'Out of Stock'}
                            </Button>
                            <WishlistToggleButton productId={product.id} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {displayStock > 0 ? `${displayStock} items in stock` : 'Out of stock'}
                        </p>
                    </div>

                    <ul className={styles.featuresList}>
                        <li className={styles.featureItem}>
                            <Truck size={20} className={styles.featureIcon} />
                            <span>Secure Delivery & Easy Returns</span>
                        </li>
                        <li className={styles.featureItem}>
                            <ShieldCheck size={20} className={styles.featureIcon} />
                            <span>1 Year Premium Warranty Included</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom: Reviews */}
            <div className={styles.reviewsSection}>
                <h2 className={styles.sectionTitle}>Customer Reviews</h2>
                <ReviewList
                    reviews={reviews}
                    averageRating={averageRating}
                    totalReviews={totalReviews}
                />
            </div>

            {/* Recommendations */}
            <RecommendationsCarousel
                productId={product.id}
                categoryName={product.categoryName}
            />

            {/* Recently Viewed */}
            <RecentlyViewed excludeId={product.id} />
        </div>
    );
}
