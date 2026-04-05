-- ============================================================
-- GRANTSINDIA — Seed Data
-- Run this AFTER 001_initial_schema.sql
-- Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- PROGRAMS — 22 realistic Indian startup programs
-- ============================================================

insert into public.programs (
  slug, title, organisation, type, status, deadline,
  amount_min, amount_max, amount_display, equity, mode, stage,
  duration, cohort_size, description_short, about,
  what_you_get, eligibility, how_to_apply, apply_url,
  sectors, state, is_india, is_featured, published
) values

-- 1. EMERGE Pre-Incubation Program 2026 (sample from spec)
(
  'emerge-pre-incubation-2026',
  'EMERGE Pre-Incubation Program 2026',
  'AIC-Pinnacle Entrepreneurship Forum',
  'incubation', 'active', '2026-06-30',
  null, null, 'Not specified', 'Zero equity', 'Virtual', 'Ideation / Prototype',
  '~3 months', 'Limited seats',
  'Entry-level pre-incubation for ideation-stage founders to build prototypes and enter the AIC-Pinnacle ecosystem. Zero equity, fully virtual.',
  'The EMERGE Pre-Incubation Program by AIC-Pinnacle is designed for early-stage founders who have an idea but need structured support to build their first prototype. The program runs over three months in a fully virtual format, offering weekly mentorship sessions, access to a curated network of investors, and a demo day to present your progress. AIC-Pinnacle has incubated over 200 startups since 2018 and manages a portfolio valued at over ₹500 crore.',
  array['₹5,000 monthly stipend for selected founders', 'Access to AIC-Pinnacle mentor network (50+ mentors)', 'Weekly live sessions on product, legal, and fundraising', 'Demo Day pitch to 100+ angel investors', 'Certificate of incubation from AIC-Pinnacle', 'Fast-track pathway to AIC-Pinnacle full incubation program'],
  array['Must be at ideation or early prototype stage', 'Founder or co-founding team (max 3 members)', 'At least one technical co-founder preferred', 'Must commit 20+ hours per week to the program', 'Not currently enrolled in another incubation program', 'Indian nationals only'],
  'Submit your application through the official portal at aic-pinnacle.com/emerge. You will be required to fill in a detailed application form covering your idea, market opportunity, and team background. Shortlisted teams will be called for a 20-minute virtual interview. Final selections are announced within 2 weeks of the deadline.',
  'https://www.aic-pinnacle.com/emerge',
  array['EV & Mobility', 'Climate Tech', 'Robotics', 'AI / ML', 'Healthtech', 'Advanced Manufacturing'],
  null, true, true, true
),

-- 2. Startup India Seed Fund Scheme
(
  'startup-india-seed-fund-2026',
  'Startup India Seed Fund Scheme',
  'DPIIT — Department for Promotion of Industry and Internal Trade',
  'grant', 'active', '2026-09-30',
  2000000, 10000000, '₹20L – ₹1Cr', 'Zero equity', 'In-person', 'Ideation / Prototype',
  null, null,
  'Government of India seed funding for early-stage DPIIT-recognised startups. Grants up to ₹20L for proof of concept and loans up to ₹1Cr for market entry.',
  'The Startup India Seed Fund Scheme (SISFS) was launched by DPIIT to provide financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialisation. The scheme operates through DPIIT-approved incubators, which select startups and disburse funds. Startups receive grants of up to ₹20 lakhs for validation and convertible debentures or debt instruments up to ₹50 lakh for market entry.',
  array['Grant up to ₹20 lakhs for proof of concept and prototype', 'Debt/convertible instruments up to ₹50 lakhs for market entry', 'Access to DPIIT-approved incubator ecosystem', 'Mentorship from incubator and DPIIT network', 'Visibility on Startup India portal'],
  array['Must be a DPIIT-recognised startup', 'Incorporated in India as a private limited company or LLP', 'Less than 2 years old at time of application', 'Annual turnover not exceeding ₹100Cr in any previous year', 'Working towards innovation, development, or improvement of products/services'],
  'Applications must be submitted through DPIIT-approved incubators enrolled in the SISFS scheme. Visit the Startup India portal to find approved incubators near you and apply directly through their respective portals.',
  'https://www.startupindia.gov.in/content/sih/en/sisfs.html',
  array['SaaS', 'Fintech', 'Healthtech', 'Agritech', 'Climate Tech', 'Deep Tech', 'AI / ML'],
  null, true, true, true
),

