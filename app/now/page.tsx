import { supabase } from "@/lib/supabase";

export const revalidate = 60;

const DEFAULT_BODY =
  "What I'm building, learning, and reading this month. Updated monthly.";

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
      <p className="post-body">{body}</p>
      {page?.updated_at ? (
        <p className="muted">
          Last updated{" "}
          {new Date(page.updated_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      ) : null}
    </div>
  );
}
