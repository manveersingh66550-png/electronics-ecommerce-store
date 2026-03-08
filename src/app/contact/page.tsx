"use client";

import React, { useState } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { createClient } from '@/lib/supabase/client';
import styles from './contact.module.css';

export default function ContactPage() {
    const { addToast } = useToastStore();
    const supabase = createClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const subject = formData.get('subject') as string;
        const message = formData.get('message') as string;

        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert([{ name, email, subject, message }]);

            if (error) throw error;

            addToast('Your message has been sent successfully. We will get back to you soon!', 'success');
            form.reset();
        } catch (error: any) {
            console.error('Error submitting contact form:', error);
            addToast(error.message || 'Failed to send message. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Contact Us</h1>
                <p className={styles.subtitle}>We'd love to hear from you. Please fill out the form below.</p>
            </div>

            <div className={styles.grid}>
                <div className={styles.formSection}>
                    <GlassPanel className={styles.panel}>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" name="name" required placeholder="John Doe" className={styles.input} />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" name="email" required placeholder="john@example.com" className={styles.input} />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="subject">Subject</label>
                                <select id="subject" name="subject" className={styles.input} required>
                                    <option value="">Select a topic</option>
                                    <option value="order">Order Inquiry</option>
                                    <option value="product">Product Support</option>
                                    <option value="warranty">Warranty Claim</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message">Message</label>
                                <textarea id="message" name="message" rows={5} required placeholder="How can we help?" className={styles.textarea}></textarea>
                            </div>

                            <Button type="submit" variant="primary" style={{ width: '100%' }} disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    </GlassPanel>
                </div>

                <div className={styles.infoSection}>
                    <GlassPanel className={styles.infoPanel}>
                        <h3>Get in touch</h3>
                        <p className={styles.infoText}>
                            Our team is available Monday through Friday, 9am to 6pm IST. We strive to reply to all inquiries within 24 hours.
                        </p>

                        <div className={styles.contactDetails}>
                            <div className={styles.detailRow}>
                                <MapPin size={20} className={styles.icon} />
                                <div>
                                    <strong>Headquarters</strong>
                                    <p>CT group of institutions<br />Jalandhar, Punjab</p>
                                </div>
                            </div>

                            <div className={styles.detailRow}>
                                <Phone size={20} className={styles.icon} />
                                <div>
                                    <strong>Phone</strong>
                                    <p>+91 9780559845</p>
                                </div>
                            </div>

                            <div className={styles.detailRow}>
                                <Mail size={20} className={styles.icon} />
                                <div>
                                    <strong>Email</strong>
                                    <p>manveersingh66550@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
}
