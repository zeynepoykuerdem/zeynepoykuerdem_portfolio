import { supabase } from "@/lib/supabase";
import { shortDate } from "@/lib/format";
import Calendar from "../../components/Calendar";
import {
  berlinDayKey,
  dayKey,
  type StudySession,
  calendarMonths,
  studyCalendar,
} from "@/lib/schedule";

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
  const [cloudNotesRes, studySessionsRes] = await Promise.all([
    supabase
      .from("cloud_notes")
      .select("id, domain, title, body, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("study_sessions")
      .select("day,title,done")
      .eq("track", "cloud"),
  ]);

  const notes = (
    cloudNotesRes.error ? [] : (cloudNotesRes.data ?? [])
  ) as CloudNote[];
  const studySessions = (
    studySessionsRes.error ? [] : (studySessionsRes.data ?? [])
  ) as StudySession[];
  const now = new Date();
  const months = calendarMonths(now);
  const { planned, done, titles } = studyCalendar(studySessions);

  return (
    <div>
      <h1>Cloud architecture notes</h1>
      <p className="lead">
        Study log for AWS Certified Solutions Architect – Associate (SAA-C03),
        by exam domain.
      </p>
      <section className="card cal-card">
        <p className="cal-label">Study Calendar · Cloud </p>
        <div className="cal-months">
          {months.map((m) => (
            <Calendar
              key={dayKey(m)}
              year={m.getUTCFullYear()}
              month={m.getUTCMonth()}
              planned={planned}
              done={done}
              labels={{ planned: "Planned", done: "Done" }}
              titles={titles}
              today={berlinDayKey(now)}
            />
          ))}
        </div>
        <p className="cal-label cal-legend">
          Outlined = PLANNED · filled = DONE
        </p>
      </section>

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
                {note.domain ? (
                  <span className="pill">{note.domain}</span>
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
