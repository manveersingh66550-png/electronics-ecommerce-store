import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface UserState {
    user: User | null;
    profile: any | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setProfile: (profile: any | null) => void;
    setLoading: (loading: boolean) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    profile: null,
    isLoading: true,

    setUser: (user) => {
        console.trace('[userStore] setUser called', !!user);
        set({ user });
    },
    setProfile: (profile) => {
        console.log('[userStore] setProfile called', !!profile);
        set({ profile });
    },
    setLoading: (isLoading) => {
        console.log('[userStore] setLoading called', isLoading);
        set({ isLoading });
    },
    clearUser: () => {
        console.log('[userStore] clearUser called');
        set({ user: null, profile: null });
    }
}));
