import { supabase } from "@/lib/supabase";
import { shortDate } from "@/lib/format";
import Calendar from "../../components/Calendar";
import { dayKey, berlinDayKey, type StudySession, calendarMonths, studyCalendar } from "@/lib/schedule";

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
  const [notesRes, sessionsRes] = await Promise.all([
    supabase
      .from("mcp_notes")
      .select("id, title, body, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("study_sessions").select("day,title,done").eq("track", "mcp"),
  ]);

  const notes = (notesRes.error ? [] : (notesRes.data ?? [])) as McpNote[];
  const sessions = (
    sessionsRes.error ? [] : (sessionsRes.data ?? [])
  ) as StudySession[]; // session type
  const now = new Date();
  const [thisMonth, nextMonth] = calendarMonths(now);
  const { planned, done, titles } = studyCalendar(sessions);

  const today = berlinDayKey(now);

  return (
    <div>
      <h1>NexTex MCP: working notes</h1>
      <p className="lead">
        How MCP is set up for the NexTex team: what works, what is blocked, and
        what is next.
      </p>
      <section className="card cal-card">
        <p className="cal-label">Study Calendar · MCP </p>
        <div className="cal-months">
          {[thisMonth, nextMonth].map((m) => (
            <Calendar
              key={dayKey(m)}
              year={m.getUTCFullYear()}
              month={m.getUTCMonth()}
              planned={planned}
              done={done}
              labels={{ planned: "Planned", done: "Done" }}
              titles={titles}
              today={today}
            />
          ))}
        </div>
        <p className="cal-label cal-legend">
          Outlined = PLANNED · filled = DONE
        </p>
      </section>

      {notes.length === 0 ? (
        <div className="empty-box">No notes yet.</div>
      ) : (
        notes.map((note) => (
          <article className="entry" key={note.id}>
            <div className="entry-head">
              <h3>{note.title}</h3>
              <div className="meta-row">
                {note.status ? (
                  <span
                    className={
                      STATUS_LABELS[note.status]
                        ? `pill ${note.status}`
                        : "pill"
                    }
                  >
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
