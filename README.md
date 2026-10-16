# zeynepoykuerdem_portfolio

Personal site for Öykü Erdem. Next.js on Vercel, with Supabase for content and images.

Live at **https://zeynepoykuerdem.dev**

## Setup

1. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor. For a database set up from an older `schema.sql`, run the files in `supabase/migrations/` in order instead.
2. Copy `.env.example` to `.env.local` and fill in the Project URL and the anon (publishable) key from Supabase → Settings → API.
3. `npm install`, then `npm run dev`.

## Deploy

Import this repository in Vercel and add the same two variables, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, under Environment Variables.

### Custom domain

The domain `zeynepoykuerdem.dev` is registered at Cloudflare and points to Vercel

## Admin

Admin access is granted per user in the `admins` table. Add your user id after your first sign-in. Never commit the `service_role` key.