-- 3. BIRAC BIG Grant
(
  'birac-big-grant-cycle-14',
  'BIRAC Biotechnology Ignition Grant (BIG) — Cycle 14',
  'BIRAC — Biotechnology Industry Research Assistance Council',
  'grant', 'active', '2026-07-15',
  5000000, 5000000, '₹50L', 'Zero equity', 'Hybrid', 'Ideation / Prototype',
  '18 months', '20–25 startups',
  'India''s flagship biotech grant of ₹50L for early-stage startups with innovative biotechnology solutions. No equity taken. One of the most prestigious deep-tech grants for Indian founders.',
  'The BIRAC BIG grant is the government''s flagship scheme to provide early-stage financial assistance to biotech startups and entrepreneurs. With ₹50 lakhs in non-dilutive funding over 18 months, BIG supports proof-of-concept research and product development in healthcare, agriculture, industrial biotech, and environmental biotech. BIRAC has funded over 600 startups through BIG since its launch.',
  array['₹50 lakh non-dilutive grant over 18 months', 'Access to BIRAC''s curated mentor network', 'Opportunity to apply for follow-on BIRAC schemes (SBIRI, PACE)', 'Lab space and facilities at empanelled incubators', 'IP support and legal advisory'],
  array['Indian startup (registered as Pvt Ltd, LLP, or Proprietorship)', 'Biotech/life sciences innovation focus', 'Proof of concept not yet demonstrated commercially', 'Annual turnover below ₹25 crore', 'Not previously received BIG grant'],
  'Apply online via the BIRAC portal. Submit the BIG application form with a detailed project proposal, CV of key team members, and a business plan. Applications are reviewed by a Scientific Committee. Shortlisted applicants present before an Expert Committee.',
  'https://birac.nic.in/big.php',
  array['Healthtech', 'Biotech', 'Agritech', 'Climate Tech'],
  null, true, false, true
),

-- 4. DST NIDHI PRAYAS Grant
(
  'dst-nidhi-prayas-2026',
  'DST NIDHI PRAYAS — Promoting and Accelerating Young Innovators',
  'Department of Science and Technology (DST), Govt of India',
  'grant', 'active', '2026-06-15',
  1000000, 1000000, '₹10L', 'Zero equity', 'In-person', 'Ideation / Prototype',
  '6 months', null,
  'DST''s ₹10L grant for early-stage deep-tech innovators to convert ideas into prototypes. Delivered through NIDHI PRAYAS Centres across India. Zero equity, no strings attached.',
  'DST NIDHI (National Initiative for Developing and Harnessing Innovations) runs the PRAYAS scheme to support early-stage innovators and entrepreneurs in converting their ideas into prototypes. The scheme provides ₹10 lakhs to help innovators access lab space, technical expertise, and mentorship at NIDHI PRAYAS Centres (pre-incubators) located at engineering colleges and research institutions across India.',
  array['₹10 lakh grant for prototype development', 'Access to lab equipment and fabrication facilities at PRAYAS centre', 'Technical mentorship from institute faculty', 'IP filing support', 'Pathway to NIDHI Entrepreneurship in Residence (EIR) program'],
  array['Indian nationals only', 'Individual innovators or teams of up to 3 members', 'Innovation must be at idea or early prototype stage', 'Must be willing to work at or near the PRAYAS Centre city'],
  'Applications are accepted through individual NIDHI PRAYAS Centres. Visit the DST-NIDHI portal to find the nearest PRAYAS Centre and submit your application directly through them. Each centre has its own application form and schedule.',
  'https://www.dst.gov.in/nidhi',
  array['Deep Tech', 'Hardware', 'Energy', 'AI / ML', 'Advanced Manufacturing', 'IoT'],
  null, true, false, true
),

-- 5. MeitY SAMRIDH Accelerator
(
  'meity-samridh-accelerator-2026',
  'MeitY SAMRIDH — Software Products Startup Accelerator',
  'MeitY Startup Hub',
  'accelerator', 'active', '2026-05-15',
  4000000, 4000000, '₹40L', 'Zero equity', 'Virtual', 'MVP',
  '6 months', '30 startups',
  'MeitY''s flagship startup accelerator for software product companies, offering ₹40L in non-dilutive funding plus a strong industry mentorship program. Ideal for B2B SaaS and AI startups.',
  'The SAMRIDH (Supporting and Mentoring Innovative Startups for Rising India with Determination and Handholding) accelerator is MeitY''s premier program for software product startups. It provides selected cohort startups with ₹40 lakhs in equity-free funding, 180 days of structured acceleration, access to cloud credits worth $100K, and connections to enterprise customers for pilots.',
  array['₹40 lakh equity-free grant', 'Cloud credits from AWS, Azure, and Google Cloud worth $100K+', 'Access to 150+ industry and investor mentors', 'Enterprise customer connections for pilot projects', 'Global market linkage through international partner programs', 'Certificate of completion from MeitY'],
  array['Incorporated in India as a Pvt Ltd / OPC / LLP', 'Software product or platform company (not services)', 'Must have a working MVP or product', 'Less than 5 years old', 'Annual revenue below ₹25 crore'],
  'Apply via the MeitY Startup Hub portal. Fill in the online application covering product details, traction, team background, and growth plan. Shortlisted startups will be invited for a panel interview before final selection.',
  'https://msh.meity.gov.in/samridh',
  array['SaaS', 'AI / ML', 'IoT', 'Fintech', 'Edtech', 'Cybersecurity'],
  null, true, false, true
),

