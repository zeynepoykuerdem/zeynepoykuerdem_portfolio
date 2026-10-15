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

// Projects are static for now. They move to the database in a later step.
const PROJECTS = [
  {
    name: "NexTex AI",
    summary:
      "Camera-based defect detection for circular knitting machines. Edge devices run inference and send results to a cloud backend.",
    stack: ["FastAPI", "RabbitMQ", "MinIO", "Raspberry Pi 5"],
  },
  {
    name: "Studiee AI",
    summary:
      "An AI-powered student performance platform, built independently from idea to working product.",
    stack: ["Next.js", "Supabase", "Vercel"],
  },
  {
    name: "Explainable AI thesis",
    summary:
      "Grad-CAM vs. Integrated Gradients, and how model memorization affects explanations.",
    stack: ["PyTorch", "Grad-CAM"],
  },
];

export default async function Home() {
  const { data, error } = await supabase
    .from("profile")
    .select("headline, bio, status, avatar_url")
    .eq("id", 1)
    .maybeSingle<Profile>();

  const profile: Profile | null = error ? null : data;
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
          {PROJECTS.map((p) => (
            <article className="card" key={p.name}>
              <h3>
                <a
                  href="https://github.com/zeynepoykuerdem"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.name}
                </a>
              </h3>
              <p>{p.summary}</p>
              <div style={{ marginTop: 8 }}>
                {p.stack.map((s) => (
                  <span className="tag" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
