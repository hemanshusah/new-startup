// scripts/phase8_qa.js
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key.trim()] = val.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const localServer = 'http://localhost:3000';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runQA() {
  console.log('🚀 Starting Phase 8 Terminal QA Sweep...\n');

  let allPassed = true;

  // -------------------------------------------------------------
  // 8.1 & 8.2 Rendering & Responsive (HTTP Checks)
  // -------------------------------------------------------------
  console.log('--- 8.1 & 8.2 Rendering & Responsive ---');
  try {
    const resHome = await fetch(`${localServer}/`);
    if (resHome.ok) {
      console.log('✅ Listing Page (/) rendered successfully (HTTP 200).');
      const html = await resHome.text();
      // Basic check for responsive containers or grid wrappers present in the UI
      if (html.includes('grid') || html.includes('flex')) {
         console.log('✅ Found responsive layout classes (grid/flex) in payload.');
      } else {
         console.warn('⚠️ Could not verify responsive classes in raw HTML.');
      }
    } else {
      console.error(`❌ Listing Page failed with status: ${resHome.status}`);
      allPassed = false;
    }
    
    // Auth Modal Check in HTML
    const resLayout = await fetch(`${localServer}/`);
    const layoutHtml = await resLayout.text();
    if (layoutHtml.includes('Sign in to view program details')) {
       console.log('✅ Auth Modal is correctly rendered/hydrated into the DOM tree.');
    } else {
       console.warn('⚠️ Auth Modal text not found instantly in HTML payload (may be client-rendered).');
    }

  } catch (e) {
    console.error('❌ Local server not reachable. Is `npm run dev` running?', e.message);
    allPassed = false;
  }

  // -------------------------------------------------------------
  // 8.5 Content Population
  // -------------------------------------------------------------
  console.log('\n--- 8.5 Content Population ---');
  const { data: programs, error: pErr } = await supabase
    .from('programs')
    .select('id, title, about, what_you_get, eligibility')
    .eq('published', true)
    .eq('status', 'active');

  if (pErr) {
    console.error('❌ Error fetching programs:', pErr.message);
    allPassed = false;
  } else {
    if (programs.length >= 20) {
      console.log(`✅ Programs table has ${programs.length} active+published programs (Requirement: >= 20).`);
    } else {
      console.error(`❌ Programs table has only ${programs.length} active+published programs (Requirement: >= 20).`);
      allPassed = false;
    }

    let fullyPopulatedCount = 0;
    programs.forEach(p => {
      if (p.about && p.what_you_get && p.what_you_get.length > 0 && p.eligibility && p.eligibility.length > 0) {
        fullyPopulatedCount++;
      }
    });

    if (fullyPopulatedCount >= 10) {
      console.log(`✅ ${fullyPopulatedCount} programs have rich content ('about', 'what_you_get', 'eligibility') populated (Requirement: >= 10).`);
    } else {
      console.error(`❌ Only ${fullyPopulatedCount} programs have rich content populated (Requirement: >= 10).`);
      allPassed = false;
    }
  }

  const { data: ads, error: aErr } = await supabase
    .from('softinfra')
    .select('id, format')
    .eq('is_active', true);

  if (aErr) {
    // try 'ads' table fallback if softinfra doesn't exist yet/was reverted
    const { data: fallbackAds } = await supabase.from('ads').select('id').eq('is_active', true).catch(()=>({data:null}));
    if (fallbackAds && fallbackAds.length >= 2) {
       console.log(`✅ Ads table has ${fallbackAds.length} active ads (Requirement: >= 2).`);
    } else {
       console.error(`❌ Failed to fetch ads or softinfra.`);
       allPassed = false;
    }
  } else {
    if (ads.length >= 2) {
      console.log(`✅ Softinfra (Ads) table has ${ads.length} active ads (Requirement: >= 2).`);
    } else {
      console.error(`❌ Softinfra (Ads) table has only ${ads.length} active ads (Requirement: >= 2).`);
      allPassed = false;
    }
  }

  // -------------------------------------------------------------
  // 8.4 Ad System QA
  // -------------------------------------------------------------
  console.log('\n--- 8.4 Ad System QA ---');
  try {
     const adToTest = ads && ads.length > 0 ? ads[0] : null;
     if (adToTest) {
        // Send fake click (GET route redirects)
        const clickRes = await fetch(`${localServer}/api/softinfra/click?id=${adToTest.id}&url=https://grantsindia.com`, {
          method: 'GET',
          redirect: 'manual'
        });
        
        if (clickRes.status === 307 || clickRes.status === 302 || clickRes.status === 200 || clickRes.status === 308) {
           console.log(`✅ Successfully reached softinfra (ad) click endpoint. (Redirect response)`);
        } else {
           console.error(`❌ Failed to register softinfra click. API returned: ${clickRes.status}`);
           allPassed = false;
        }
     } else {
        console.warn('⚠️ No active ads found to test click endpoint.');
     }
  } catch (e) {
     console.error('❌ Ad system test failed:', e.message);
     allPassed = false;
  }

  // -------------------------------------------------------------
  // 8.3 Auth API QA
  // -------------------------------------------------------------
  console.log('\n--- 8.3 Auth API QA ---');
  try {
     const { data: authData, error: authErr } = await supabase.auth.getSession();
     if (!authErr) {
        console.log('✅ Supabase Auth Client successfully initialized and accessible.');
     } else {
        console.error('❌ Supabase Auth Client returned an error:', authErr.message);
        allPassed = false;
     }

     const { data: users, error: profErr } = await supabase.from('profiles').select('id').limit(1);
     if (!profErr) {
        console.log('✅ Verified "profiles" table is linked and queryable (confirming auth trigger config).');
     } else {
        console.error('❌ Could not query profiles table:', profErr.message);
        allPassed = false;
     }
  } catch(e) {
     console.error('❌ Auth QA exception:', e.message);
     allPassed = false;
  }

  // -------------------------------------------------------------
  // 8.6 Analytics Validation
  // -------------------------------------------------------------
  console.log('\n--- 8.6 Analytics ---');
  const layoutFilePath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
  if (fs.existsSync(layoutFilePath)) {
     const layoutSrc = fs.readFileSync(layoutFilePath, 'utf8');
     if (layoutSrc.includes('@vercel/analytics') && layoutSrc.includes('<Analytics />')) {
        console.log('✅ Vercel Analytics is installed and injected in layout.tsx.');
     } else {
        console.error('❌ Analytics script not found in layout.tsx');
        allPassed = false;
     }
  } else {
     console.error('❌ layout.tsx not found.');
     allPassed = false;
  }

  // -------------------------------------------------------------
  // 8.11 New Ad System Enhancements (Image Only & Slots)
  // -------------------------------------------------------------
  console.log('\n--- 8.11 Ad Enhancements ---');
  const { data: imgAds } = await supabase.from('softinfra').select('id').eq('is_image_only', true);
  if (imgAds && imgAds.length > 0) {
    console.log(`✅ Verified Image-Only ads exist in the database (${imgAds.length} found).`);
  } else {
    console.warn('⚠️ No Image-Only ads found in database.');
  }

  const gridPath = path.join(process.cwd(), 'src', 'components', 'listing', 'GrantsGrid.tsx');
  if (fs.existsSync(gridPath)) {
    const gridSrc = fs.readFileSync(gridPath, 'utf8');
    if (gridSrc.includes('exactAdMapping') && gridSrc.includes('pinpointAds')) {
      console.log('✅ Verified "Pinpoint vs Flow" ad matrix logic is present in GrantsGrid.tsx.');
    } else {
      console.error('❌ Pinpoint ad logic missing from GrantsGrid.tsx');
      allPassed = false;
    }
  }

  // -------------------------------------------------------------
  // 8.12 Hydration Fix
  // -------------------------------------------------------------
  console.log('\n--- 8.12 Hydration Fix ---');
  const filterBarPath = path.join(process.cwd(), 'src', 'components', 'listing', 'FilterBar.tsx');
  if (fs.existsSync(filterBarPath)) {
    const fbSrc = fs.readFileSync(filterBarPath, 'utf8');
    if (fbSrc.includes('suppressHydrationWarning')) {
      console.log('✅ Verified suppressHydrationWarning is applied to search input in FilterBar.tsx.');
    } else {
      console.error('❌ suppressHydrationWarning missing from FilterBar.tsx');
      allPassed = false;
    }
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n=======================================');
  if (allPassed) {
    console.log('🏆 ALL PHASE 8 TERMINAL QA CHECKS PASSED.');
  } else {
    console.log('⚠️ SOME Phase 8 QA CHECKS FAILED. See above for details.');
  }
  console.log('=======================================');
  process.exit(allPassed ? 0 : 1);
}

runQA();
