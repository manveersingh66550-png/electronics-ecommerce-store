"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import styles from '../login/page.module.css'; // Reusing established login styles

export default function ResetPasswordPage() {
    const router = useRouter();
    const supabase = createClient();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            setIsLoading(false);
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: password
        });

        if (updateError) {
            setError(updateError.message);
            setIsLoading(false);
            return;
        }

        setSuccess(true);
        setIsLoading(false);

        // Redirect to home/dashboard after brief delay
        setTimeout(() => {
            router.push('/');
            router.refresh();
        }, 2000);
    };

    if (success) {
        return (
            <div className={styles.authContainer}>
                <GlassPanel className={styles.authCard}>
                    <div className={styles.header} style={{ alignItems: 'center', textAlign: 'center' }}>
                        <CheckCircle2 size={48} style={{ color: 'var(--status-active)', marginBottom: '1rem' }} />
                        <h1 className={styles.title}>Password Updated!</h1>
                        <p className={styles.subtitle}>
                            Your password has been successfully reset. Redirecting you to the home page...
                        </p>
                    </div>
                </GlassPanel>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <GlassPanel className={styles.authCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Set New Password</h1>
                    <p className={styles.subtitle}>Please enter your new password below</p>
                </div>

                {error && (
                    <div className={styles.errorBanner}>
                        {error}
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <Input
                            type="password"
                            placeholder="New password"
                            icon={<Lock size={18} />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <Input
                            type="password"
                            placeholder="Confirm new password"
                            icon={<Lock size={18} />}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button variant="primary" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? <><Loader2 size={18} className={styles.spinner} /> Updating...</> : 'Update Password'}
                    </Button>
                </form>
            </GlassPanel>
        </div>
    );
}
