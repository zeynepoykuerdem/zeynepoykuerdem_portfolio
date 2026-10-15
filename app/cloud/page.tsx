import { supabase } from "@/lib/supabase";
import { shortDate } from "@/lib/format";

export const revalidate = 60;

type CloudNote = {
  id: string;
  domain: string;
  title: string;
  body: string;
  created_at: string;
};

const DOMAINS = [
  "Design secure architectures",
  "Design resilient architectures",
  "Design high-performing architectures",
  "Design cost-optimized architectures",
];

export default async function CloudNotes() {
  const { data, error } = await supabase
    .from("cloud_notes")
    .select("id, domain, title, body, created_at")
    .order("created_at", { ascending: false });

  const notes = (error ? [] : data ?? []) as CloudNote[];

  return (
    <div>
      <h1>Cloud architecture notes</h1>
      <p className="lead">
        Study log for AWS Certified Solutions Architect – Associate (SAA-C03), by exam domain.
      </p>

      <ul className="domains" aria-label="Exam domains">
        {DOMAINS.map((d, i) => (
          <li key={d}>
            <b>Domain {i + 1}</b>
            {d}
          </li>
        ))}
      </ul>

      {notes.length === 0 ? (
        <div className="empty-box">No notes yet.</div>
      ) : (
        notes.map((note) => (
          <article className="entry" key={note.id}>
            <div className="entry-head">
              <h3>{note.title}</h3>
              <div className="meta-row">
                {note.domain ? <span className="pill">{note.domain}</span> : null}
                <span className="mono-label">{shortDate(note.created_at)}</span>
              </div>
            </div>
            <p className="body">{note.body}</p>
          </article>
        ))
      )}
    </div>
  );
}
