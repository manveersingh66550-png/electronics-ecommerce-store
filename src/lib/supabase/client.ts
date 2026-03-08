import { createBrowserClient } from '@supabase/ssr'

let globalSupabase: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
    if (globalSupabase) return globalSupabase;

    globalSupabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return globalSupabase;
}
