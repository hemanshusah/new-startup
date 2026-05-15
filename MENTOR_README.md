# Mentor Connect — Documentation

## Overview
Mentor Connect is a vetted mentorship marketplace integrated into the GrantsHub India platform. It allows founders to book 1:1 and group sessions with verified experts in fintech, grants, regulatory compliance, and cross-border expansion.

## Key Features
- **Admin-Toggled Architecture**: The entire product can be enabled or disabled via a single toggle in the admin settings.
- **Vetted Mentors**: Every mentor undergoes an application and manual review process.
- **Dynamic Directory**: Searchable and filterable grid of experts with pricing and ratings.
- **Rich Profiles**: Deep profiles with bio, expertise tags, companies, and embedded video intros.
- **Integrated Booking**: Slot picking, session briefs, and payments via Razorpay.
- **Google Calendar Sync**: Automated meeting generation and calendar management.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), Vanilla CSS, Framer Motion.
- **Backend**: Supabase (Auth, DB, Realtime).
- **Integrations**: Razorpay (Payments/Payouts), Google Calendar API (OAuth 2.0).

## Routing
- `/mentor-connect`: Landing page.
- `/mentor-connect/mentors`: Directory.
- `/mentor-connect/mentors/[slug]`: Profile pages.
- `/mentor-connect/apply`: Mentor application form.
- `/profile/saved-mentors`: Founder bookmarks (integrated into main dashboard).

## Development Guidelines
- **Product Isolation**: Use the `(mentor-connect)` route group to keep logic separate from Grants and School.
- **Security**: Token encryption for Google OAuth is handled at the application layer using Node.js `crypto`.
- **Styling**: Adhere to the core design system tokens (`--ink`, `--cream`, `--accent`).

## Testing & Local Development
To test the mentor dashboard locally:
1.  **Run the Seed Script**: Run `supabase/migrations/seed_mentors.sql` in your Supabase SQL Editor.
2.  **Login**: Use one of the test accounts:
    *   **Email**: `priya.sharma.test@example.com`
    *   **Password**: `password123`
3.  **Dashboard**: Once logged in, navigate to `/mentor/availability`.
