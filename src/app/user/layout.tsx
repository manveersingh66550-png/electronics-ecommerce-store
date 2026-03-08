"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { User, Package, Heart, MapPin, Settings, LogOut, Loader2 } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { DebugStore } from './debug-store';
import styles from './user.module.css';

const NAV_ITEMS = [
    { href: '/user', label: 'Dashboard', icon: User, exact: true },
    { href: '/user/orders', label: 'My Orders', icon: Package },
    { href: '/user/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/user/addresses', label: 'Addresses', icon: MapPin },
    { href: '/user/settings', label: 'Settings', icon: Settings },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [supabase] = useState(() => createClient());
    const { user: globalUser, profile: globalProfile, isLoading, clearUser } = useUserStore();

    if (typeof window !== 'undefined') {
        const renders = (window as any).__renders || 0;
        (window as any).__renders = renders + 1;
        if (renders < 20) {
            console.log('[UserLayout] render', { globalUser: !!globalUser, isLoading }, new Error().stack);
        }
    }

    useEffect(() => {
        if (!isLoading && !globalUser) {
            router.push('/login');
        }
    }, [globalUser, isLoading, router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        clearUser();
        router.push('/login');
        router.refresh();
    };

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    if (isLoading) {
        return (
            <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
                <DebugStore />
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!globalUser) {
        return null;
    }

    const initials = globalProfile?.full_name
        ? globalProfile.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
        : globalUser.email ? globalUser.email.slice(0, 2).toUpperCase() : '??';

    const displayName = globalProfile?.full_name || globalUser.email?.split('@')[0] || 'User';

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <GlassPanel className={styles.sidebarPanel}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>{initials}</div>
                        <div>
                            <h2 className={styles.userName}>{displayName}</h2>
                            <p className={styles.userEmail}>{globalUser?.email}</p>
                        </div>
                    </div>

                    <nav className={styles.nav}>
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive(item.href, item.exact) ? styles.active : ''}`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className={styles.bottomNav}>
                        <button className={styles.logoutBtn} onClick={handleSignOut}>
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </GlassPanel>
            </aside>

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
