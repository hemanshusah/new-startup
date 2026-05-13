const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key.trim()] = val.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // This might not exist
  if (error) {
    // Fallback: try querying a known table or common ones
    console.log('RPC get_tables failed. Trying manual check of common tables...');
    const tables = ['profiles', 'user_bookmarks', 'bookmarks', 'programs', 'mentor_profiles', 'program_views', 'session_types'];
    for (const table of tables) {
      const { error: tErr } = await supabase.from(table).select('count').limit(1);
      if (!tErr) {
        console.log(`✅ Table "${table}" exists.`);
      } else {
        console.log(`❌ Table "${table}" does not exist (or error: ${tErr.code}).`);
      }
    }
  } else {
    console.log('Tables:', data);
  }
}

listTables();
