export default function Developers() {
  return (
    <div>
      <h1>For developers</h1>
      <p className="muted">The stack I use, and where I spend my time.</p>

      <section className="card">
        <h2>Backend</h2>
        <p>Python, FastAPI, PostgreSQL, Laravel, RabbitMQ, MinIO, Docker.</p>
      </section>
      <section className="card">
        <h2>AI</h2>
        <p>PyTorch, Grad-CAM, Integrated Gradients, edge inference on Raspberry Pi 5.</p>
      </section>
      <section className="card">
        <h2>Frontend</h2>
        <p>React, Next.js, and Vue 3 with TypeScript.</p>
      </section>
      <section className="card">
        <h2>Cloud</h2>
        <p>AWS (studying for the Solutions Architect – Associate certification), Vercel, Supabase.</p>
      </section>
    </div>
  );
}