-- 6. Atal Innovation Mission PRIME
(
  'aim-prime-incubation-2026',
  'AIM PRIME — Program for Researchers on Innovations, Market Readiness and Entrepreneurship',
  'Atal Innovation Mission (NITI Aayog)',
  'incubation', 'active', '2026-08-31',
  null, null, 'Stipend + support', 'Zero equity', 'Hybrid', 'Ideation / Prototype',
  '12 months', '50 researchers',
  'AIM''s incubation program specifically for PhD scholars and researchers looking to commercialise their research. Structured support from idea to market-ready product with a strong policy and industry connect.',
  'AIM PRIME (Program for Researchers on Innovations, Market Readiness and Entrepreneurship) is a 12-month intensive program designed for PhD scholars and researchers from Atal Incubation Centres (AICs) to convert their research into market-ready startups. The program combines entrepreneurship education, mentorship, and access to AIM''s national network of incubators.',
  array['Monthly stipend for the incubation period', 'Access to the AIM mentor network across all 28 states', 'IP support and technology transfer assistance', 'Connections to AIC network for space and equipment', 'Demo day in front of NITI Aayog and investor community', 'Fast-track to AIM follow-on funding programs'],
  array['Must be a PhD scholar or recently graduated PhD', 'Innovation must be based on original research', 'Must be affiliated with or willing to join an Atal Incubation Centre', 'Indian nationals only', 'Not running a commercially operational company at time of application'],
  'Applications open through the AIM portal on the NITI Aayog website. Researchers must submit their research proposal, application form, and letters of recommendation from their PhD supervisor. Shortlisted candidates attend a bootcamp before final selection.',
  'https://aim.gov.in/prime.php',
  array['Deep Tech', 'Healthtech', 'Agritech', 'Energy', 'AI / ML', 'Social Impact'],
  null, true, false, true
),

-- 7. iStart Rajasthan Cohort 5
(
  'istart-rajasthan-cohort-5',
  'iStart Rajasthan — Startup Accelerator Cohort 5',
  'Rajasthan iStart',
  'accelerator', 'active', '2026-05-31',
  500000, 500000, '₹5L', 'Zero equity', 'In-person', 'MVP',
  '4 months', '25 startups',
  'Rajasthan government''s flagship accelerator for startups solving problems specific to Rajasthan and India''s semi-urban heartland. ₹5L grant, office space, and strong government-business connections.',
  'iStart Rajasthan is the state government''s startup accelerator and support program, focused on building startups that can solve the unique challenges faced by Rajasthan — agriculture, water scarcity, rural infrastructure, and tourism. The cohort-based program accepts 25 startups and runs over 4 months out of the iStart office in Jaipur.',
  array['₹5 lakh seed grant', 'Free co-working space at iStart Jaipur office for 6 months', 'Access to Rajasthan government as a potential first customer', 'Mentorship from 40+ industry veterans', 'Media coverage and branding support'],
  array['Registered in Rajasthan (preferred) or willing to set up Rajasthan presence', 'Must have a working MVP', 'Founders must commit to relocating to Jaipur during the program', 'Below 3 years old'],
  'Apply on the iStart Rajasthan portal with your startup details, product video demo, and team information. Shortlisted startups will be called to Jaipur for an in-person pitch.',
  'https://istart.rajasthan.gov.in',
  array['Agritech', 'Water Tech', 'Rural Tech', 'Govtech', 'Tourism Tech', 'Logistics'],
  'Rajasthan', true, false, true
),

-- 8. KSUM TBI Program
(
  'ksum-tbi-program-2026',
  'Kerala Startup Mission — Technology Business Incubation Program',
  'Kerala Startup Mission (KSUM)',
  'incubation', 'active', '2026-09-30',
  null, null, 'Up to ₹15L', 'Zero equity', 'In-person', 'MVP',
  '12–18 months', '40 startups',
  'Kerala''s premier incubation program through its extensive Technology Business Incubator (TBI) network. Access to state-of-the-art labs, strong government support, and KSUM''s international network.',
  'Kerala Startup Mission (KSUM) operates one of India''s largest state-level startup incubation networks through its Technology Business Incubators (TBIs). The TBI program provides startups with office space, funding support, lab access, and connections to Kerala''s strong IT and manufacturing ecosystem. KSUM has incubated over 3,500 startups since its inception.',
  array['Access to KSUM TBI lab and co-working space', 'Funding support up to ₹15 lakh from KSUM and its partners', 'Kerala government procurement opportunities', 'International market linkage through KSUM Global Programs', 'Access to KSUM''s 300+ mentor network'],
  array['Registered in Kerala or willing to establish Kerala presence', 'Must have at least an MVP', 'Technology-driven product or platform', 'Must be below 5 years old'],
  'Apply through the KSUM portal. Select the TBI of your choice from the KSUM network based on your sector and location. Each TBI has its own selection process with interviews and site visits.',
  'https://startupmission.kerala.gov.in',
  array['IT / Software', 'Hardware & IoT', 'Agritech', 'Tourism Tech', 'Fintech', 'Healthtech'],
  'Kerala', true, false, true
),

