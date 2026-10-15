# zeynepoykuerdem_portfolio

Personal site for Öykü Erdem. Next.js on Vercel, with Supabase for content and images.

## Setup

1. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor.
2. Copy `.env.example` to `.env.local` and fill in the Project URL and the anon (publishable) key from Supabase → Settings → API.
3. `npm install`, then `npm run dev`.

## Deploy

Import this repository in Vercel and add the same two variables, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, under Environment Variables.

## Admin

Admin access is granted per user in the `admins` table. Add your user id after your first sign-in. Never commit the `service_role` key.

