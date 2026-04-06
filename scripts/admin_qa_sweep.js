// QA Sweep Script (Simulated)
const fs = require('fs');
const path = require('path');

// Extract env vars manually from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key.trim()] = val.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase variables in .env.local');
  process.exit(1);
}

async function checkRLS() {
  console.log('🚀 Starting Admin RLS QA Sweep...\n');

  // 1. Check Programs
  const pResp = await fetch(`${supabaseUrl}/rest/v1/programs?select=id,title&limit=1`, {
    headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
  });
  const programs = await pResp.json();
  
  if (programs.length > 0) {
    const testId = programs[0].id;
    console.log(`✅ Programs are readable. Sample: "${programs[0].title}"`);

    const uResp = await fetch(`${supabaseUrl}/rest/v1/programs?id=eq.${testId}`, {
      method: 'PATCH',
      headers: { 
        'apikey': supabaseAnonKey, 
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ published: true })
    });
    
    if (uResp.status === 401 || uResp.status === 403 || uResp.status === 204 || uResp.status === 200) {
      const data = await uResp.json().catch(() => ({}));
      if (uResp.status >= 400 || (Array.isArray(data) && data.length === 0)) {
        console.log('✅ Correctly blocked unauthorized update to programs (Status:', uResp.status, ')');
      } else {
        console.warn('⚠️ WARNING: Programs update was NOT blocked.');
      }
    }
  }

  // 2. Check Ads
  const aResp = await fetch(`${supabaseUrl}/rest/v1/ads?select=id,advertiser&limit=1`, {
    headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
  });
  const ads = await aResp.json();
  if (ads.length > 0) {
    console.log(`✅ Ads are readable. Sample: "${ads[0].advertiser}"`);
  } else {
    console.log('✅ Ads are correctly restricted (likely due to campaign dates).');
  }

  // 3. Check Profiles
  const profResp = await fetch(`${supabaseUrl}/rest/v1/profiles?select=email&limit=1`, {
    headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
  });
  if (profResp.status >= 400) {
    console.log('✅ Correctly blocked anon access to profiles.');
  } else {
    const profs = await profResp.json();
    if (profs.length === 0) {
      console.log('✅ Profile access restricted.');
    } else {
      console.warn('⚠️ WARNING: Profiles table is readable by anonymous users!');
    }
  }

  console.log('\n--- QA Sweep Complete ---');
  console.log('Note: To enable admin writes, apply migration 004 in Supabase SQL editor.');
}

checkRLS().catch(console.error);
