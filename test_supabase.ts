// this file is for testing fetching data from supabase
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// Replace with hardcoded strings if env fails to load
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if(!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing env vars!");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    console.log("Fetching stories...");
    const { data, error } = await supabase
        .from('stories')
        .select('*');
    
    if (error) {
        console.error("Error fetching stories:", error);
    } else {
        console.log("Stories found:", data?.length);
        console.log("First story:", JSON.stringify(data?.[0] || {}, null, 2));
    }
}

test();
