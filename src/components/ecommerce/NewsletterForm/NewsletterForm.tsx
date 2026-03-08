"use client";

import React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { useToastStore } from '@/store/toastStore';
import styles from './NewsletterForm.module.css';

export function NewsletterForm() {
    const { addToast } = useToastStore();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        // In a real app we'd await the server action
        await new Promise(r => setTimeout(r, 500));

        addToast('Successfully subscribed to the newsletter!', 'success');
        form.reset();
    };

    return (
        <form className={styles.newsletterForm} onSubmit={handleSubmit}>
            <input type="email" placeholder="Enter your email address" required />
            <Button type="submit" variant="primary">Subscribe</Button>
        </form>
    );
}
