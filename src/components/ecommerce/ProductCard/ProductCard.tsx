import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import styles from './ProductCard.module.css';

interface Product {
    id: string;
    name: string;
    price: number;
    categoryName?: string;
    imageUrl: string;
    rating: number;
}

interface ProductCardProps {
    product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <GlassPanel className={styles.card}>
            <div className={styles.imageContainer}>
                <div className={styles.imageWrapper}>
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'contain' }}
                            className={styles.image}
                        />
                    ) : (
                        <div className={styles.placeholderImg}></div>
                    )}
                </div>

                <Button
                    variant="icon"
                    size="sm"
                    className={styles.wishlistBtn}
                    aria-label="Add to wishlist"
                >
                    <Heart size={18} />
                </Button>
            </div>

            <div className={styles.content}>
                <div className={styles.meta}>
                    <span className={styles.category}>{product.categoryName || 'General'}</span>
                    <span className={styles.rating}>⭐ {product.rating.toFixed(1)}</span>
                </div>

                <Link href={`/product/${product.id}`} className={styles.titleLink}>
                    <h3 className={styles.title}>{product.name}</h3>
                </Link>

                <div className={styles.footer}>
                    <span className={styles.price}>₹{product.price.toFixed(2)}</span>
                    <Button variant="primary" size="sm">Add to Cart</Button>
                </div>
            </div>
        </GlassPanel>
    );
};
