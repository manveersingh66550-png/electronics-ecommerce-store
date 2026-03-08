"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { LayoutDashboard, Package, Users, ShoppingCart, Settings, LogOut, ArrowLeft } from 'lucide-react';
import styles from './adminLayout.module.css';

const NAV_ITEMS = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className={styles.adminContainer}>
            <aside className={styles.sidebar}>
                <GlassPanel className={styles.sidebarPanel}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}></div>
                        <span className={styles.logoText}>NexCart Admin</span>
                    </div>

                    <nav className={styles.nav}>
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.active : ''}`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className={styles.bottomNav}>
                        <Link href="/" className={styles.navItem}>
                            <ArrowLeft size={20} /> Back to Store
                        </Link>
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            <LogOut size={20} /> Logout
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
