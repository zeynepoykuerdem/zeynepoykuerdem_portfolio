import { supabase } from "@/lib/supabase";
import { dayKey, upcomingPostDates } from "@/lib/schedule";
import Calendar from "./Calendar";

export const revalidate = 60;

type Post = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

export default async function Blog() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, body, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const posts = (error ? [] : data ?? []) as Post[];

  const now = new Date();
  const thisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  // Start from the 1st so post days earlier this month stay marked.
  const marked = new Set(upcomingPostDates(thisMonth, 6).map(dayKey));
  const published = new Set(posts.map((p) => dayKey(new Date(p.created_at))));
  const today = dayKey(now);

  return (
    <div>
      <h1>Blog</h1>
      <p className="muted">Notes from the build: decisions, failures, and what I&apos;d do differently.</p>

      <section className="card cal-card">
        <p className="cal-label">Blog calendar · every other Friday</p>
        <div className="cal-months">
          {[thisMonth, nextMonth].map((m) => (
            <Calendar
              key={dayKey(m)}
              year={m.getUTCFullYear()}
              month={m.getUTCMonth()}
              marked={marked}
              published={published}
              today={today}
            />
          ))}
        </div>
        <p className="cal-label cal-legend">Outlined = post day · filled = published</p>
      </section>

      {posts.length === 0 ? (
        <p className="empty">No posts yet. The first one is on the way.</p>
      ) : (
        posts.map((post) => (
          <article className="card" key={post.id}>
            <h2>{post.title}</h2>
            <p className="muted">
              {new Date(post.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="post-body" style={{ marginTop: 8 }}>
              {post.body}
            </p>
          </article>
        ))
      )}
    </div>
  );
}
