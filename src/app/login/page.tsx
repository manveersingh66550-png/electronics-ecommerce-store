"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Lock, Mail, Loader2 } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setError(signInError.message);
            setIsLoading(false);
            return;
        }

        router.push('/');
        router.refresh();
    };

    return (
        <div className={styles.authContainer}>
            <GlassPanel className={styles.authCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to your account</p>
                </div>

                {error && (
                    <div className={styles.errorBanner}>
                        {error}
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <Input
                            type="email"
                            placeholder="Email address"
                            icon={<Mail size={18} />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <Input
                            type="password"
                            placeholder="Password"
                            icon={<Lock size={18} />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.actions}>
                        <label className={styles.checkbox}>
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <Link href="/forgot-password" className={styles.link}>
                            Forgot password?
                        </Link>
                    </div>

                    <Button variant="primary" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? <><Loader2 size={18} className={styles.spinner} /> Signing in...</> : 'Sign In'}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <span>Don&apos;t have an account?</span>
                    <Link href="/signup" className={styles.linkHighlight}>
                        Sign up now
                    </Link>
                </div>
            </GlassPanel>
        </div>
    );
}
