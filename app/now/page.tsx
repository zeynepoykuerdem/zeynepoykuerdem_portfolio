import { supabase } from "@/lib/supabase";
import { shortDate } from "@/lib/format";

export const revalidate = 60;

const DEFAULT_BODY = "Nothing posted yet. This page is updated monthly.";

export default async function Now() {
  const { data, error } = await supabase
    .from("now_page")
    .select("body, updated_at")
    .eq("id", 1)
    .maybeSingle<{ body: string; updated_at: string }>();

  const page = error ? null : data;
  const body = page?.body || DEFAULT_BODY;

  return (
    <div>
      <h1>Now</h1>
      <p className="lead">What I&apos;m building, learning, and reading this month. Updated monthly.</p>
      <div className="entry">
        <p className="body">{body}</p>
        {page?.body && page.updated_at ? (
          <p className="mono-label" style={{ marginTop: 12 }}>
            Last updated {shortDate(page.updated_at)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
