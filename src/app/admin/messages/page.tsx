"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button/Button';
import { MessageSquare, Mail, RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import styles from './messages.module.css';

interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'read' | 'unread';
    created_at: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToastStore();
    const supabase = createClient();

    const fetchMessages = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setMessages(data || []);
        } catch (err: any) {
            console.error('Error fetching messages:', err);
            setError(err.message || 'Failed to load messages');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'unread' ? 'read' : 'unread';

        // Optimistic update
        setMessages(prev => prev.map(msg =>
            msg.id === id ? { ...msg, status: newStatus } : msg
        ));

        try {
            const { error: updateError } = await supabase
                .from('contact_messages')
                .update({ status: newStatus })
                .eq('id', id);

            if (updateError) throw updateError;
            addToast(`Message marked as ${newStatus}`, 'success');
        } catch (err: any) {
            console.error('Error updating status:', err);
            // Revert optimistic update
            setMessages(prev => prev.map(msg =>
                msg.id === id ? { ...msg, status: currentStatus as 'read' | 'unread' } : msg
            ));
            addToast('Failed to update message status', 'error');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    };

    if (isLoading && messages.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.loader}>
                    <div className={styles.spinner}></div>
                    <p>Loading messages...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <Button variant="outline" onClick={fetchMessages}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Contact Messages</h1>
                    <p className={styles.subtitle}>
                        Manage inquiries received from the Contact Us form.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="outline" onClick={fetchMessages} icon={<RefreshCw size={16} />}>
                        Refresh
                    </Button>
                </div>
            </div>

            <GlassPanel className={styles.contentPanel}>
                {messages.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MessageSquare size={48} opacity={0.3} />
                        <p>No messages received yet.</p>
                    </div>
                ) : (
                    <div className={styles.messagesGrid}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`${styles.messageCard} ${msg.status === 'unread' ? styles.unread : ''}`}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.senderInfo}>
                                        <div className={styles.senderName}>
                                            {msg.name}
                                            {msg.status === 'unread' && <span className={styles.unreadBadge}>New</span>}
                                        </div>
                                        <div className={styles.senderEmail}>
                                            <a href={`mailto:${msg.email}`}>{msg.email}</a>
                                        </div>
                                    </div>
                                    <div className={styles.messageMeta}>
                                        <span className={styles.date}>{formatDate(msg.created_at)}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleStatus(msg.id, msg.status)}
                                            style={{ color: msg.status === 'unread' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                                            icon={msg.status === 'unread' ? <Circle size={16} /> : <CheckCircle2 size={16} />}
                                        >
                                            {msg.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
                                        </Button>
                                    </div>
                                </div>

                                <div className={styles.cardBody}>
                                    <h4 className={styles.subject}>{msg.subject}</h4>
                                    <p className={styles.messageText}>{msg.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassPanel>
        </div>
    );
}
