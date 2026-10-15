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

type Project = {
  id: string;
  name: string;
  summary: string;
  stack: string[];
  github_url: string | null;
  sort_order: number;
};

type ProjectInput = Omit<Project, "id">;

type Status = { text: string; error: boolean } | null;

const EMPTY_PROJECT: ProjectInput = { name: "", summary: "", stack: [], github_url: null, sort_order: 0 };

// One project as an editable form. Used for existing projects and for the "add" form.
function ProjectEditor({
  initial,
  submitLabel,
  onSave,
  onDelete,
}: {
  initial: ProjectInput;
  submitLabel: string;
  onSave: (input: ProjectInput) => Promise<boolean>;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [summary, setSummary] = useState(initial.summary);
  const [stack, setStack] = useState(initial.stack.join(", "));
  const [url, setUrl] = useState(initial.github_url ?? "");
  const [order, setOrder] = useState(String(initial.sort_order));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const saved = await onSave({
      name: name.trim(),
      summary: summary.trim(),
      stack: stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      github_url: url.trim() || null,
      sort_order: Number.parseInt(order, 10) || 0,
    });
    // The add form starts over after a save; existing projects keep their values.
    if (saved && !onDelete) {
      setName("");
      setSummary("");
      setStack("");
      setUrl("");
      setOrder("0");
    }
  }

  return (
    <form onSubmit={submit} className="project-form">
      <label>
        Name
        <input type="text" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Summary
        <textarea rows={3} maxLength={500} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </label>
      <label>
        Stack (comma-separated)
        <input type="text" maxLength={300} value={stack} onChange={(e) => setStack(e.target.value)} />
      </label>
      <label>
        Repository URL (optional, must start with https://)
        <input type="text" maxLength={300} value={url} onChange={(e) => setUrl(e.target.value)} />
      </label>
      <label>
        Order (lower comes first)
        <input type="text" inputMode="numeric" maxLength={4} value={order} onChange={(e) => setOrder(e.target.value)} />
      </label>
      <div className="row-actions">
        <button type="submit">{submitLabel}</button>
        {onDelete ? (
          <button type="button" className="ghost danger" onClick={onDelete}>
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}

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
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    load();
    // Load once when the panel opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function note(text: string, error = false) {
    setStatus({ text, error });
  }

  async function load() {
    const [profileRes, nowRes, postsRes, projectsRes] = await Promise.all([
      supabase.from("profile").select("headline, bio, status").eq("id", 1).maybeSingle(),
      supabase.from("now_page").select("body").eq("id", 1).maybeSingle(),
      supabase
        .from("posts")
        .select("id, title, body, published, created_at, image_url")
        .order("created_at", { ascending: false }),
      supabase
        .from("projects")
        .select("id, name, summary, stack, github_url, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
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
    if (projectsRes.data) setProjects(projectsRes.data as Project[]);
    if (profileRes.error || nowRes.error || postsRes.error || projectsRes.error) {
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

  function invalidUrl(input: ProjectInput): boolean {
    if (input.github_url && !/^https:\/\//.test(input.github_url)) {
      note("The repository URL must start with https://", true);
      return true;
    }
    return false;
  }

  function sortProjects(list: Project[]): Project[] {
    return [...list].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  }

  async function addProject(input: ProjectInput): Promise<boolean> {
    if (invalidUrl(input)) return false;
    const { data, error } = await supabase
      .from("projects")
      .insert(input)
      .select("id, name, summary, stack, github_url, sort_order")
      .single();
    if (error) {
      note(errMsg(error), true);
      return false;
    }
    setProjects(sortProjects([...projects, data as Project]));
    note("Project added.");
    return true;
  }

  async function updateProject(id: string, input: ProjectInput): Promise<boolean> {
    if (invalidUrl(input)) return false;
    const { error } = await supabase.from("projects").update(input).eq("id", id);
    if (error) {
      note(errMsg(error), true);
      return false;
    }
    setProjects(sortProjects(projects.map((p) => (p.id === id ? { id, ...input } : p))));
    note("Project saved.");
    return true;
  }

  async function deleteProject(project: Project) {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    if (error) return note(errMsg(error), true);
    setProjects(projects.filter((p) => p.id !== project.id));
    note("Project deleted.");
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
        <h2>Projects</h2>
        {projects.length === 0 ? <p className="muted">No projects yet.</p> : null}
        {projects.map((project) => (
          <div className="project-item" key={project.id}>
            <ProjectEditor
              initial={project}
              submitLabel="Save project"
              onSave={(input) => updateProject(project.id, input)}
              onDelete={() => deleteProject(project)}
            />
          </div>
        ))}
        <div className="project-item">
          <h3>Add a project</h3>
          <ProjectEditor initial={EMPTY_PROJECT} submitLabel="Add project" onSave={addProject} />
        </div>
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
