import { supabase } from "@/lib/supabase";

const DEFAULT_TEXT = "Get each new post by email. Sign up once; unsubscribe any time.";
const DEFAULT_FREQUENCY = "Every other Friday, when a new post is published.";

type Settings = { url: string; text: string; frequency: string };

// Newsletter box on the blog. Hidden until a valid https:// sign-up link is saved in /admin.
export default async function Newsletter() {
  const { data, error } = await supabase
    .from("newsletter")
    .select("url, text, frequency")
    .eq("id", 1)
    .maybeSingle<Settings>();

  const url = !error && data?.url && /^https:\/\/\S+$/.test(data.url) ? data.url : null;
  if (!url) return null;

  return (
    <section className="newsletter">
      <p className="mono-label">Newsletter</p>
      <h3>Get new posts by email</h3>
      <p>{data?.text || DEFAULT_TEXT}</p>
      <p className="mono-label">{data?.frequency || DEFAULT_FREQUENCY}</p>
      <a className="btn" href={url} target="_blank" rel="noopener noreferrer">
        Subscribe
      </a>
    </section>
  );
}
