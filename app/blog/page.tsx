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
  const upcoming = upcomingPostDates(now, 26); // about a year of post days
  const marked = new Set(upcoming.map(dayKey));
  const today = dayKey(now);
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return (
    <div>
      <h1>Blog</h1>
      <p className="muted">Build notes and decisions, published every other Friday.</p>

      <section className="card">
        <h2>Next post days</h2>
        <ul className="next-dates">
          {upcomingPostDates(now, 3).map((d) => (
            <li key={dayKey(d)}>
              {d.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </li>
          ))}
        </ul>
        <div className="cal-months">
          <Calendar year={now.getUTCFullYear()} month={now.getUTCMonth()} marked={marked} today={today} />
          <Calendar
            year={nextMonth.getUTCFullYear()}
            month={nextMonth.getUTCMonth()}
            marked={marked}
            today={today}
          />
        </div>
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
