"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, ShoppingBag, Heart, ShieldCheck, Menu, ChevronDown, User, Package, MapPin, Settings, LogOut } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import styles from './Navbar.module.css';

export const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { openMobileMenu, openCart } = useUIStore();
    const cartItemsCount = useCartStore((state) => state.getTotalItems());
    const { user, profile, clearUser } = useUserStore();
    const [mounted, setMounted] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.navInner}>

                {/* Left: Logo + Hamburger */}
                <div className={styles.leftGroup}>
                    <button className={styles.menuButton} onClick={openMobileMenu} aria-label="Open mobile menu">
                        <Menu size={22} strokeWidth={2} />
                    </button>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoText}>NexCart</span>
                        <span className={styles.logoDot}>.</span>
                    </Link>
                </div>

                {/* Center: Navigation Links */}
                <nav className={styles.centerNav}>
                    <Link href="/" className={styles.navLink}>Home</Link>
                    <Link href="/shop" className={styles.navLink}>Shop</Link>
                    <div className={styles.dropdownContainer}>
                        <Link href="/shop/categories" className={styles.navLink}>
                            Categories <ChevronDown size={14} strokeWidth={2.5} className={styles.chevron} />
                        </Link>
                        <div className={styles.dropdownMenu}>
                            <Link href="/shop/category/smartphones" className={styles.dropdownItem}>Smartphones</Link>
                            <Link href="/shop/category/laptops" className={styles.dropdownItem}>Laptops</Link>
                            <Link href="/shop/category/audio" className={styles.dropdownItem}>Audio</Link>
                            <Link href="/shop/category/gaming" className={styles.dropdownItem}>Gaming</Link>
                            <Link href="/shop/category/accessories" className={styles.dropdownItem}>Accessories</Link>
                        </div>
                    </div>
                    <Link href="/deals" className={styles.navLink}>Deals</Link>
                    <Link href="/about" className={styles.navLink}>About</Link>
                </nav>

                {/* Right: Search + Actions */}
                <div className={styles.rightGroup}>
                    {/* Search */}
                    <div className={styles.searchWrap}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className={styles.searchInput}
                        />
                    </div>

                    {/* Action Icons */}
                    <div className={styles.actions}>
                        <Link href="/wishlist" title="Wishlist" className={styles.iconBtn}>
                            <Heart size={19} strokeWidth={1.8} />
                        </Link>
                        <button className={styles.iconBtn} onClick={openCart} title="Shopping Cart">
                            <ShoppingBag size={19} strokeWidth={1.8} />
                            {mounted && cartItemsCount > 0 && <span className={styles.badge}>{cartItemsCount}</span>}
                        </button>
                    </div>

                    {/* Auth */}
                    {mounted && user ? (
                        <div className={`${styles.dropdownContainer} ${styles.userDropdownContainer}`}>
                            <div className={styles.userPill}>
                                <span className={styles.userName}>
                                    {profile?.full_name?.split(' ')[0] || user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Account'}
                                </span>
                                <div
                                    className={styles.avatar}
                                    style={(profile?.avatar_url || user.user_metadata?.avatar_url) ? { backgroundImage: `url(${profile?.avatar_url || user.user_metadata?.avatar_url})` } : undefined}
                                >
                                    {!(profile?.avatar_url || user.user_metadata?.avatar_url) && (
                                        <span className={styles.avatarFallback}>
                                            {(profile?.full_name || user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={`${styles.dropdownMenu} ${styles.userDropdownMenu}`}>
                                {profile?.role === 'admin' && (
                                    <Link href="/admin/dashboard" className={styles.dropdownItem}>
                                        <ShieldCheck size={16} className={styles.dropdownIcon} /> Admin Panel
                                    </Link>
                                )}
                                <Link href="/user" className={styles.dropdownItem}>
                                    <User size={16} className={styles.dropdownIcon} /> Dashboard
                                </Link>
                                <Link href="/user/orders" className={styles.dropdownItem}>
                                    <Package size={16} className={styles.dropdownIcon} /> My Orders
                                </Link>
                                <Link href="/user/wishlist" className={styles.dropdownItem}>
                                    <Heart size={16} className={styles.dropdownIcon} /> Wishlist
                                </Link>
                                <Link href="/user/addresses" className={styles.dropdownItem}>
                                    <MapPin size={16} className={styles.dropdownIcon} /> Addresses
                                </Link>
                                <Link href="/user/settings" className={styles.dropdownItem}>
                                    <Settings size={16} className={styles.dropdownIcon} /> Settings
                                </Link>
                                <div className={styles.dropdownDivider} />
                                <button
                                    className={`${styles.dropdownItem} ${styles.signOutBtn}`}
                                    onClick={async () => {
                                        const supabase = createClient();
                                        await supabase.auth.signOut();
                                        clearUser();
                                        router.push('/login');
                                        router.refresh();
                                    }}
                                >
                                    <LogOut size={16} className={styles.dropdownIcon} /> Sign Out
                                </button>
                            </div>
                        </div>
                    ) : mounted ? (
                        <Link href="/login" className={styles.loginBtn}>
                            Sign In
                        </Link>
                    ) : (
                        <div className={styles.loginPlaceholder} />
                    )}
                </div>
            </div>
        </header>
    );
};
