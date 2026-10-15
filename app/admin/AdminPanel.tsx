"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  created_at: string;
  image_url: string | null;
};

type Status = { text: string; error: boolean } | null;

function errMsg(err: unknown): string {
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Something went wrong.";
}

// Stores an image in the public "media" bucket and returns its public URL.
async function uploadImage(file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
  });
  if (error) throw error;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

function selectedFile(form: HTMLFormElement): File | null {
  const input = form.querySelector<HTMLInputElement>('input[type="file"]');
  return input?.files?.[0] ?? null;
}

export default function AdminPanel() {
  const [status, setStatus] = useState<Status>(null);
  const [profile, setProfile] = useState({ headline: "", bio: "", status: "" });
  const [nowBody, setNowBody] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [postForm, setPostForm] = useState({ title: "", body: "", published: false });

  useEffect(() => {
    load();
    // Load once when the panel opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function note(text: string, error = false) {
    setStatus({ text, error });
  }

  async function load() {
    const [profileRes, nowRes, postsRes] = await Promise.all([
      supabase.from("profile").select("headline, bio, status").eq("id", 1).maybeSingle(),
      supabase.from("now_page").select("body").eq("id", 1).maybeSingle(),
      supabase
        .from("posts")
        .select("id, title, body, published, created_at, image_url")
        .order("created_at", { ascending: false }),
    ]);
    if (profileRes.data) {
      setProfile({
        headline: profileRes.data.headline ?? "",
        bio: profileRes.data.bio ?? "",
        status: profileRes.data.status ?? "",
      });
    }
    if (nowRes.data) setNowBody(nowRes.data.body ?? "");
    if (postsRes.data) setPosts(postsRes.data as Post[]);
    if (profileRes.error || nowRes.error || postsRes.error) {
      note("Could not load everything. Check that your account is listed in the admins table.", true);
    }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("profile").upsert({
      id: 1,
      headline: profile.headline.trim(),
      bio: profile.bio.trim(),
      status: profile.status.trim(),
      updated_at: new Date().toISOString(),
    });
    note(error ? errMsg(error) : "Profile saved.", !!error);
  }

  async function savePhoto(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = selectedFile(form);
    if (!file) return note("Choose a photo first.", true);
    try {
      note("Uploading photo…");
      const url = await uploadImage(file);
      const { error } = await supabase.from("profile").upsert({ id: 1, avatar_url: url });
      if (error) throw error;
      form.reset();
      note("Photo saved.");
    } catch (err) {
      note(errMsg(err), true);
    }
  }

  async function savePost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const file = selectedFile(form);
      let imageUrl: string | null = null;
      if (file) {
        note("Uploading image…");
        imageUrl = await uploadImage(file);
      }
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: postForm.title.trim(),
          body: postForm.body.trim(),
          published: postForm.published,
          image_url: imageUrl,
        })
        .select("id, title, body, published, created_at, image_url")
        .single();
      if (error) throw error;
      setPosts([data as Post, ...posts]);
      setPostForm({ title: "", body: "", published: false });
      form.reset();
      note("Post saved.");
    } catch (err) {
      note(errMsg(err), true);
    }
  }

  async function togglePublish(post: Post) {
    const { error } = await supabase
      .from("posts")
      .update({ published: !post.published })
      .eq("id", post.id);
    if (error) return note(errMsg(error), true);
    setPosts(posts.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p)));
  }

  async function deletePost(post: Post) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) return note(errMsg(error), true);
    setPosts(posts.filter((p) => p.id !== post.id));
    note("Post deleted.");
  }

  async function saveNow(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("now_page").upsert({
      id: 1,
      body: nowBody.trim(),
      updated_at: new Date().toISOString(),
    });
    note(error ? errMsg(error) : "Now page saved.", !!error);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="admin">
      <div className="admin-head">
        <h1>Admin</h1>
        <button type="button" className="ghost" onClick={signOut}>
          Sign out
        </button>
      </div>

      {status ? (
        <p className={status.error ? "status error" : "status"} role="status">
          {status.text}
        </p>
      ) : null}

      <section className="card">
        <h2>Profile</h2>
        <form onSubmit={saveProfile}>
          <label>
            Headline
            <input
              type="text"
              maxLength={200}
              value={profile.headline}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            />
          </label>
          <label>
            Bio
            <textarea
              maxLength={1000}
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </label>
          <label>
            Status line (optional)
            <input
              type="text"
              maxLength={200}
              value={profile.status}
              onChange={(e) => setProfile({ ...profile, status: e.target.value })}
            />
          </label>
          <button type="submit">Save profile</button>
        </form>
      </section>

      <section className="card">
        <h2>Photo</h2>
        <form onSubmit={savePhoto}>
          <label>
            Profile photo (square works best)
            <input type="file" accept="image/*" />
          </label>
          <button type="submit">Upload photo</button>
        </form>
      </section>

      <section className="card">
        <h2>New post</h2>
        <form onSubmit={savePost}>
          <label>
            Title
            <input
              type="text"
              required
              maxLength={200}
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
            />
          </label>
          <label>
            Body
            <textarea
              rows={6}
              value={postForm.body}
              onChange={(e) => setPostForm({ ...postForm, body: e.target.value })}
            />
          </label>
          <label>
            Image (optional)
            <input type="file" accept="image/*" />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={postForm.published}
              onChange={(e) => setPostForm({ ...postForm, published: e.target.checked })}
            />
            Publish now (otherwise it stays a draft)
          </label>
          <button type="submit">Save post</button>
        </form>
      </section>

      <section className="card">
        <h2>Posts</h2>
        {posts.length === 0 ? <p className="muted">No posts yet.</p> : null}
        {posts.map((post) => (
          <div className="row-item" key={post.id}>
            <div>
              <strong>{post.title}</strong>{" "}
              <span className="tag">{post.published ? "published" : "draft"}</span>
            </div>
            <div className="row-actions">
              <button type="button" className="ghost" onClick={() => togglePublish(post)}>
                {post.published ? "Unpublish" : "Publish"}
              </button>
              <button type="button" className="ghost danger" onClick={() => deletePost(post)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Now page</h2>
        <form onSubmit={saveNow}>
          <label>
            What I'm working on this month
            <textarea
              rows={6}
              maxLength={5000}
              value={nowBody}
              onChange={(e) => setNowBody(e.target.value)}
            />
          </label>
          <button type="submit">Save Now page</button>
        </form>
      </section>
    </div>
  );
}
