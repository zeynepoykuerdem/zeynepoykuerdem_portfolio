import Link from "next/link";
import CopyEmail from "../../components/CopyEmail";

const AREAS = [
  {
    label: "Backend",
    title: "Services and queues",
    text: "Python, FastAPI, PostgreSQL, Laravel, RabbitMQ, MinIO, Docker.",
  },
  {
    label: "AI",
    title: "Vision and explainability",
    text: "PyTorch, Grad-CAM, Integrated Gradients, edge inference on Raspberry Pi 5.",
  },
  {
    label: "Frontend",
    title: "Web apps",
    text: "React, Next.js, and Vue 3 with TypeScript.",
  },
  {
    label: "Cloud",
    title: "Hosting and data",
    text: "AWS (studying for Solutions Architect – Associate), Vercel, Supabase.",
  },
];

export default function Developers() {
  return (
    <div>
      <h1>For developers</h1>
      <p className="lead">
        What I build, how it is built, and where to look first.
      </p>

      <div className="cards">
        {AREAS.map((a) => (
          <article className="card" key={a.label}>
            <p className="mono-label">{a.label}</p>
            <h3>{a.title}</h3>
            <p>{a.text}</p>
          </article>
        ))}
      </div>

      <div className="entry" style={{ marginTop: 20 }}>
        <h3>Where to look</h3>
        <ul>
          <li>
            Pinned projects and architecture: <Link href="/">Home</Link>
          </li>
          <li>
            Decisions and debugging write-ups: <Link href="/blog">Blog</Link>
          </li>
          <li>
            AWS study notes: <Link href="/cloud">Cloud notes</Link>
          </li>
          <li>
            Working notes on MCP setup:{" "}
            <Link href="/nextex-mcp">NexTex MCP</Link>
          </li>
        </ul>
      </div>

      <div className="entry">
        <h3>Contact</h3>
        <p className="muted" style={{ margin: "8px 0" }}>
          Send an email to the address below, or copy it.
        </p>
        <div className="contact-row">
          <a
            className="mono-label"
            href="mailto:zeynepoykuerdem@outlook.com"
            style={{ textTransform: "none" }}
          >
            zeynepoykuerdem@outlook.com
          </a>
          <CopyEmail />
        </div>
      </div>
    </div>
  );
}
