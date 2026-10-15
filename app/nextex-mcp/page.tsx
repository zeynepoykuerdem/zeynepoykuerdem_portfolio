import { supabase } from "@/lib/supabase";
import { shortDate } from "@/lib/format";

export const revalidate = 60;

type McpNote = {
  id: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
};

// Status values come from the admin panel; anything else shows as a plain grey pill.
const STATUS_LABELS: Record<string, string> = {
  working: "working",
  blocked: "blocked",
  todo: "to do",
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
      <p className="lead">
        How MCP is set up for the NexTex team: what works, what is blocked, and what is next.
      </p>

      {notes.length === 0 ? (
        <div className="empty-box">No notes yet.</div>
      ) : (
        notes.map((note) => (
          <article className="entry" key={note.id}>
            <div className="entry-head">
              <h3>{note.title}</h3>
              <div className="meta-row">
                {note.status ? (
                  <span className={STATUS_LABELS[note.status] ? `pill ${note.status}` : "pill"}>
                    {STATUS_LABELS[note.status] ?? note.status}
                  </span>
                ) : null}
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
