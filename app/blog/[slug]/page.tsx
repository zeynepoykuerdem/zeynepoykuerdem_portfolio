// One blog post page component for a given slug.

import { shortDate } from "@/lib/format";
import { excerpt, readingTime, shortHash } from "@/lib/posts";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import LinkedText from "../LinkedText";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };
async function fetchPost(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, body, image_url, published_at, created_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) notFound();
  return data;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  const time = readingTime(post.body);

  return (
    <article className="entry post">
      <Link href="/blog">← git log</Link>
      <p className="mono-label">
        {shortHash(post.id)} · {shortDate(post.published_at ?? post.created_at)}
        {time ? <> · {time}</> : null}
      </p>
      <h1>{post.title}</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {post.image_url && <img className="post-image" src={post.image_url} alt="" />}
      <p className="body">
        <LinkedText text={post.body} />
      </p>
    </article>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  return {
    title: post.title,
    description: excerpt(post.body),
    openGraph: {
      title: post.title,
      description: excerpt(post.body),
      ...(post.image_url ? { images: [post.image_url] } : {}),
    },
  };
}
