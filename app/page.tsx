import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CopyEmail from "./CopyEmail";
import PipelineDiagram, { type PipelineStep } from "./PipelineDiagram";

// Refresh the content from Supabase at most once a minute.
export const revalidate = 60;

type Profile = {
  headline: string | null;
  bio: string | null;
  status: string | null;
  avatar_url: string | null;
};

// Sidebar pills. Languages get a coloured dot (.dot.py, .dot.ts, .dot.php), like GitHub.
const TOOLS: { name: string; dot?: "py" | "ts" | "php" }[] = [
  { name: "Python", dot: "py" },
  { name: "TypeScript", dot: "ts" },
  { name: "PHP", dot: "php" },
  { name: "FastAPI" },
  { name: "React" },
  { name: "Next.js" },
  { name: "Node.js" },
  { name: "Docker" },
  { name: "TensorFlow" },
  { name: "RabbitMQ" },
  { name: "MinIO" },
  { name: "PyTorch" },
];

const DEFAULT_HEADLINE =
  "I build AI systems that explain themselves and ship to real machines.";
const DEFAULT_BIO =
  "I work across computer vision, backend services, and the edge devices that connect them. Right now I'm a co-founder and backend engineer at NexTex AI in Heidelberg.";

// Static home page sections from the prototype. Edit here to change them.
const BUILD_LOG: { when: string; state: "planned" | "done"; text: string }[] = [
  { when: "Oct 2026", state: "planned", text: "Next post: the thesis, explained without the math." },
  { when: "Oct 2026", state: "planned", text: "Studiee AI case study: architecture and key decisions." },
  { when: "Oct 2026", state: "done", text: "Post: the AI Act's first move is about monitoring, not fines." },
  { when: "Oct 2026", state: "done", text: "First post: how I built this site, and what went wrong on the way." },
  { when: "Oct 2026", state: "done", text: "Released this site (v1.0.0): Next.js, Supabase, and a post every other Friday." },
  { when: "Sep 2026", state: "done", text: "Remote field pilot of the NexTex edge devices." },
];

const FOR_FUN = [
  { title: "Creative crafts", text: "Hands-on making when I'm away from the screen." },
  { title: "Fitness programming", text: "Training plans I write, test, and adjust." },
];

const EXPERIENCE = [
  "Co-founder and backend engineer, NexTex AI (2026 –)",
  "Independent builder of Studiee AI",
  "Frontend (React, Next.js) and backend (PHP, Laravel, PostgreSQL) in internships and junior roles",
];

type Project = {
  id: string;
  name: string;
  summary: string;
  stack: string[];
  github_url: string | null;
  label: string;
  icon: string;
  note_label: string;
  note: string;
  pipeline: PipelineStep[];
};

type Latest = { title: string; date: string; href: string };

// Line icons for the pinned cards, chosen by projects.icon.
const ICONS: Record<string, React.ReactNode> = {
  camera: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <circle cx="12" cy="13" r="3.5" />
      <path d="M8 7l1.5-2h5L16 7" />
    </>
  ),
  book: (
    <>
      <path d="M3 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0z" />
      <path d="M21 6c-3-1.5-6-1.5-9 0v13c3-1.5 6-1.5 9 0z" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </>
  ),
};

// Stack items that are languages get a coloured dot in the card footer.
const LANGUAGE_DOTS: Record<string, string> = {
  Python: "py",
  TypeScript: "ts",
  PHP: "php",
  JavaScript: "js",
};

// Only link to absolute https URLs; anything else is shown as plain text.
function safeUrl(url: string | null): string | null {
  return url && /^https:\/\//.test(url) ? url : null;
}

