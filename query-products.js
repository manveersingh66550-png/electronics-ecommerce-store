const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
    const { data, error } = await supabase.from('products').select('*').limit(3);
    if (error) console.error("Error:", error);
    else console.log("Products:", JSON.stringify(data, null, 2));
}
main();
