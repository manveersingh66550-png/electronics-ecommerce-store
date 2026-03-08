"use client";

import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Award } from 'lucide-react';
import { AnimatedSection } from '@/components/home/AnimatedSection/AnimatedSection';
import styles from './WhyChooseUs.module.css';

const TRUST_ITEMS = [
    {
        icon: Truck,
        title: 'Free Shipping',
        description: 'Complimentary delivery on all orders over Rs.4999',
    },
    {
        icon: ShieldCheck,
        title: '24/7 Support',
        description: 'Round-the-clock expert assistance whenever you need it',
    },
    {
        icon: RotateCcw,
        title: 'Easy Returns',
        description: 'Hassle-free 30-day return & exchange policy',
    },
    {
        icon: Award,
        title: 'Premium Quality',
        description: 'Only certified, genuine products from top brands',
    },
];

export const WhyChooseUs = () => {
    return (
        <section className={styles.section}>
            <AnimatedSection direction="up" delay={0.1}>
                <h3 className={styles.sectionLabel}>WHY CHOOSE US</h3>
                <div className={styles.grid}>
                    {TRUST_ITEMS.map((item, idx) => (
                        <AnimatedSection key={item.title} direction="up" delay={0.15 + idx * 0.1}>
                            <div className={styles.card}>
                                <div className={styles.iconWrap}>
                                    <item.icon size={28} strokeWidth={1.5} className={styles.icon} />
                                </div>
                                <h4 className={styles.cardTitle}>{item.title}</h4>
                                <p className={styles.cardDesc}>{item.description}</p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </AnimatedSection>
        </section>
    );
};
