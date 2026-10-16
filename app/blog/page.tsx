import { supabase } from "@/lib/supabase";
import { shortDate } from "@/lib/format";
import { berlinDayKey, dayKey, upcomingPostDates } from "@/lib/schedule";
import Calendar from "./Calendar";
import Newsletter from "./Newsletter";
import LinkedText from "./LinkedText";

export const revalidate = 60;

type Post = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  published_at: string | null;
  image_url: string | null;
};

// Post images come from the media bucket; only show absolute https URLs.
function safeImage(url: string | null): string | null {
  return url && /^https:\/\//.test(url) ? url : null;
}

export default async function Blog() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, body, created_at, published_at, image_url")
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  const posts = (error ? [] : data ?? []) as Post[];

  const now = new Date();
  const thisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  // Start from the 1st so post days earlier this month stay marked.
  const marked = new Set(upcomingPostDates(thisMonth, 6).map(dayKey));
  const published = new Set(posts.map((p) => berlinDayKey(new Date(p.published_at ?? p.created_at))));
  const today = dayKey(now);

  return (
    <div>
      <h1>Blog</h1>
      <p className="lead">Notes from the build: decisions, failures, and what I&apos;d do differently.</p>

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

      <Newsletter />

      {posts.length === 0 ? (
        <div className="empty-box">No posts yet. The first one is on the way.</div>
      ) : (
        posts.map((post) => {
          const image = safeImage(post.image_url);
          return (
            <article className="entry post" key={post.id}>
              <div className="entry-head">
                <h3>{post.title}</h3>
                <div className="meta-row">
                  <span className="pill">Published</span>
                  <span className="mono-label">{shortDate(post.published_at ?? post.created_at)}</span>
                </div>
              </div>
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="post-image" src={image} alt="" loading="lazy" />
              ) : null}
              <p className="body">
                <LinkedText text={post.body} />
              </p>
            </article>
          );
        })
      )}
    </div>
  );
}
