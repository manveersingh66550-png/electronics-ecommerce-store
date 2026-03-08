"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatedSection } from '@/components/home/AnimatedSection/AnimatedSection';
import styles from './page.module.css';

const FAQ_DATA = [
    {
        category: 'Orders & Shipping',
        items: [
            {
                q: 'How long does shipping take?',
                a: 'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days delivery. Free shipping is available on all orders above ₹4999.',
            },
            {
                q: 'Can I track my order?',
                a: 'Yes! Once your order ships, you\'ll receive a tracking number via email. You can also track your order from your account dashboard under "My Orders".',
            },
            {
                q: 'Do you ship internationally?',
                a: 'Currently, we ship within India only. We are working on expanding our delivery network to serve international customers soon.',
            },
        ],
    },
    {
        category: 'Returns & Refunds',
        items: [
            {
                q: 'What is your return policy?',
                a: 'We offer a hassle-free 30-day return policy on all products. Items must be in their original condition with packaging. Simply initiate a return from your account dashboard.',
            },
            {
                q: 'How long do refunds take?',
                a: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited back to your original payment method.',
            },
            {
                q: 'Can I exchange a product?',
                a: 'Yes, exchanges are available for the same product in a different variant (color, size, etc.) subject to availability. Contact our support team to initiate an exchange.',
            },
        ],
    },
    {
        category: 'Products & Warranty',
        items: [
            {
                q: 'Are all products genuine?',
                a: 'Absolutely. We source all products directly from authorized distributors and manufacturers. Every product comes with a manufacturer warranty and proof of authenticity.',
            },
            {
                q: 'What warranty do products come with?',
                a: 'All products carry the manufacturer\'s standard warranty, typically 1-2 years depending on the product and brand. Warranty details are mentioned on each product page.',
            },
            {
                q: 'A product I want is out of stock. What can I do?',
                a: 'You can click "Notify Me" on the product page and we\'ll email you as soon as it\'s back in stock. Popular items are restocked frequently.',
            },
        ],
    },
    {
        category: 'Account & Support',
        items: [
            {
                q: 'How do I create an account?',
                a: 'Click "Sign In" in the top-right corner and choose "Create Account". You can sign up with your email address. An account lets you track orders, save wishlists, and enjoy faster checkout.',
            },
            {
                q: 'How can I contact customer support?',
                a: 'You can reach our support team via the "Contact Us" page, or email us at support@nexcart.com. Our support hours are Monday to Saturday, 9 AM – 8 PM IST.',
            },
            {
                q: 'Is my personal data secure?',
                a: 'Yes, we take data privacy very seriously. All personal data is encrypted and stored securely. We never share your information with third parties. Please review our Privacy Policy for more details.',
            },
        ],
    },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}>
            <button className={styles.accordionTrigger} onClick={() => setIsOpen(!isOpen)}>
                <span className={styles.question}>{q}</span>
                <ChevronDown size={20} className={styles.chevron} />
            </button>
            <div className={styles.accordionContent}>
                <p className={styles.answer}>{a}</p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    return (
        <div className={styles.pageWrapper}>
            {/* Hero Header */}
            <AnimatedSection direction="up" delay={0.1}>
                <section className={styles.hero}>
                    <span className={styles.heroBadge}>HELP CENTER</span>
                    <h1 className={styles.heroTitle}>Frequently Asked Questions</h1>
                    <p className={styles.heroDesc}>
                        Find quick answers to common questions about orders, shipping, returns, and more.
                    </p>
                </section>
            </AnimatedSection>

            {/* FAQ Categories */}
            <div className={styles.faqGrid}>
                {FAQ_DATA.map((section, sIdx) => (
                    <AnimatedSection key={section.category} direction="up" delay={0.15 + sIdx * 0.08}>
                        <div className={styles.categoryBlock}>
                            <h2 className={styles.categoryTitle}>{section.category}</h2>
                            <div className={styles.accordionGroup}>
                                {section.items.map((item) => (
                                    <AccordionItem key={item.q} q={item.q} a={item.a} />
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>
                ))}
            </div>

            {/* Contact CTA */}
            <AnimatedSection direction="up" delay={0.3}>
                <div className={styles.contactCta}>
                    <h3 className={styles.ctaTitle}>Still have questions?</h3>
                    <p className={styles.ctaDesc}>Our support team is ready to help you with anything.</p>
                    <a href="/contact" className={styles.ctaBtn}>Contact Support</a>
                </div>
            </AnimatedSection>
        </div>
    );
}
