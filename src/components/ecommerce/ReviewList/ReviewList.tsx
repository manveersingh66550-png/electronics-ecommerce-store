"use client";

import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import styles from './ReviewList.module.css';

export interface Review {
    id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface ReviewListProps {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    onWriteReview?: () => void;
}

export const ReviewList = ({ reviews, averageRating, totalReviews, onWriteReview }: ReviewListProps) => {

    const renderStars = (rating: number) => {
        return (
            <div className={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={`${styles.star} ${star <= rating ? styles.starFilled : ''}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.summary}>
                    <div className={styles.averageCard}>
                        <div className={styles.averageScore}>{averageRating.toFixed(1)}</div>
                        <div className={styles.totalReviews}>{totalReviews} Reviews</div>
                    </div>
                    <div>
                        {renderStars(Math.round(averageRating))}
                        <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Based on {totalReviews} reviews
                        </p>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onWriteReview}>Write a Review</Button>
                </div>
            </div>

            {reviews.length > 0 ? (
                <div className={styles.list}>
                    {reviews.map((review) => (
                        <div key={review.id} className={styles.reviewItem}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.reviewerInfo}>
                                    <div className={styles.avatar}>
                                        {review.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.reviewerDetails}>
                                        <span className={styles.reviewerName}>{review.user_name}</span>
                                        <span className={styles.reviewDate}>
                                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    {renderStars(review.rating)}
                                </div>
                            </div>
                            <div className={styles.reviewContent}>
                                <p>{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p>No reviews yet. Be the first to review this product!</p>
                </div>
            )}
        </div>
    );
};
