"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import styles from './WishlistToggleButton.module.css';

interface WishlistToggleButtonProps {
    productId: string;
    size?: number;
    className?: string;
}

export const WishlistToggleButton = ({ productId, size = 20, className = '' }: WishlistToggleButtonProps) => {
    const { toggleItem, isInWishlist } = useWishlistStore();
    const [mounted, setMounted] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className={`${styles.wishlistBtn} ${className}`} aria-label="Add to Wishlist">
                <Heart size={size} />
            </button>
        );
    }

    const isWished = isInWishlist(productId);

    const handleToggle = () => {
        setAnimating(true);
        toggleItem(productId);
        setTimeout(() => setAnimating(false), 400);
    };

    return (
        <button
            className={`${styles.wishlistBtn} ${isWished ? styles.active : ''} ${animating ? styles.animating : ''} ${className}`}
            onClick={handleToggle}
            aria-label={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
            <Heart
                size={size}
                fill={isWished ? '#ef4444' : 'none'}
                stroke={isWished ? '#ef4444' : 'currentColor'}
            />
        </button>
    );
};
