import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { excerpt, readingTime, shortHash } from "@/lib/posts";
import { berlinDayKey, dayKey, upcomingPostDates } from "@/lib/schedule";
import Calendar from "./Calendar";
import Newsletter from "./Newsletter";

export const revalidate = 60;

const PAGE_SIZE = 8;

type Post = {
  id: string;
  slug: string;
  title: string;
  body: string;
  created_at: string;
  published_at: string | null;
  image_url: string | null;
};

type Props = { searchParams: Promise<{ page?: string }> };

// Post images come from the media bucket; only show absolute https URLs.
function safeImage(url: string | null): string | null {
  return url && /^https:\/\//.test(url) ? url : null;
}

export default async function Blog({ searchParams }: Props) {
  const { page } = await searchParams;
  // Anything that is not a positive number (?page=abc, ?page=-2) means page 1.
  const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const from = (pageNumber - 1) * PAGE_SIZE;

  const [listRes, datesRes] = await Promise.all([
    // One row more than a page, to know whether there are older posts.
    supabase
      .from("posts")
      .select("id, slug, title, body, created_at, published_at, image_url")
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE),
    // The calendar needs every published day, not just this page's posts.
    supabase.from("posts").select("published_at, created_at").eq("published", true),
  ]);

  const rows = (listRes.error ? [] : listRes.data ?? []) as Post[];
  const hasOlder = rows.length > PAGE_SIZE;
  const posts = rows.slice(0, PAGE_SIZE);
  const dates = (datesRes.error ? [] : datesRes.data ?? []) as Pick<Post, "published_at" | "created_at">[];

  const now = new Date();
  const thisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  // Start from the 1st so post days earlier this month stay marked.
  const marked = new Set(upcomingPostDates(thisMonth, 6).map(dayKey));
  const published = new Set(dates.map((p) => berlinDayKey(new Date(p.published_at ?? p.created_at))));
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

      <section className="gitlog" aria-label="Posts">
        <p className="terminal">
          <span className="prompt">~/zeynepoykuerdem $</span> git log --oneline --blog
          {pageNumber > 1 ? ` --skip=${from}` : null}
        </p>

        {posts.length === 0 ? (
          <div className="empty-box">
            {pageNumber === 1 ? "No posts yet. The first one is on the way." : "No older posts."}
          </div>
        ) : (
          <ol className="timeline">
            {posts.map((post, i) => {
              const isHead = pageNumber === 1 && i === 0;
              const time = readingTime(post.body);
              const image = safeImage(post.image_url);
              const summary = excerpt(post.body);
              return (
                <li key={post.id} className={isHead ? "commit head" : "commit"}>
                  <div className="commit-text">
                    <p className="commit-meta">
                      <span className="hash" aria-hidden="true">
                        {shortHash(post.id)}
                      </span>
                      {isHead ? <span className="head-badge">HEAD -&gt; main</span> : null}
                      <time dateTime={post.published_at ?? post.created_at}>
                        {berlinDayKey(new Date(post.published_at ?? post.created_at))}
                      </time>
                      {time ? <span>· {time}</span> : null}
                    </p>
                    <h2 className="commit-title">
                      {/* The link covers the whole entry (see .commit-title a::after in globals.css). */}
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {summary ? <p className="commit-excerpt">{summary}</p> : null}
                  </div>
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="commit-thumb" src={image} alt="" loading="lazy" />
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}

        {hasOlder || pageNumber > 1 ? (
          <nav className="gitlog-pages" aria-label="More posts">
            {pageNumber > 1 ? (
              <Link href={pageNumber === 2 ? "/blog" : `/blog?page=${pageNumber - 1}`}>← Newer commits</Link>
            ) : (
              <span />
            )}
            {hasOlder ? <Link href={`/blog?page=${pageNumber + 1}`}>Show older commits →</Link> : null}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
