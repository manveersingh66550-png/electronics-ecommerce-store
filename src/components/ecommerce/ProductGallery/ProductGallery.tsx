"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import styles from './ProductGallery.module.css';

interface ProductMedia {
    id: string;
    url: string;
    type: 'image' | 'video';
    alt?: string;
}

interface ProductGalleryProps {
    media: ProductMedia[];
}

export const ProductGallery = ({ media }: ProductGalleryProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!media || media.length === 0) {
        return (
            <div className={styles.galleryContainer}>
                <div className={styles.mainView}>
                    <div className={styles.placeholder}>
                        <ImageIcon size={48} opacity={0.5} />
                    </div>
                </div>
            </div>
        );
    }

    const activeMedia = media[activeIndex];

    const handleNext = () => {
        setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    };

    return (
        <div className={styles.galleryContainer}>
            <div className={styles.mainView}>
                <div className={styles.mainImageWrapper}>
                    {activeMedia.type === 'video' ? (
                        <video
                            src={activeMedia.url}
                            controls
                            autoPlay
                            muted
                            loop
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <Image
                            src={activeMedia.url}
                            alt={activeMedia.alt || 'Product Image'}
                            fill
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    )}
                </div>

                {media.length > 1 && (
                    <>
                        <button
                            className={`${styles.navBtn} ${styles.navPrev}`}
                            onClick={handlePrev}
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            className={`${styles.navBtn} ${styles.navNext}`}
                            onClick={handleNext}
                            aria-label="Next image"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>

            {media.length > 1 && (
                <div className={styles.thumbnails}>
                    {media.map((item, index) => (
                        <button
                            key={item.id}
                            className={`${styles.thumbnailBtn} ${index === activeIndex ? styles.active : ''}`}
                            onClick={() => setActiveIndex(index)}
                            aria-label={`View image ${index + 1}`}
                        >
                            <div className={styles.thumbInner}>
                                {item.type === 'video' ? (
                                    <div className={styles.placeholder}>Video</div>
                                ) : (
                                    <Image
                                        src={item.url}
                                        alt={item.alt || `Thumbnail ${index + 1}`}
                                        fill
                                        style={{ objectFit: 'contain', padding: '0.25rem' }}
                                    />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
