// Uses .cjs style
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    console.log("Fetching stories with profiles...");
    const { data: storiesData, error } = await supabase
        .from('stories')
        .select(`
          *, 
          profiles (
            nickname
          )
        `);
    
    if (error) {
        console.error("Error fetching stories:", error);
    } else {
        console.log("Stories found:", storiesData?.length);
        if (storiesData && storiesData.length > 0) {
            console.log("First story profile:", storiesData[0].profiles);
        } else {
            console.log("No stories found with profile join.");
        }
    }
}

test();
