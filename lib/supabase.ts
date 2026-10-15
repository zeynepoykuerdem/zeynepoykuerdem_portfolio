import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local or Vercel."
  );
}

// The anon (publishable) key is safe in the browser. Row-level security decides what it can read and write.
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
