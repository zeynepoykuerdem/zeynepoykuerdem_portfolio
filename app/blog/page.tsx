import { supabase } from "@/lib/supabase";

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

  return (
    <div>
      <h1>Blog</h1>
      <p className="muted">Build notes and decisions, published every other Friday.</p>

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