-- 9. T-Hub Rev Up Accelerator
(
  'thub-rev-up-2026',
  'T-Hub Rev UP Accelerator — Cohort 2026',
  'T-Hub',
  'accelerator', 'active', '2026-06-30',
  null, null, 'Equity-free support', 'Zero equity', 'In-person', 'Revenue Stage',
  '3 months', '20 startups',
  'T-Hub''s flagship accelerator for revenue-stage startups looking to scale. Access to T-Hub''s unparalleled corporate and government network in Hyderabad. Best for B2B startups targeting enterprise customers.',
  'T-Hub Rev UP is designed for startups that have demonstrated product-market fit and are ready to scale. Unlike early-stage programs, Rev UP focuses on GTM strategy, enterprise sales, and international expansion. T-Hub is India''s largest startup hub with partnerships with over 200 corporates and government bodies.',
  array['3 months residency at T-Hub, Hyderabad (Raidurgam campus)', 'Introductions to T-Hub''s corporate partner network for pilot/procurement', 'Access to T-Hub''s global network in Singapore, US, and Israel', 'PR and media connections through T-Hub''s communications team', 'Investor connections for Series A and above'],
  array['Must have at least ₹50L annual recurring revenue', 'B2B or B2G focus preferred', 'Must be willing to base a key founder /team in Hyderabad during the program', 'Registered as an Indian company'],
  'Apply on the T-Hub website. Submit your company financials, pitch deck, and customer references. Top applicants are invited to a Hyderabad pitch day for final selection.',
  'https://t-hub.co/programs/rev-up',
  array['Deep Tech', 'AI / ML', 'Healthtech', 'Fintech', 'Enterprise SaaS', 'Govtech'],
  'Telangana', true, true, true
),

-- 10. CIIE.CO Bharat Inclusion Initiative
(
  'ciie-bharat-inclusion-2026',
  'CIIE.CO Bharat Inclusion Initiative — Cohort 6',
  'CIIE.CO (IIM Ahmedabad)',
  'accelerator', 'active', '2026-07-31',
  null, null, 'Grant + Investment',  '5% equity', 'In-person', 'MVP',
  '6 months', '12 startups',
  'IIM Ahmedabad''s prestigious accelerator for startups focused on financial and social inclusion for India''s next half-billion. 6-month program with seed investment and deep IIM Ahmedabad ecosystem access.',
  'The Bharat Inclusion Initiative (BII) by CIIE.CO is a specialized accelerator focused on building startups that serve the bottom-of-the-pyramid and next-billion-user segments in India. Backed by IIM Ahmedabad and partners like Michael & Susan Dell Foundation, BII has supported 60+ startups across fintech, agritech, edtech, and healthcare for underserved segments.',
  array['Seed investment of up to ₹50 lakh from BII fund', 'Access to IIM Ahmedabad faculty and alumni network (85,000+ alumni)', 'Research support from CIIE.CO''s inclusion research lab', 'Connections to impact investors and DFIs (IFC, ADB, etc.)', 'Campus residency at IIM Ahmedabad, Ahmedabad'],
  array['Focus on financial inclusion, agricultural value chain, or social sectors', 'Must have demonstrated early traction with target user segment', 'Team of at least 2 founders', 'Willing to accept 5% equity for investment'],
  'Submit a detailed application on the CIIE.CO website including a 3-min video pitch, your deck, and user evidence. Shortlisted teams will be invited to IIM Ahmedabad for final interviews.',
  'https://ciie.co/bii',
  array['Fintech', 'Agritech', 'Edtech', 'Healthtech', 'Rural Tech', 'Social Impact'],
  'Gujarat', true, true, true
),

-- 11. 100X.VC YOLO Fund
(
  '100x-yolo-fund-2026',
  '100X.VC YOLO Fund — Cohort 13',
  '100X.VC',
  'funding', 'active', '2026-12-31',
  1000000, 5000000, '₹10L – ₹50L', '1.0% equity (SAFE)', 'Virtual', 'Ideation / Prototype',
  null, '100+ startups',
  'India''s most active early-stage fund deploying ₹10L–₹50L via iSAFE (India Simple Agreement for Future Equity). No pitch required — just apply online. Hundreds of startups funded per cohort.',
  '100X.VC is India''s most active seed fund, investing in 100+ startups per year through its rolling YOLO (You Only Live Once) fund via iSAFE notes. The fund focuses on the earliest possible stage — often just an idea and a strong team. 100X.VC portfolio includes 900+ companies as of 2026.',
  array['₹10L–₹50L investment via iSAFE note', 'Access to 100X.VC portfolio network of 900+ startups', 'Monthly founder masterclasses', 'Demo Day to 1000+ investors', 'Warm introductions to follow-on investors'],
  array['Indian startup (any sector)', 'Idea to early traction stage', 'Founders must be based in India', 'No revenue requirement'],
  'Apply entirely online at 100x.vc. Fill in the application with your idea, team background, and market opportunity. No pitch deck or deck required. Decisions are made within 2 weeks.',
  'https://100x.vc/apply',
  array['SaaS', 'Fintech', 'Consumer', 'AI / ML', 'Deep Tech', 'Healthtech', 'Edtech'],
  null, true, false, true
),

