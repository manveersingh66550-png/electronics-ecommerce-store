"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { User, Lock, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import styles from '../login/page.module.css';

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (signUpError) {
            setError(signUpError.message);
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
                        <h1 className={styles.title}>Check Your Email</h1>
                        <p className={styles.subtitle}>
                            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Please click the link to activate your account.
                        </p>
                    </div>
                    <div className={styles.footer}>
                        <Link href="/login" className={styles.linkHighlight}>
                            Return to Sign In
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
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Join NexCart for premium gear</p>
                </div>

                {error && (
                    <div className={styles.errorBanner}>
                        {error}
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <Input
                            type="text"
                            placeholder="Full Name"
                            icon={<User size={18} />}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
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
                            placeholder="Password (min 6 characters)"
                            icon={<Lock size={18} />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.actions} style={{ justifyContent: 'center' }}>
                        <label className={styles.checkbox}>
                            <input type="checkbox" required />
                            <span>I agree to the Terms & Conditions</span>
                        </label>
                    </div>

                    <Button variant="primary" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? <><Loader2 size={18} className={styles.spinner} /> Creating account...</> : 'Create Account'}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <span>Already have an account?</span>
                    <Link href="/login" className={styles.linkHighlight}>
                        Sign in
                    </Link>
                </div>
            </GlassPanel>
        </div>
    );
}
