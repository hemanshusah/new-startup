# Mentor Connect — Progress Tracker

## Completed Sprints

### Sprint 1 — Foundation & Toggle ✅
- [x] Create `src/app/(mentor-connect)/` route group
- [x] Supabase migration: add `mentor_connect_enabled` to `site_config`
- [x] Update middleware to enforce toggle
- [x] Build Coming Soon page
- [x] Update Navbar + Footer for conditional display
- [x] Add Admin toggle UI (`/admin/mentor-connect/settings`)
- [x] Supabase migration `018_mentor_connect.sql` (8 tables + RLS)

### Sprint 2 — Mentor Profiles & Directory ✅
- [x] Build Mentor Directory (`/mentor-connect/mentors`)
- [x] Build Mentor Profile page (`/mentor-connect/mentors/[slug]`)
- [x] Build Mentor Application Form (`/mentor-connect/apply`)
- [x] Build Homepage (`/mentor-connect`)
- [x] Build How It Works page
- [x] Build `/profile` tabbed layout for Saved Mentors
- [x] Seed test mentor profiles

---

## Upcoming Sprints

### Sprint 3 — Google Calendar Integration ✅
- [x] Build Google OAuth 2.0 connect flow
- [x] Store encrypted tokens in `mentor_profiles`
- [x] Build token refresh middleware
- [x] Build `freebusy` availability checker
- [x] Build availability management page (`/mentor/availability`)
- [x] Build Step 1 of booking flow (Slot Picker)

### Sprint 4 — Booking Flow & Payments 🚧
- [ ] Build Step 2: session brief form
- [ ] Build Step 3: Razorpay checkout
- [ ] Build Step 4: Confirmation with Meet link
- [ ] Implement Razorpay Webhook handler
- [ ] Implement `createSessionEvent()` for Calendar events
- [ ] Implement email confirmations

### Sprint 5 — Mentor Dashboard & Payouts
- [ ] Build Mentor Dashboard home
- [ ] Build Mentor Session management
- [ ] Build Mentor Earnings & bank account details
- [ ] Implement reminder emails & no-show detection
- [ ] Implement weekly payout cron job

### Sprint 6 — Group Sessions & Polish
- [ ] Build Group Session creation & directory
- [ ] Implement seat cap & booking
- [ ] Mobile responsiveness audit
- [ ] Performance optimization (LCP < 2.5s)
- [ ] End-to-end flow verification
