"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { Star, RefreshCw, CheckCircle2, EyeOff, Clock } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import styles from './reviews.module.css';

interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string;
    status: 'approved' | 'pending' | 'hidden';
    created_at: string;
    profiles?: { full_name: string };
    products?: { name: string };
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToastStore();
    const supabase = createClient();

    const fetchReviews = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data: reviewsData, error: fetchError } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            const formattedData = [...reviewsData];

            if (reviewsData.length > 0) {
                // Fetch profiles
                const userIds = [...new Set(reviewsData.map((r: any) => r.user_id).filter((id: any) => id))];
                if (userIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .in('id', userIds);

                    if (profiles) {
                        profiles.forEach((p: any) => {
                            formattedData.filter((r: any) => r.user_id === p.id).forEach((r: any) => {
                                r.profiles = { full_name: p.full_name };
                            });
                        });
                    }
                }

                // Fetch products
                const productIds = [...new Set(reviewsData.map((r: any) => r.product_id).filter((id: any) => id))];
                if (productIds.length > 0) {
                    const { data: products } = await supabase
                        .from('products')
                        .select('id, name')
                        .in('id', productIds);

                    if (products) {
                        products.forEach((p: any) => {
                            formattedData.filter((r: any) => r.product_id === p.id).forEach((r: any) => {
                                r.products = { name: p.name };
                            });
                        });
                    }
                }
            }

            setReviews(formattedData);
        } catch (err: any) {
            console.error('Error fetching reviews:', err);
            setError(err.message || 'Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const updateStatus = async (id: string, newStatus: 'approved' | 'pending' | 'hidden') => {
        const currentReview = reviews.find(r => r.id === id);
        if (!currentReview) return;
        const currentStatus = currentReview.status;

        // Optimistic update
        setReviews(prev => prev.map(rev =>
            rev.id === id ? { ...rev, status: newStatus } : rev
        ));

        try {
            const { error: updateError } = await supabase
                .from('reviews')
                .update({ status: newStatus })
                .eq('id', id);

            if (updateError) throw updateError;
            addToast(`Review marked as ${newStatus}`, 'success');
        } catch (err: any) {
            console.error('Error updating status:', err);
            // Revert optimistic update
            setReviews(prev => prev.map(rev =>
                rev.id === id ? { ...rev, status: currentStatus as any } : rev
            ));
            addToast('Failed to update review status', 'error');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    };

    const renderStars = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <Star
                key={i}
                size={16}
                fill={i < rating ? "currentColor" : "none"}
                color={i < rating ? "currentColor" : "rgba(255,255,255,0.2)"}
            />
        ));
    };

    if (isLoading && reviews.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.loader}>
                    <div className={styles.spinner}></div>
                    <p>Loading reviews...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <Button variant="secondary" onClick={fetchReviews}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Product Reviews</h1>
                    <p className={styles.subtitle}>
                        Manage user feedback and ratings.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="secondary" onClick={fetchReviews}>
                        <RefreshCw size={16} style={{ marginRight: '8px' }} />
                        Refresh
                    </Button>
                </div>
            </div>

            <GlassPanel className={styles.contentPanel}>
                {reviews.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Star size={48} opacity={0.3} />
                        <p>No product reviews yet.</p>
                    </div>
                ) : (
                    <div className={styles.reviewsGrid}>
                        {reviews.map((rev) => (
                            <div key={rev.id} className={`${styles.reviewCard} ${styles[rev.status]}`}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.reviewerInfo}>
                                        <div className={styles.reviewerName}>
                                            {rev.profiles?.full_name || 'Anonymous User'}
                                            <span className={`${styles.statusBadge} ${styles[rev.status]}`}>{rev.status}</span>
                                        </div>
                                        <div className={styles.productName}>
                                            Product: {rev.products?.name || 'Unknown Product'}
                                        </div>
                                    </div>
                                    <div className={styles.reviewMeta}>
                                        <span className={styles.date}>{formatDate(rev.created_at)}</span>
                                        <div className={styles.rating}>
                                            {renderStars(rev.rating)}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardBody}>
                                    <p className={styles.commentText}>{rev.comment}</p>

                                    <div className={styles.actions}>
                                        {rev.status !== 'approved' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => updateStatus(rev.id, 'approved')}
                                                style={{ color: 'var(--success-color, #10b981)', borderColor: 'var(--success-color, #10b981)' }}
                                            >
                                                <CheckCircle2 size={16} style={{ marginRight: '6px' }} />
                                                Approve
                                            </Button>
                                        )}
                                        {rev.status !== 'pending' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => updateStatus(rev.id, 'pending')}
                                                style={{ color: '#f59e0b', borderColor: '#f59e0b' }}
                                            >
                                                <Clock size={16} style={{ marginRight: '6px' }} />
                                                Mark Pending
                                            </Button>
                                        )}
                                        {rev.status !== 'hidden' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => updateStatus(rev.id, 'hidden')}
                                                style={{ color: 'var(--text-tertiary)', borderColor: 'var(--text-tertiary)' }}
                                            >
                                                <EyeOff size={16} style={{ marginRight: '6px' }} />
                                                Hide
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassPanel>
        </div>
    );
}
