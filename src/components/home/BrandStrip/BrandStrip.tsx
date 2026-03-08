"use client";

import React from 'react';
import { AnimatedSection } from '@/components/home/AnimatedSection/AnimatedSection';
import { LiquidGlass } from '@/components/home/LiquidGlass/LiquidGlass';
import styles from './BrandStrip.module.css';

const BRANDS = [
    { name: 'Apple', display: '', fontFamily: "'SF Pro Display', -apple-system, sans-serif", className: 'apple' },
    { name: 'Samsung', display: 'SAMSUNG', fontFamily: "'Helvetica Neue', sans-serif", className: 'samsung' },
    { name: 'Sony', display: 'SONY', fontFamily: "'Helvetica Neue', sans-serif", className: 'sony' },
    { name: 'Logitech', display: 'Logitech', fontFamily: "'Helvetica Neue', sans-serif", className: 'logitech' },
    { name: 'HP', display: 'hp', fontFamily: "'Helvetica Neue', sans-serif", className: 'hp' },
    { name: 'ASUS', display: 'ASUS', fontFamily: "'Helvetica Neue', sans-serif", className: 'asus' },
    { name: 'Dell', display: 'DELL', fontFamily: "'Helvetica Neue', sans-serif", className: 'dell' },
    { name: 'Intel', display: 'intel', fontFamily: "'Helvetica Neue', sans-serif", className: 'intel' },
    { name: 'Lenovo', display: 'Lenovo', fontFamily: "'Helvetica Neue', sans-serif", className: 'lenovo' },
    { name: 'Microsoft', display: 'Microsoft', fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", className: 'microsoft' },
];

export const BrandStrip = () => {
    return (
        <section className={styles.brandStripSection}>
            <AnimatedSection direction="up" delay={0.1}>
                <div className={styles.stripContainer}>

                    <h3 className={styles.stripTitle}>Trusted by industry leaders</h3>

                    <LiquidGlass className={styles.glassWrapper} config={{ radius: 32, frost: 0.1, blur: 15 }}>
                        <div className={styles.logoTrack}>
                            {/* Duplicate the array twice to create a seamless infinite scroll loop */}
                            {[...BRANDS, ...BRANDS].map((brand, idx) => (
                                <div key={idx} className={`${styles.logoItem} ${styles[brand.className]}`} title={brand.name}>
                                    <span className={styles.brandText} style={{ fontFamily: brand.fontFamily }}>
                                        {brand.display}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </LiquidGlass>
                </div>
            </AnimatedSection>
        </section>
    );
};
