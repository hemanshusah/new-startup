-- seed_mentors.sql
-- Run this in Supabase SQL editor to add test mentors.

-- 1. Create dummy users in auth.users (Password: password123)
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES
('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'priya.sharma.test@example.com', '$2a$10$7E.A..q.G.S.v.U.r.y.V.O.u.i.L.y.v.S.e.X.O.S.O.S.O.S.O.S.O.S.O.S.', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Sharma"}', NOW(), NOW(), '', '', '', ''),
('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'arjun.mehta.test@example.com', '$2a$10$7E.A..q.G.S.v.U.r.y.V.O.u.i.L.y.v.S.e.X.O.S.O.S.O.S.O.S.O.S.O.S.', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Arjun Mehta"}', NOW(), NOW(), '', '', '', ''),
('33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'sarah.jones.test@example.com', '$2a$10$7E.A..q.G.S.v.U.r.y.V.O.u.i.L.y.v.S.e.X.O.S.O.S.O.S.O.S.O.S.O.S.', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Jones"}', NOW(), NOW(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 2. Create public.profiles
INSERT INTO public.profiles (id, email, full_name, role)
VALUES
('11111111-1111-1111-1111-111111111111', 'priya.sharma.test@example.com', 'Priya Sharma', 'user'),
('22222222-2222-2222-2222-222222222222', 'arjun.mehta.test@example.com', 'Arjun Mehta', 'user'),
('33333333-3333-3333-3333-333333333333', 'sarah.jones.test@example.com', 'Sarah Jones', 'user')
ON CONFLICT (id) DO NOTHING;

-- 3. Create mentor profiles
INSERT INTO public.mentor_profiles (
  user_id, slug, status, verification_tier, display_name, headline, bio,
  avatar_url, languages, timezone, location_city, location_country,
  linkedin_url, expertise_areas, markets_covered, industries, years_experience,
  notable_companies, is_featured
)
VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'priya-sharma-fintech',
  'active',
  'verified',
  'Priya Sharma',
  'Ex-Stripe India Head | Scaling Fintech & Cross-border Compliance',
  'I have spent the last 10 years scaling fintech products across India and SEA. At Stripe, I led the India market entry, navigating complex RBI regulations and setting up the initial GTM strategy. I help founders structure their cross-border payments, understand regulatory grey areas, and optimize their payment flows.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
  ARRAY['English', 'Hindi'],
  'Asia/Kolkata',
  'Bangalore',
  'India',
  'https://linkedin.com/in/test-priya',
  ARRAY['Market Entry', 'Regulatory Compliance', 'Fintech'],
  ARRAY['India', 'Singapore'],
  ARRAY['Fintech', 'SaaS'],
  10,
  ARRAY['Stripe', 'Razorpay'],
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'arjun-mehta-grants',
  'active',
  'credential_verified',
  'Arjun Mehta',
  'Secured ₹5Cr+ in Govt Grants | BIRAC & Startup India Expert',
  'Navigating government grants is a full-time job. Having secured multiple rounds of non-dilutive funding from BIRAC, MeitY, and Startup India Seed Fund for my own deeptech startup, I now help other founders build a grant strategy. From proposal writing to compliance reporting, I can save you hundreds of hours.',
  'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=200&auto=format&fit=crop',
  ARRAY['English'],
  'Asia/Kolkata',
  'Delhi',
  'India',
  'https://linkedin.com/in/test-arjun',
  ARRAY['Grant Navigation', 'Pitch Deck Review'],
  ARRAY['India'],
  ARRAY['Deeptech', 'Cleantech'],
  8,
  ARRAY['Startup India', 'BIRAC'],
  true
),
(
  '33333333-3333-3333-3333-333333333333',
  'sarah-jones-us-expansion',
  'active',
  'community',
  'Sarah Jones',
  'US Expansion Specialist for SaaS | Delaware Flip & YC Prep',
  'I help Indian SaaS startups expand to the US. From structuring the Delaware C-Corp flip to preparing for Y Combinator interviews, I have guided over 40 startups in their US GTM motion.',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
  ARRAY['English'],
  'America/Los_Angeles',
  'San Francisco',
  'USA',
  'https://linkedin.com/in/test-sarah',
  ARRAY['US Expansion', 'YC Prep'],
  ARRAY['USA', 'India'],
  ARRAY['SaaS', 'B2B'],
  12,
  ARRAY['Y Combinator', 'Stripe Atlas'],
  false
)
ON CONFLICT (slug) DO NOTHING;

-- 4. Create session types
INSERT INTO public.session_types (mentor_id, name, tier, duration_minutes, price_inr, description, is_active)
SELECT id, 'Compliance Strategy Call', 'expert', 45, 8000, 'A deep dive into fintech compliance strategy and regulatory roadblocks.', true
FROM public.mentor_profiles WHERE slug = 'priya-sharma-fintech'
ON CONFLICT DO NOTHING;

INSERT INTO public.session_types (mentor_id, name, tier, duration_minutes, price_inr, description, is_active)
SELECT id, 'Grant Proposal Review', 'standard', 30, 3000, 'Send me the proposal 48hrs before the call. I will review it and give actionable feedback.', true
FROM public.mentor_profiles WHERE slug = 'arjun-mehta-grants'
ON CONFLICT DO NOTHING;

INSERT INTO public.session_types (mentor_id, name, tier, duration_minutes, price_inr, description, is_active)
SELECT id, 'YC Mock Interview', 'advisory', 45, 12000, 'A grueling 15-min mock interview followed by 30 mins of feedback to perfect the pitch.', true
FROM public.mentor_profiles WHERE slug = 'sarah-jones-us-expansion'
ON CONFLICT DO NOTHING;
