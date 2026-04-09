const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val) env[key.trim()] = val.join('=').trim();
  });

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  console.log('Validating show_newsletter column...');
  const { data, error } = await supabase.from('site_config').select('show_newsletter').limit(1);
  
  if (error) {
    console.log('Column might be missing. Error:', error.message);
    console.log('Please run this SQL in Supabase SQL Editor:');
    console.log('ALTER TABLE site_config ADD COLUMN IF NOT EXISTS show_newsletter BOOLEAN DEFAULT true;');
  } else {
    console.log('Column already exists.');
  }
}

main();
