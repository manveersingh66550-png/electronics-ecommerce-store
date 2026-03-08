"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { GlassPanel } from '@/components/ui/GlassPanel';
import styles from './MobileSlideDrawer.module.css';

export function MobileSlideDrawer() {
    const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
    const { user, profile } = useUserStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isMobileMenuOpen) return null;

    return (
        <div className={styles.overlay} onClick={closeMobileMenu}>
            <GlassPanel className={styles.drawer} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <div className={styles.header}>
                    <Link href="/" className={styles.logo} onClick={closeMobileMenu}>
                        NexCart
                    </Link>
                    <button className={styles.closeBtn} onClick={closeMobileMenu} aria-label="Close menu">
                        <X size={24} />
                    </button>
                </div>

                <nav className={styles.navLinks}>
                    <Link href="/" onClick={closeMobileMenu}>Home</Link>
                    <Link href="/shop" onClick={closeMobileMenu}>Shop</Link>
                    <Link href="/shop/categories" onClick={closeMobileMenu}>Categories</Link>
                    <Link href="/about" onClick={closeMobileMenu}>About Us</Link>

                    <div className={styles.divider}></div>

                    {mounted && user ? (
                        <>
                            <div className={styles.mobileProfile}>
                                <div
                                    className={styles.mobileAvatar}
                                    style={profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : undefined}
                                ></div>
                                <span>{profile?.full_name || user.email?.split('@')[0] || 'My Account'}</span>
                            </div>
                            <Link href="/user" onClick={closeMobileMenu}>Account</Link>
                        </>
                    ) : mounted ? (
                        <Link href="/login" onClick={closeMobileMenu} className={styles.loginLink}>Login / Sign Up</Link>
                    ) : null}

                    <Link href="/admin/dashboard" onClick={closeMobileMenu}>Admin</Link>
                </nav>
            </GlassPanel>
        </div>
    );
}
