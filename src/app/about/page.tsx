"use client";

import React from 'react';
import Link from 'next/link';
import {
    ShieldCheck, Zap, Settings, Truck, Globe, HeadphonesIcon,
    ArrowRight, Award, Users, Package, Quote
} from 'lucide-react';
import { AnimatedSection } from '@/components/home/AnimatedSection/AnimatedSection';
import styles from './about.module.css';

const VALUES = [
    {
        icon: ShieldCheck,
        title: 'Uncompromising Quality',
        desc: 'Every product undergoes rigorous testing for durability, performance, and aesthetic design before it enters our catalog.',
    },
    {
        icon: Settings,
        title: 'Precision Engineering',
        desc: 'We source from manufacturers who treat technology as art — finest materials, masterful craftsmanship, zero compromise.',
    },
    {
        icon: Zap,
        title: 'Bleeding-Edge Tech',
        desc: 'Stay ahead with the latest in processors, display technology, and acoustic design. Always future-ready.',
    },
];



const SERVICES = [
    {
        icon: Truck,
        title: 'Free Express Shipping',
        desc: 'Complimentary fast delivery on all orders above ₹4,999. Secure eco-friendly packaging.',
    },
    {
        icon: Globe,
        title: 'Nationwide Reach',
        desc: 'Delivering premium technology across India with localized support and tracking.',
    },
    {
        icon: HeadphonesIcon,
        title: '24/7 Priority Support',
        desc: 'Our dedicated team of specialists are available around the clock to assist you.',
    },
];

export default function AboutPage() {
    return (
        <div className={styles.page}>
            {/* Hero */}
            <AnimatedSection direction="up" delay={0.1}>
                <section className={styles.hero}>
                    <span className={styles.heroBadge}>ABOUT NEXCART</span>
                    <h1 className={styles.heroTitle}>Our Vision.</h1>
                    <p className={styles.heroDesc}>
                        We believe technology should be an elegant extension of your life.
                        At NexCart, we curate premium electronic experiences for audiophiles,
                        creators, and professionals who demand uncompromising quality.
                    </p>
                </section>
            </AnimatedSection>

            {/* Values */}
            <AnimatedSection direction="up" delay={0.15}>
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionBadge}>OUR PILLARS</span>
                        <h2 className={styles.sectionTitle}>Why Choose NexCart</h2>
                        <p className={styles.sectionDesc}>The standard of excellence we bring to every interaction.</p>
                    </div>
                    <div className={styles.valuesGrid}>
                        {VALUES.map((v, i) => (
                            <AnimatedSection key={v.title} direction="up" delay={0.1 + i * 0.08}>
                                <div className={styles.valueCard}>
                                    <div className={styles.valueIcon}>
                                        <v.icon size={24} />
                                    </div>
                                    <h3 className={styles.valueTitle}>{v.title}</h3>
                                    <p className={styles.valueDesc}>{v.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </section>
            </AnimatedSection>

            {/* Story */}
            <AnimatedSection direction="up" delay={0.2}>
                <section className={styles.storySection}>
                    <div className={styles.storyCard}>
                        <div className={styles.storyQuoteIcon}>
                            <Quote size={32} />
                        </div>
                        <span className={styles.sectionBadge}>OUR STORY</span>
                        <h2 className={styles.storyTitle}>The NexCart Standard</h2>
                        <p className={styles.storyText}>
                            Founded with a singular purpose: to cut through the noise of the consumer electronics market.
                            We saw a world flooded with disposable tech and confusing specifications.
                        </p>
                        <p className={styles.storyText}>
                            NexCart was built to be the antidote — a focused, curated catalog where every item is the best
                            in its class. When you shop with us, you&apos;re investing in tools that elevate your reality.
                        </p>
                        <Link href="/shop" className={styles.storyBtn}>
                            Explore the Collection <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </AnimatedSection>

            {/* Services */}
            <AnimatedSection direction="up" delay={0.2}>
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionBadge}>OUR PROMISE</span>
                        <h2 className={styles.sectionTitle}>What We Deliver</h2>
                        <p className={styles.sectionDesc}>More than just products — a complete experience.</p>
                    </div>
                    <div className={styles.servicesGrid}>
                        {SERVICES.map((s, i) => (
                            <AnimatedSection key={s.title} direction="up" delay={0.1 + i * 0.08}>
                                <div className={styles.serviceCard}>
                                    <div className={styles.serviceIcon}>
                                        <s.icon size={22} />
                                    </div>
                                    <h3 className={styles.serviceTitle}>{s.title}</h3>
                                    <p className={styles.serviceDesc}>{s.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </section>
            </AnimatedSection>

            {/* CTA */}
            <AnimatedSection direction="up" delay={0.25}>
                <section className={styles.ctaSection}>
                    <h2 className={styles.ctaTitle}>Ready to Elevate?</h2>
                    <p className={styles.ctaDesc}>Browse our curated collection of premium electronics.</p>
                    <Link href="/shop" className={styles.ctaBtn}>
                        Shop Now <ArrowRight size={18} />
                    </Link>
                </section>
            </AnimatedSection>
        </div>
    );
}
