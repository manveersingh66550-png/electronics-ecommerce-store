"use client";

import React from 'react';
import { useToastStore } from '@/store/toastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from './ToastContainer.module.css';

export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className={styles.container}>
            {toasts.map((toast) => (
                <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
                    <div className={styles.icon}>
                        {toast.type === 'success' && <CheckCircle2 size={18} />}
                        {toast.type === 'error' && <AlertCircle size={18} />}
                        {toast.type === 'info' && <Info size={18} />}
                    </div>
                    <p className={styles.message}>{toast.message}</p>
                    <button onClick={() => removeToast(toast.id)} className={styles.closeBtn}>
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}
