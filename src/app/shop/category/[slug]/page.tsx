import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Since this is a server component, and we only need to read public data,
// passing anon key directly is fine for this specific simple redirect.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    // 1. Fetch category ID using the slug
    const { data, error } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .single();

    // 2. Redirect to shop page with query params
    if (data && !error) {
        redirect(`/shop?category=${data.id}`);
    } else {
        // Fallback to shop root if not found
        redirect('/shop');
    }
}
