// Posts go out every other Friday, starting Friday 16 October 2026.
// Dates are handled in UTC, so a post on a given day is the same day in Berlin.
const FIRST_POST_DATE = Date.UTC(2026, 9, 16);
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// The yyyy-mm-dd day a timestamp falls on in Berlin, so a post published
// shortly after midnight on Friday counts as Friday, not Thursday (UTC).
export function berlinDayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(
    d,
  );
}

// The next `count` post dates on or after `from`.
export function upcomingPostDates(from: Date, count: number): Date[] {
  let time = FIRST_POST_DATE;
  while (
    time <
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  ) {
    time += TWO_WEEKS_MS;
  }
  return Array.from(
    { length: count },
    (_, i) => new Date(time + i * TWO_WEEKS_MS),
  );
}
// The shared type CLOUD AND MCP study sessions.
export type StudySession = {
  day: string;
  title: string;
  done: boolean;
};

// the months to show
export function calendarMonths(now: Date): Date[] {
  const thisMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const nextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  return [thisMonth, nextMonth];
}

// study calendar
export function studyCalendar(sessions: StudySession[]): {
  planned: Set<string>;
  done: Set<string>;
  titles: Map<string, string>;
} {
  const planned = new Set(sessions.map((s) => s.day)); // every day is considered planned
  const done = new Set(sessions.filter((s) => s.done).map((s) => s.day));
  const titles = new Map(sessions.map((s) => [s.day, s.title]));
  return { planned, done, titles };
}
