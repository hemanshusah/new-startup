# CAUTION: Auth.js Migration

This branch contains a major architectural migration from **Supabase Auth** to **Auth.js (NextAuth)**. 

### Why this change was made:
- To enable custom domain branding on the Google OAuth screen for free.
- To use an open-source authentication library that runs on your own server.

### ⚠️ How to Revert
If you decide to go back to the original Supabase Auth setup:

1. **Delete Files**:
   - `src/auth.ts`
   - `src/app/api/auth/[...nextauth]/route.ts`
   - `src/components/auth/auth-actions.ts`
   - `src/components/auth/auth-register.ts`

2. **Revert Changes in these files**:
   - `src/components/auth/AuthProvider.tsx`: Re-enable Supabase listeners.
   - `src/components/auth/AuthModal.tsx`: Re-enable `supabase.auth` handlers.
   - `src/proxy.ts`: Re-enable `updateSession` from Supabase middleware.
   - `src/app/admin/layout.tsx` and `src/app/profile/page.tsx`: Use `supabase.auth.getUser()`.

3. **Check package.json**: 
   - You can keep `next-auth` installed, but the app should no longer import from it.

### Current Requirements
For this branch to work, you MUST have these in `.env.local`:
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
