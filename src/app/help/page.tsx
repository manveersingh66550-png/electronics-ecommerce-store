"use client";

import React, { useState } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ChevronDown, MessageSquare, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import styles from './help.module.css';

const FAQS = [
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for all unused items in their original packaging. Simply contact our support team to initiate a return. Refunds are processed within 5-7 business days."
    },
    {
        question: "How long does shipping take?",
        answer: "Standard shipping takes 3-5 business days within the US. Expedited shipping (1-2 days) is available at checkout. International shipping typically takes 7-14 business days depending on customs."
    },
    {
        question: "Do your products come with a warranty?",
        answer: "Yes, all NexCart hardware comes with a 2-year comprehensive manufacturer's warranty covering defects in materials and workmanship. Damage from accidental drops or water exposure is not covered."
    },
    {
        question: "Can I change my delivery address after ordering?",
        answer: "If your order has not yet been processed (typically within 2 hours of placing the order), we can update your address. Please contact support immediately."
    },
    {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to over 100 countries worldwide. International shipping rates and estimated delivery times are calculated at checkout based on your location."
    }
];

export default function HelpPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Help Center</h1>
                <p className={styles.subtitle}>How can we assist you today?</p>
            </div>

            <div className={styles.grid}>
                {/* FAQ Section */}
                <div className={styles.faqSection}>
                    <h2>Frequently Asked Questions</h2>
                    <div className={styles.accordion}>
                        {FAQS.map((faq, index) => (
                            <div
                                key={index}
                                className={`${styles.accordionItem} ${openIndex === index ? styles.open : ''}`}
                            >
                                <button
                                    className={styles.accordionHeader}
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                >
                                    <span>{faq.question}</span>
                                    <ChevronDown size={18} className={styles.chevron} />
                                </button>
                                <div className={styles.accordionBody}>
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Cards */}
                <div className={styles.contactSection}>
                    <h2>Still need help?</h2>
                    <p className={styles.contactDesc}>Our dedicated support team is available 24/7 to assist you.</p>

                    <div className={styles.contactCards}>
                        <Link href="/contact" className={styles.contactCard}>
                            <GlassPanel className={styles.cardPanel}>
                                <div className={styles.cardIcon}><Mail size={24} /></div>
                                <h3>Email Support</h3>
                                <p>Send us a message and we'll reply within 24 hours.</p>
                                <span className={styles.cardLink}>Contact Us &rarr;</span>
                            </GlassPanel>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