-- 12. Villgro Social Innovation Grant
(
  'villgro-social-innovation-grant-2026',
  'Villgro Social Innovation Grant 2026',
  'Villgro Innovations Foundation',
  'grant', 'active', '2026-08-15',
  2500000, 2500000, '₹25L', 'Zero equity', 'Hybrid', 'MVP',
  '12 months', '8–10 startups',
  'Villgro''s flagship grant for startups creating measurable impact in healthcare, agriculture, and clean energy for India''s rural and peri-urban communities. ₹25L in non-dilutive funding.',
  'Villgro is one of India''s oldest and most respected social enterprise incubators, having supported 300+ social enterprises since 2001. The Social Innovation Grant targets startups at the intersection of social impact and commercial viability, specifically in healthcare, agriculture, and energy, with a focus on last-mile delivery in rural and semi-urban areas.',
  array['₹25 lakh non-dilutive grant', 'Access to Villgro''s impact investor network', '12 months of hands-on incubation support', 'Impact measurement support and tools', 'Introductions to healthcare, agri, and energy sector corporates for pilot programs'],
  array['Must have a working product and initial traction', 'Demonstrable social impact — must serve BOP or rural users', 'Focus on healthcare, agriculture, or clean energy', 'Annual revenue below ₹5Cr', 'Team of at least 2 founders'],
  'Fill in the Villgro application form on their website. Submit your impact data, pilot results, and business model details. Shortlisted startups will be invited for an in-person interview at Villgro''s offices.',
  'https://villgro.org/apply',
  array['Healthtech', 'Agritech', 'Clean Energy', 'Rural Tech', 'Social Impact'],
  null, true, false, true
),

-- 13. Google for Startups Accelerator India
(
  'google-startups-accelerator-india-2026',
  'Google for Startups Accelerator India — Class 2026',
  'Google India',
  'accelerator', 'active', '2026-06-01',
  null, null, 'Equity-free + Cloud credits', 'Zero equity', 'In-person', 'Revenue Stage',
  '3 months', '15 startups',
  'Google''s prestigious global accelerator program for Indian AI-first startups. Equity-free with up to $200K in Google Cloud credits, direct access to Google engineers, and global network connections.',
  'Google for Startups Accelerator India is part of Google''s global accelerator network, focused specifically on AI-first and AI-forward startups from the Indian subcontinent. Each cohort gets 3 months of intensive support including technical mentorship from Google engineers, product strategy sessions, and global market access.',
  array['Up to $200,000 in Google Cloud credits', 'Direct mentorship from Google engineers, PMs, and market experts', 'Access to Google''s customer and partner network across APAC and globally', 'PR coverage and speaking opportunities at Google events (Google for Startups Demo Day)', 'Access to Google Workspace and other Google tools at no cost'],
  array['Must be an AI-first startup (AI at the core of your product, not just a feature)', 'Must have a launched product with early traction', 'Based in India', 'Pre-Series B stage'],
  'Apply on the Google for Startups website. Applications require a video pitch, company details, and a technical overview of how AI is used in your product. Shortlisted startups are invited for interviews with the Google team.',
  'https://startup.google.com/accelerator/india/',
  array['AI / ML', 'SaaS', 'Healthtech', 'Edtech', 'Consumer', 'Deep Tech'],
  null, true, true, true
),

-- 14. AWS Activate Founders
(
  'aws-activate-founders-2026',
  'AWS Activate Founders Program 2026',
  'Amazon Web Services (AWS)',
  'grant', 'active', '2026-12-31',
  null, null, '$5,000 in AWS Credits', 'Zero equity', 'Virtual', 'Ideation / Prototype',
  null, null,
  'Rolling program giving early-stage startups $5,000 in AWS credits, developer support, and training for free. Apply anytime, get access quickly. Ideal for any tech startup building on cloud infrastructure.',
  'AWS Activate Founders is AWS''s global program for early-stage startups, available on a rolling basis throughout the year. It provides cloud credits, technical support, and training resources at no cost to help founders build and scale on AWS infrastructure. It is particularly valuable for startups with high cloud computing needs in their early stages.',
  array['$5,000 in AWS credits valid for 2 years', '1 year of AWS Developer Support (worth $29/month)', 'Access to 80+ hours of AWS training', 'Access to AWS Activate portal with startup deals and partner offers'],
  array['Startup must be less than 10 years old', 'Must not have previously received AWS Activate credits at the Founders tier', 'Must be working on a commercial product (not a personal project)', 'No revenue requirements'],
  'Apply online at the AWS Activate website. The application is simple — fill in your company details and describe your use of AWS. Decisions are typically made within 1–2 weeks.',
  'https://aws.amazon.com/activate/',
  array['SaaS', 'Deep Tech', 'IoT', 'AI / ML', 'Fintech', 'Healthtech', 'Consumer'],
  null, false, false, true
),

