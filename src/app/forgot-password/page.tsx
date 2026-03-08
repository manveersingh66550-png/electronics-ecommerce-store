"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });

        if (resetError) {
            setError(resetError.message);
            setIsLoading(false);
            return;
        }

        setSuccess(true);
        setIsLoading(false);
    };

    if (success) {
        return (
            <div className={styles.authContainer}>
                <GlassPanel className={styles.authCard}>
                    <div className={styles.header} style={{ alignItems: 'center', textAlign: 'center' }}>
                        <CheckCircle2 size={48} style={{ color: 'var(--primary-accent)', marginBottom: '1rem' }} />
                        <h1 className={styles.title}>Email Sent</h1>
                        <p className={styles.subtitle}>
                            If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
                        </p>
                    </div>
                    <div className={styles.footer}>
                        <Link href="/login" className={styles.linkHighlight}>
                            <ArrowLeft size={16} style={{ marginRight: '0.25rem' }} />
                            Back to Sign In
                        </Link>
                    </div>
                </GlassPanel>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <GlassPanel className={styles.authCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Reset Password</h1>
                    <p className={styles.subtitle}>Enter your email to receive a reset link</p>
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

                    <Button variant="primary" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? <><Loader2 size={18} className={styles.spinner} /> Sending...</> : 'Send Reset Link'}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <Link href="/login" className={styles.linkHighlight}>
                        <ArrowLeft size={16} style={{ marginRight: '0.25rem' }} />
                        Back to Sign In
                    </Link>
                </div>
            </GlassPanel>
        </div>
    );
}
