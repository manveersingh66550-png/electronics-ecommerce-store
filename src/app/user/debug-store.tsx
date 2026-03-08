"use client";
import React from 'react';
import { useUserStore } from '@/store/userStore';

export function DebugStore() {
    const store = useUserStore();
    return (
        <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'red', color: 'white', zIndex: 9999, padding: '10px' }}>
            isLoading: {String(store.isLoading)}<br/>
            user: {store.user ? 'yes' : 'no'}
        </div>
    );
}
