import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type McpNote = {
  id: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
};

export default async function NexTexMcp() {
  const { data, error } = await supabase
    .from("mcp_notes")
    .select("id, title, body, status, created_at")
    .order("created_at", { ascending: false });

  const notes = (error ? [] : data ?? []) as McpNote[];

  return (
    <div>
      <h1>NexTex MCP: working notes</h1>
      <p className="muted">How MCP is set up for the NexTex team: what works, what is blocked, and what is next.</p>

      {notes.length === 0 ? (
        <p className="empty">No notes yet.</p>
      ) : (
        notes.map((note) => (
          <article className="card" key={note.id}>
            <h2>{note.title}</h2>
            {note.status ? <p className="muted">Status: {note.status}</p> : null}
            <p className="post-body">{note.body}</p>
          </article>
        ))
      )}
    </div>
  );
}
