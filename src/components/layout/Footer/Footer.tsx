"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

export const Footer = () => {
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className={styles.footer}>
            {/* Top Section: Brand + Links */}
            <div className={styles.topSection}>
                <div className={styles.brandColumn}>
                    <Link href="/" className={styles.logo}>
                        NexCart<span className={styles.logoDot}>.</span>
                    </Link>
                    <p className={styles.tagline}>
                        Premium electronics store, created for you. Elevating your tech experience with quality and style.
                    </p>
                </div>

                <div className={styles.linksArea}>
                    <div className={styles.linkColumn}>
                        <h4 className={styles.columnTitle}>Shop</h4>
                        <Link href="/shop/category/audio">Audio</Link>
                        <Link href="/shop/category/wearables">Wearables</Link>
                        <Link href="/shop">All Products</Link>
                        <Link href="/deals">Deals</Link>
                    </div>

                    <div className={styles.linkColumn}>
                        <h4 className={styles.columnTitle}>Support</h4>
                        <Link href="/help">Help Center</Link>
                        <Link href="/contact">Contact Us</Link>
                        <Link href="/track-order">Track Order</Link>
                        <Link href="/faq">FAQ</Link>
                    </div>

                    <div className={styles.linkColumn}>
                        <h4 className={styles.columnTitle}>Company</h4>
                        <Link href="/about">About Us</Link>
                        <Link href="/policies/terms">Terms of Service</Link>
                        <Link href="/policies/privacy">Privacy Policy</Link>
                        <Link href="/policies/returns">Returns</Link>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className={styles.divider} />

            {/* Bottom Bar */}
            <div className={styles.bottomBar}>
                <p className={styles.copyright}>
                    &copy; {new Date().getFullYear()} NexCart Electronics. All rights reserved.
                </p>
            </div>
        </footer>
    );
};
