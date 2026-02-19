// Uses .cjs style
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    console.log("Checking duplicates...");
    
    // Get all stories
    const { data: stories, error: sErr } = await supabase
        .from('stories')
        .select('*');

    if (sErr) console.error(sErr);
    
    // Get all profiles
    const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*');

    if (pErr) console.error(pErr);
    
    console.log("Profiles (Total: " + (profiles ? profiles.length : 0) + "):");
    profiles?.forEach(p => console.log(`ID: ${p.id}, Nick: ${p.nickname}`));

    console.log("\nStories (Total: " + (stories ? stories.length : 0) + "):");
    stories?.forEach(s => {
        const owner = profiles?.find(p => p.id === s.user_id);
        console.log(`Story ID: ${s.id}, Owner ID: ${s.user_id}, Owner Nick: ${owner ? owner.nickname : 'Unknown'}`);
    });
}

check();