-- 15. Sequoia Spark
(
  'sequoia-spark-2026',
  'Sequoia Spark — Grants for Women-Led Startups',
  'Sequoia Capital India',
  'grant', 'active', '2026-10-31',
  2000000, 2000000, '₹20L', 'Zero equity', 'Virtual', 'Ideation / Prototype',
  null, '10 founders',
  'Sequoia Capital''s non-dilutive grant program for women founders at the idea or early prototype stage. ₹20L to explore your idea full-time plus access to Sequoia''s unmatched investor and operator network.',
  'Sequoia Spark is Sequoia Capital India''s grant program for women entrepreneurs at the earliest stage of their startup journey. The program provides ₹20 lakh in non-dilutive funding to allow women founders to explore their idea full-time without taking equity, along with access to Sequoia''s global network of founders, investors, and operators.',
  array['₹20 lakh non-dilutive grant (no equity taken)', 'Access to Sequoia India and global founder network', 'Mentorship from Sequoia partners and portfolio founders', 'Office hours with Sequoia operating team', 'Potential fast-track to Sequoia investment consideration'],
  array['Must be a woman founder or have a woman co-founder as primary applicant', 'Idea to early prototype stage (no product traction required)', 'Based in India', 'Not previously backed by a VC fund'],
  'Apply via the Sequoia India website. A short application with your idea description, market opportunity, and founder background. No deck required at application stage.',
  'https://www.sequoiacap.com/india/path/spark/',
  array['SaaS', 'Consumer', 'Deep Tech', 'Fintech', 'Healthtech', 'Social Impact'],
  null, true, true, true
),

-- 16. Accel Atoms
(
  'accel-atoms-pre-seed-2026',
  'Accel Atoms — Pre-Seed Program 2026',
  'Accel Partners India',
  'seed', 'active', '2026-09-15',
  5000000, 10000000, '$60K–$120K USD', '7–10% equity', 'In-person', 'Ideation / Prototype',
  '3 months', '10 startups',
  'Accel''s pre-seed program for exceptional founding teams at the earliest stage. Investment of $60K–$120K for 7–10% equity with direct access to Accel''s portfolio, LP base, and global platform.',
  'Accel Atoms is Accel Partners'' pre-seed program targeting exceptional founding teams at the inception stage. Backed by one of the world''s most successful venture funds (early backer of Facebook, Dropbox, Slack), Atoms gives founders direct access to Accel''s global network, LP relationships, and operational expertise from day one.',
  array['$60K–$120K USD investment (7–10% equity)', 'Access to Accel''s global portfolio network of 400+ companies', 'Direct introductions to Accel''s LP base (family offices, strategics)', 'Weekly sessions with Accel partners on strategy and fundraising', 'Residency at Accel India office in Bangalore'],
  array['Exceptional founding team (demonstrated by prior startups, research, or deep domain expertise)', 'Idea or early prototype stage', 'Willing to relocate to Bangalore for the 3-month program', 'Must accept 7–10% equity for investment'],
  'Submit a brief application at atoms.accel.com covering your idea, team background, and why Accel. Top applicants will be invited for a partner interview at the Accel Bangalore office.',
  'https://atoms.accel.com',
  array['SaaS', 'Deep Tech', 'Fintech', 'Consumer', 'AI / ML'],
  'Karnataka', true, true, true
),

-- 17. NASSCOM Deep Tech Club
(
  'nasscom-deep-tech-club-2026',
  'NASSCOM Deep Tech Club Incubation Program 2026',
  'NASSCOM CoE — IoT & AI',
  'incubation', 'active', '2026-07-01',
  null, null, 'Equity-free support', 'Zero equity', 'In-person', 'MVP',
  '12 months', '30 startups',
  'NASSCOM''s incubation program for deep-tech startups building with AI, IoT, AR/VR, and blockchain. Access to NASSCOM''s corporate network of 3,000+ tech companies and global go-to-market support.',
  'NASSCOM CoE (Centre of Excellence) for IoT & AI offers its Deep Tech Club incubation to startups that are building technology-first products in AI, IoT, AR/VR, and related areas. The program is India''s largest corporate-connected incubation for deep-tech, giving startups access to NASSCOM''s network of 3,000+ member companies as potential customers and partners.',
  array['12 months of incubation at NASSCOM CoE, Bengaluru/Hyderabad', 'Introductions to NASSCOM member companies for pilots and procurement', 'International market exposure through NASSCOM''s global programs', 'Cloud credits from AWS, Azure, Google Cloud', 'Hackathon and business challenge victories as a pathway to larger opportunities'],
  array['Deep-tech focus: AI, IoT, AR/VR, blockchain, or advanced robotics', 'Must have a working MVP or technical prototype', 'India-registered company', 'Below 5 years old'],
  'Apply on the NASSCOM CoE website. Submit your technology demo, deck, and team details. Shortlisted startups attend a virtual interview with the NASSCOM selection panel.',
  'https://nasscom.in/coe',
  array['AI / ML', 'IoT', 'AR / VR', 'Blockchain', 'Robotics', 'Industry 4.0'],
  null, true, false, true
),

