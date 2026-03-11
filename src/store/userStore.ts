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
        set({ user });
    },
    setProfile: (profile) => {
        set({ profile });
    },
    setLoading: (isLoading) => {
        set({ isLoading });
    },
    clearUser: () => {
        set({ user: null, profile: null });
    }
}));