export default async function Home() {
  const [profileRes, projectsRes, postsRes, noteRes] = await Promise.all([
    supabase
      .from("profile")
      .select("headline, bio, status, avatar_url")
      .eq("id", 1)
      .maybeSingle<Profile>(),
    supabase
      .from("projects")
      .select("id, name, summary, stack, github_url, label, icon, note_label, note, pipeline")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("posts")
      .select("title, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ title: string; published_at: string | null }>(),
    supabase
      .from("cloud_notes")
      .select("title, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ title: string; created_at: string | null }>(),
  ]);

  const profile: Profile | null = profileRes.error ? null : profileRes.data;
  const projects = (
    projectsRes.error ? [] : (projectsRes.data ?? [])
  ) as Project[];
  const post = postsRes.error ? null : postsRes.data;
  const note = noteRes.error ? null : noteRes.data;
  // "What's new": the newer of the latest published post and the latest cloud note.
  const fromPost: Latest | null = post?.published_at
    ? { title: post.title, date: post.published_at, href: "/blog" }
    : null;
  const fromNote: Latest | null = note?.created_at
    ? { title: note.title, date: note.created_at, href: "/cloud" }
    : null;

  let latest: Latest | null = null;
  if (fromPost && fromNote) {
    latest =
      new Date(fromPost.date).getTime() >= new Date(fromNote.date).getTime()
        ? fromPost
        : fromNote;
  } else {
    latest = fromPost ?? fromNote;
  }

  const headline = profile?.headline || DEFAULT_HEADLINE;
  const bio = profile?.bio || DEFAULT_BIO;
  return (
    <>
      <div className="banner">
        <p className="greet">Hey there, I&apos;m Öykü.</p>
        <p className="mono-label">Full-stack and AI engineer · Heidelberg</p>
        <h2>
          Explainable AI, edge devices, and the backends that tie them together.
        </h2>
      </div>
      <p className="whats-new">
        {latest ? (
          <>
            What&apos;s new: <Link href={latest.href}>{latest.title}</Link> ·{" "}
            {new Date(latest.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "Europe/Berlin",
            })}
          </>
        ) : (
          <>
            What&apos;s new: nothing yet. The first post is on the calendar
            below.
          </>
        )}
      </p>
      <div className="side-layout">
        <aside className="side">
          <div className="avatar" aria-hidden="true">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" />
            ) : (
              "ÖE"
            )}
          </div>
          <h1>Öykü Erdem</h1>
          <p className="handle">@zeynepoykuerdem</p>
          <p className="bio-short">
            AI engineer. Full-stack, with a master&apos;s thesis in explainable
            AI.
          </p>
          <div className="meta">
            <div>Heidelberg, Germany</div>
            <div>Co-founder, NexTex AI</div>
            <div>M.Eng. Information Technology (AI), SRH</div>
            <div>
              <a href="mailto:zeynepoykuerdem@outlook.com">zeynepoykuerdem@outlook.com</a>
            </div>
            <div>
              <CopyEmail />
            </div>
          </div>
          <hr />
          <h3>Top languages and tools</h3>
          <div className="stack-list">
            {TOOLS.map((t) => (
              <span className="lbl" key={t.name}>
                {t.dot ? <span className={`dot ${t.dot}`} /> : null}
                {t.name}
              </span>
            ))}
          </div>
          {profile?.status ? <p className="status">{profile.status}</p> : null}
        </aside>

        <div>
          <section>
            <div className="pinned-head">
              <h2>Pinned</h2>
            </div>
            {projects.length === 0 ? (
              <p className="empty">Projects are on the way.</p>
            ) : null}
            <div className="pinned">
              {projects.map((p) => {
                const url = safeUrl(p.github_url);
                return (
                  <article className="repo" key={p.id}>
                    {ICONS[p.icon] ? (
                      <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                        {ICONS[p.icon]}
                      </svg>
                    ) : null}
                    {/* The whole card is clickable when the project has a repository. */}
                    {url ? (
                      <a className="stretch" href={url} target="_blank" rel="noopener noreferrer">
                        <span className="sr">{p.name} on GitHub</span>
                      </a>
                    ) : null}
                    <p className="name">{p.name}</p>
                    {p.label ? <span className="vis">{p.label}</span> : null}
                    <p>{p.summary}</p>
                    {p.note ? (
                      <div className="note">
                        {p.note_label ? <b>{p.note_label}:</b> : null} {p.note}
                      </div>
                    ) : null}
                    {p.stack.length > 0 ? (
                      <div className="foot">
                        {p.stack.map((s) => (
                          <span key={s}>
                            {LANGUAGE_DOTS[s] ? <span className={`dot ${LANGUAGE_DOTS[s]}`} /> : null}
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>

          <div className="readme">
            <div className="readme-head">README.md</div>
            <div className="readme-body">
              <h2>Hi, I&apos;m Öykü</h2>
              <p>{headline}</p>
              <p>{bio}</p>
              <div className="callout">
                <strong>Looking for:</strong> a hybrid role in Berlin, Munich, Amsterdam, or Lisbon, in a
                team where ideas get shared and tested.
              </div>
            </div>
          </div>

          <svg className="wave" viewBox="0 0 1200 32" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 16 Q 50 0 100 16 T 200 16 T 300 16 T 400 16 T 500 16 T 600 16 T 700 16 T 800 16 T 900 16 T 1000 16 T 1100 16 T 1200 16 V32 H0 Z" />
          </svg>

          {/* One architecture diagram per project that has pipeline steps (edited in /admin). */}
          {projects
            .filter((p) => Array.isArray(p.pipeline) && p.pipeline.length > 0)
            .map((p) => (
              <div className="readme" key={`arch-${p.id}`}>
                <div className="readme-head">Architecture: {p.name}</div>
                <div className="readme-body">
                  <figure className="diagram">
                    <PipelineDiagram steps={p.pipeline} title={`Architecture of ${p.name}`} />
                    <figcaption>Simplified. Component names only, no production details.</figcaption>
                  </figure>
                </div>
              </div>
            ))}

          <div className="readme">
            <div className="readme-head">Build log</div>
            <ul className="activity">
              {BUILD_LOG.map((item) => (
                <li key={item.text}>
                  <span className="when">{item.when}</span>
                  <span className={`state ${item.state}`}>{item.state}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="readme">
            <div className="readme-head">Just for fun</div>
            <div className="readme-body">
              <div className="fun-grid">
                {FOR_FUN.map((f) => (
                  <article className="fun-card" key={f.title}>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="readme">
            <div className="readme-head">About</div>
            <div className="readme-body">
              <h3>Education</h3>
              <p>M.Eng. Information Technology, AI specialization, SRH University Heidelberg.</p>
              <h3>Experience</h3>
              <ul>
                {EXPERIENCE.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