-- 18. Wadhwani Foundation Startup Ignite
(
  'wadhwani-startup-ignite-2026',
  'Wadhwani Foundation Startup Ignite Program 2026',
  'Wadhwani Foundation',
  'incubation', 'active', '2026-08-01',
  null, null, 'Stipend + support', 'Zero equity', 'Virtual', 'Ideation / Prototype',
  '9 months', '20 startups',
  'Wadhwani Foundation''s startup incubation program for social-sector startups addressing India''s most pressing challenges in health, education, and agriculture. Equity-free with a monthly stipend.',
  'The Wadhwani Foundation Startup Ignite program is designed for founders committed to creating large-scale impact in India''s most underserved sectors. The 9-month program runs virtually with monthly in-person immersions and is free of cost including a living stipend for participating founders. Wadhwani Foundation is backed by Silicon Valley entrepreneur Romesh Wadhwani and has a global network of 500+ angel investors.',
  array['Monthly living stipend for founding team during the program', 'Access to Wadhwani Foundation''s global network of 500+ investors', 'Dedicated program manager for each startup', 'Legal, accounting, and IP support at no cost', 'International immersion trip (Singapore or US) for top performers'],
  array['Startup addressing healthcare, education, or agricultural challenges in India', 'Must have a clear impact thesis and early validation', 'Founders must commit full-time to the program', 'Not yet venture-backed'],
  'Apply via the Wadhwani Foundation website. The application includes a written submission and a 5-minute video pitch explaining your problem, solution, and impact thesis.',
  'https://wadhwanifoundation.org/startup-ignite/',
  array['Healthtech', 'Edtech', 'Agritech', 'Social Impact', 'Rural Tech'],
  null, true, false, true
),

-- 19. SIDBI SPEED Program
(
  'sidbi-speed-program-2026',
  'SIDBI SPEED — Startup Program for Economic Empowerment and Development',
  'SIDBI — Small Industries Development Bank of India',
  'grant', 'active', '2026-06-30',
  1000000, 5000000, '₹10L – ₹50L', 'Zero equity', 'Hybrid', 'MVP',
  null, null,
  'SIDBI''s non-dilutive grant and soft loan program for startups in manufacturing, exports, and value chain innovation. Especially strong for hardware startups and those in Tier 2/3 cities.',
  'SIDBI SPEED (Startup Program for Economic Empowerment and Development) provides financial and non-financial support to startups in the manufacturing, MSME ecosystem, and export-oriented sectors. SIDBI has a pan-India network and particular strength in Tier 2 and Tier 3 cities. Funding includes both non-dilutive grants and soft loans at concessional rates.',
  array['Non-dilutive grant up to ₹10 lakh for early-stage startups', 'Soft loan up to ₹50 lakh at concessional interest rates', 'Connections to SIDBI''s MSME customer and partner network', 'Access to SIDBI-affiliated incubators across India', 'Market linkage support for export-ready products'],
  array['Registered Indian startup (Pvt Ltd, OPC, or LLP)', 'Focus on manufacturing, MSME services, or export sector', 'Demonstrable product or service with first customers', 'Annual revenue below ₹25Cr'],
  'Apply through SIDBI SPEED portal or through any SIDBI branch office. Submit business plan, financials, and product documentation. Applications are reviewed within 45 days.',
  'https://www.sidbi.in/en/startups',
  array['Manufacturing', 'MSME Tech', 'Fintech', 'Agritech', 'Clean Energy', 'Logistics'],
  null, true, false, true
),

-- 20. WEH Ventures Women in Tech Grant
(
  'weh-ventures-women-tech-grant-2026',
  'WEH Ventures Women in Tech Grant 2026',
  'WEH Ventures',
  'grant', 'active', '2026-09-30',
  500000, 500000, '₹5L', 'Zero equity', 'Virtual', 'Ideation / Prototype',
  null, '20 founders',
  'WEH Ventures'' non-dilutive grant specifically for women founders building technology companies in India. ₹5L to accelerate your idea plus access to WEH''s mentorship and investor network.',
  'WEH Ventures is India''s leading VC fund focused on women-led startups. The WEH Women in Tech Grant provides ₹5 lakh in non-dilutive funding to women founders at the earliest stage, along with mentorship and network access. The program is open to any sector as long as the founding team is led by a woman founder.',
  array['₹5 lakh non-dilutive grant', 'Access to WEH Ventures investor network', 'Mentorship from WEH portfolio founders', 'Introductions to female founder communities across India'],
  array['Must be led by a woman founder (primary or co-founder)', 'Technology-enabled startup', 'Idea to early prototype stage', 'Based in India'],
  'Apply via the WEH Ventures website. Simple application form covering your idea and team background. No deck required.',
  'https://weh.vc/women-in-tech-grant',
  array['SaaS', 'Fintech', 'Consumer', 'Edtech', 'Healthtech'],
  null, true, false, true
),

