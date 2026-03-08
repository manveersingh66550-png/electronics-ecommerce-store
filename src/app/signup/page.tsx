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

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        }
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

                <div className={styles.separator}>or</div>

                <Button
                    variant="outline"
                    className={styles.socialBtn}
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    type="button"
                >
                    <svg className={styles.googleIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Sign up with Google
                </Button>

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
