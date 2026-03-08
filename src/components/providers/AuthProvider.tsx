"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/userStore";

let authProviderMounts = 0;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const setUser = useUserStore(state => state.setUser);
    const setProfile = useUserStore(state => state.setProfile);
    const setLoading = useUserStore(state => state.setLoading);
    const clearUser = useUserStore(state => state.clearUser);

    useEffect(() => {
        authProviderMounts++;
        console.log(`[AuthProvider] Mount #${authProviderMounts}`);
        const supabase = createClient();

        // 1. Get the initial session
        const initSession = async () => {
            console.log(`[AuthProvider] initSession start (Mount #${authProviderMounts})`);
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    setUser(user);
                    // Fetch profile if you have a profiles table
                    const { data: profile, error } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .maybeSingle();
                    console.log('[AuthProvider] profile fetch result', { error });
                    if (error) {
                        console.error('Profile fetch error:', error);
                    }
                    setProfile(profile);
                } else {
                    clearUser();
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                clearUser();
            } finally {
                console.log('[AuthProvider] initSession finally, setting loading false');
                setLoading(false);
            }
        };

        initSession();

        // 2. Listen for auth state changes (login, logout, token refresh)
        /*
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[AuthProvider] onAuthStateChange event: ${event}`);
            if (event === "SIGNED_IN" && session?.user) {
                setUser(session.user);
                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();
                setProfile(profile);
                setLoading(false);
            } else if (event === "SIGNED_OUT") {
                clearUser();
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
        */
    }, [setUser, setProfile, setLoading, clearUser]);

    return <>{children}</>;
}
