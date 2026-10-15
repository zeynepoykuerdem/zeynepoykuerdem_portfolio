import { supabase } from "@/lib/supabase";

// Refresh the content from Supabase at most once a minute.
export const revalidate = 60;

type Profile = {
  headline: string | null;
  bio: string | null;
  status: string | null;
  avatar_url: string | null;
};

const DEFAULT_HEADLINE =
  "I build AI systems that explain themselves and ship to real machines.";
const DEFAULT_BIO =
  "I work across computer vision, backend services, and the edge devices that connect them. Right now I'm a co-founder and backend engineer at NexTex AI in Heidelberg.";

type Project = {
  id: string;
  name: string;
  summary: string;
  stack: string[];
  github_url: string | null;
};

// Only link to absolute https URLs; anything else is shown as plain text.
function safeUrl(url: string | null): string | null {
  return url && /^https:\/\//.test(url) ? url : null;
}

export default async function Home() {
  const [profileRes, projectsRes] = await Promise.all([
    supabase
      .from("profile")
      .select("headline, bio, status, avatar_url")
      .eq("id", 1)
      .maybeSingle<Profile>(),
    supabase
      .from("projects")
      .select("id, name, summary, stack, github_url")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const profile: Profile | null = profileRes.error ? null : profileRes.data;
  const projects = (projectsRes.error ? [] : projectsRes.data ?? []) as Project[];
  const headline = profile?.headline || DEFAULT_HEADLINE;
  const bio = profile?.bio || DEFAULT_BIO;

  return (
    <div className="side-layout">
      <aside>
        <div className="avatar" aria-hidden="true">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" />
          ) : (
            "ÖE"
          )}
        </div>
        <h1 className="name">Öykü Erdem</h1>
        <p className="muted">@zeynepoykuerdem</p>
        <p>{headline}</p>
        <p className="muted">Heidelberg, Germany</p>
        <p className="muted">Co-founder, NexTex AI</p>
        <p className="muted">M.Eng. Information Technology (AI), SRH</p>
        {profile?.status ? <p className="muted">{profile.status}</p> : null}
      </aside>

      <div>
        <section className="card">
          <h2>About</h2>
          <p>{bio}</p>
        </section>

        <section>
          <h2>Projects</h2>
          {projects.length === 0 ? <p className="empty">Projects are on the way.</p> : null}
          {projects.map((p) => {
            const url = safeUrl(p.github_url);
            return (
              <article className="card" key={p.id}>
                <h3>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                </h3>
                <p>{p.summary}</p>
                {p.stack.length > 0 ? (
                  <div style={{ marginTop: 8 }}>
                    {p.stack.map((s) => (
                      <span className="tag" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
