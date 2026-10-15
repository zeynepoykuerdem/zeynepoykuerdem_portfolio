import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY. Add them to .env.local or Vercel."
  );
}

// Used only by server-rendered pages, so the key never reaches the browser.
// Row-level security still decides what it can read and write.
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
