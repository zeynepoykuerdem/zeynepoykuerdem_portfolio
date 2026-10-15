import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type CloudNote = {
  id: string;
  domain: string;
  title: string;
  body: string;
  created_at: string;
};

export default async function CloudNotes() {
  const { data, error } = await supabase
    .from("cloud_notes")
    .select("id, domain, title, body, created_at")
    .order("created_at", { ascending: false });

  const notes = (error ? [] : data ?? []) as CloudNote[];

  // Group notes by exam domain, keeping the order they first appear in.
  const groups = new Map<string, CloudNote[]>();
  for (const note of notes) {
    const key = note.domain || "General";
    groups.set(key, [...(groups.get(key) ?? []), note]);
  }

  return (
    <div>
      <h1>Cloud study log</h1>
      <p className="muted">AWS Certified Solutions Architect – Associate (SAA-C03) notes, by domain.</p>

      {notes.length === 0 ? (
        <p className="empty">No notes yet.</p>
      ) : (
        Array.from(groups.entries()).map(([domain, items]) => (
          <section key={domain}>
            <h2>{domain}</h2>
            {items.map((note) => (
              <article className="card" key={note.id}>
                <h3>{note.title}</h3>
                <p className="post-body">{note.body}</p>
              </article>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
