const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const categoriesToInsert = [
    { name: 'Smartphones', slug: 'smartphones' },
    { name: 'Tablets', slug: 'tablets' },
    { name: 'Laptops', slug: 'laptops' },
    { name: 'Audio', slug: 'audio' },
    { name: 'Wearables', slug: 'wearables' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Displays & TVs', slug: 'displays' },
    { name: 'Cameras', slug: 'cameras' },
    { name: 'Smart Home', slug: 'smart-home' },
    { name: 'Accessories', slug: 'accessories' }
];

async function main() {
    console.log("Adding categories to Supabase...");
    const { data, error } = await supabase.from('categories').insert(categoriesToInsert).select('*');
    if (error) {
        console.error("Error inserting categories:", error);
    } else {
        console.log("Successfully inserted categories:", JSON.stringify(data, null, 2));
    }
}

main();
