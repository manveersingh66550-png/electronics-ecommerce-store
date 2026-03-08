"use client";

import React, { useState } from 'react';
import { Share2, ShieldCheck, Truck } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { ProductGallery } from '@/components/ecommerce/ProductGallery/ProductGallery';
import { VariantSelector, VariantType } from '@/components/ecommerce/VariantSelector/VariantSelector';
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

interface ProductDetailClientProps {
    product: ProductData;
    media: any[];
    variantTypes: VariantType[];
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
}

export function ProductDetailClient({
    product,
    media,
    variantTypes,
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

    // Initialize variant selection with first available option of each type
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        variantTypes.forEach(type => {
            const inStockOption = type.options.find(opt => opt.inStock);
            if (inStockOption) initial[type.id] = inStockOption.id;
        });
        return initial;
    });

    const handleVariantSelect = (typeId: string, optionId: string) => {
        setSelectedVariants(prev => ({ ...prev, [typeId]: optionId }));
    };

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'inc' && quantity < product.stock) setQuantity(q => q + 1);
        if (type === 'dec' && quantity > 1) setQuantity(q => q - 1);
    };

    const handleAddToCart = () => {
        // Stringify variants for simplicity if multiple exist
        const variantDesc = variantTypes.length > 0
            ? Object.entries(selectedVariants).map(([type, opt]) => `${type}: ${opt}`).join(', ')
            : undefined;

        addItem({
            product_id: product.id,
            variant_id: variantDesc,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image_url: media[0]?.url || '',
            stock: product.stock,
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
                        <span className={styles.price}>₹{product.price.toFixed(2)}</span>
                    </div>

                    <p className={styles.description}>{product.description}</p>

                    {variantTypes.length > 0 && (
                        <VariantSelector
                            variantTypes={variantTypes}
                            selectedVariants={selectedVariants}
                            onVariantSelect={handleVariantSelect}
                        />
                    )}

                    <div className={styles.actions}>
                        <div className={styles.mainActionBox}>
                            <div className={styles.quantityControl}>
                                <button onClick={() => handleQuantityChange('dec')} disabled={quantity <= 1}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => handleQuantityChange('inc')} disabled={quantity >= product.stock}>+</button>
                            </div>
                            <Button variant="primary" className={styles.addToCartBtn} onClick={handleAddToCart}>
                                Add to Cart - ${(product.price * quantity).toFixed(2)}
                            </Button>
                            <WishlistToggleButton productId={product.id} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
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