-- 21. Gujarat Innovation Society Grant
(
  'gujarat-innovation-society-grant-2026',
  'Gujarat Innovation Society Startup Grant 2026',
  'Gujarat Innovation Society (i-Hub)',
  'grant', 'active', '2026-07-15',
  500000, 2000000, '₹5L – ₹20L', 'Zero equity', 'In-person', 'MVP',
  null, null,
  'Gujarat state government''s startup grant for startups in manufacturing, clean energy, and agritech. Strong state infrastructure support and procurement opportunities through Gujarat government departments.',
  'Gujarat Innovation Society under i-Hub provides startup grants to companies operating in or willing to set up operations in Gujarat. The program offers ₹5L to ₹20L in non-dilutive funding and connects grantees with Gujarat state government departments as potential early customers for B2G startups.',
  array['Non-dilutive grant of ₹5L–₹20L based on stage', 'Gujarat government procurement opportunities (B2G sales support)', 'Office space at i-Hub, Ahmedabad', 'Connections to Gujarat''s large manufacturing and pharma industry'],
  array['Registered company in Gujarat or willing to establish Gujarat presence', 'Focus on manufacturing, clean energy, or agritech (preferred sectors)', 'Must have an MVP', 'Below 5 years old'],
  'Apply at the i-Hub Gujarat portal with your company documents, product demo, and brief business plan. Shortlisted startups attend in-person pitch in Ahmedabad.',
  'https://ihub.gujarat.gov.in',
  array['Manufacturing', 'Clean Energy', 'Agritech', 'Pharma Tech', 'Govtech'],
  'Gujarat', true, false, true
),

-- 22. Startup Mahakumbh Innovation Contest
(
  'startup-mahakumbh-innovation-contest-2026',
  'Startup Mahakumbh Innovation Challenge 2026',
  'Startup Mahakumbh (DPIIT + Industry Partners)',
  'contest', 'active', '2026-04-30',
  1000000, 5000000, '₹10L – ₹50L (prize money)', 'Zero equity', 'In-person', 'MVP',
  null, null,
  'India''s largest startup exhibition and innovation contest, co-hosted by DPIIT. Cash prizes up to ₹50L and massive media and investor visibility for 3,000+ startups at a single event. A must-attend.',
  'Startup Mahakumbh is India''s largest startup festival, bringing together 3,000+ startups, 1,000+ investors, and 300+ corporates over 3 days in Delhi. The Innovation Challenge is the competition track where startups pitch for cash prizes across 10 sector categories. Even without winning, the event offers unmatched visibility and networking.',
  array['Cash prizes of ₹10L–₹50L per sector winner', 'National media coverage (print, digital, TV)', 'Access to 1,000+ investors in one venue', 'Exhibition booth at the event (free for challengers)', 'Potential meeting with DPIIT and ministry officials'],
  array['Any DPIIT-recognised startup or unrecognised startup building an innovative product', 'Must have a working demo (prototype or MVP)', 'All sectors welcome', 'Indian startup'],
  'Register on the Startup Mahakumbh portal. Select your sector category and submit your startup profile and product demo video. Shortlisted startups get a free booth at the event and compete in the Innovation Challenge.',
  'https://startupmahakumbh.org/innovation-challenge',
  array['SaaS', 'Deep Tech', 'Healthtech', 'Agritech', 'Fintech', 'Clean Energy', 'AI / ML', 'Consumer'],
  null, true, false, true
);


-- ============================================================
-- ADS — Sample ad records
-- ============================================================

insert into public.ads (
  advertiser, headline, subtext, cta_text, cta_url,
  icon_emoji, format, placement, slot_index, priority, is_active
) values

-- Notion ad (from spec §13.2)
(
  'Notion',
  'Notion Business + AI — 3 months free',
  'Docs, wikis, and your team''s knowledge base in one place. Exclusive for founders.',
  'Claim free credits',
  'https://notion.so/startups?ref=grantsindia',
  '📝',
  'card-sm',
  array['listing-grid', 'detail-sidebar'],
  6,
  1,
  true
),

-- GrantsIndia Newsletter house ad (from spec §13.3 — always shown)
(
  'GrantsIndia',
  'India''s best grants, every week in your inbox',
  'Join 12,000+ founders who use GrantsIndia to track deadlines.',
  'Subscribe free',
  '/newsletter',
  '✉️',
  'newsletter',
  array['listing-grid'],
  20,
  0,
  true
);
