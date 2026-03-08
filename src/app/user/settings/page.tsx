"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { User, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import styles from './settings.module.css';

export default function SettingsPage() {
    const [supabase] = useState(() => createClient());
    const { user, profile, setUser, setProfile } = useUserStore();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setFullName(user.user_metadata?.full_name || '');
                setEmail(user.email || '');
            }
            setProfileLoading(false);
        };
        loadUser();
    }, []);

    const handleProfileSave = async () => {
        setProfileSaving(true);
        setProfileError(null);
        setProfileSuccess(false);

        const { data: authData, error } = await supabase.auth.updateUser({
            data: { full_name: fullName },
        });

        if (error) {
            setProfileError(error.message);
        } else {
            // Update the profiles table
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id) {
                await supabase
                    .from('profiles')
                    .update({ full_name: fullName, first_name: fullName.split(' ')[0], last_name: fullName.split(' ').slice(1).join(' ') })
                    .eq('id', session.user.id);
            }

            // Sync with global store so UI updates immediately
            if (authData?.user) {
                setUser(authData.user);
            }
            if (profile) {
                setProfile({ ...profile, full_name: fullName, first_name: fullName.split(' ')[0] });
            }

            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        }
        setProfileSaving(false);
    };

    const handlePasswordChange = async () => {
        setPasswordError(null);
        setPasswordSuccess(false);

        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }

        setPasswordSaving(true);

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            setPasswordError(error.message);
        } else {
            setPasswordSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(false), 3000);
        }
        setPasswordSaving(false);
    };

    if (profileLoading) {
        return <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</p>;
    }

    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>Account Settings</h1>
            </div>

            {/* Profile Section */}
            <GlassPanel className={styles.section}>
                <div className={styles.sectionHeader}>
                    <User size={20} />
                    <h2>Profile Information</h2>
                </div>

                <div className={styles.formGrid}>
                    <div>
                        <label className={styles.label}>Full Name</label>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                        <label className={styles.label}>Email</label>
                        <Input value={email} disabled placeholder="Email" />
                        <p className={styles.hint}>Email cannot be changed here.</p>
                    </div>
                </div>

                {profileError && <p className={styles.error}>{profileError}</p>}
                {profileSuccess && (
                    <p className={styles.success}>
                        <CheckCircle2 size={14} /> Profile updated successfully
                    </p>
                )}

                <div className={styles.sectionActions}>
                    <Button variant="primary" onClick={handleProfileSave} disabled={profileSaving}>
                        {profileSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Changes'}
                    </Button>
                </div>
            </GlassPanel>

            {/* Password Section */}
            <GlassPanel className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Lock size={20} />
                    <h2>Change Password</h2>
                </div>

                <div className={styles.formStack}>
                    <div>
                        <label className={styles.label}>Current Password</label>
                        <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" />
                    </div>
                    <div>
                        <label className={styles.label}>New Password</label>
                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 characters)" />
                    </div>
                    <div>
                        <label className={styles.label}>Confirm New Password</label>
                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                    </div>
                </div>

                {passwordError && <p className={styles.error}>{passwordError}</p>}
                {passwordSuccess && (
                    <p className={styles.success}>
                        <CheckCircle2 size={14} /> Password changed successfully
                    </p>
                )}

                <div className={styles.sectionActions}>
                    <Button variant="primary" onClick={handlePasswordChange} disabled={passwordSaving || !newPassword}>
                        {passwordSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Update Password'}
                    </Button>
                </div>
            </GlassPanel>
        </>
    );
}
