const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  year: number;
  month: number; // 0-based
  marked: Set<string>; // yyyy-mm-dd keys of post days
  published: Set<string>; // yyyy-mm-dd keys of days with a published post
  today: string; // yyyy-mm-dd
};

export default function Calendar({ year, month, marked, published, today }: Props) {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // Monday-first: Sunday (0) moves to the end of the week.
  const offset = (first.getUTCDay() + 6) % 7;
  const days: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const label = first.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="calendar">
      <h3>{label}</h3>
      <div className="cal-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="cal-head">
            {w}
          </div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const key = new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
          const isPost = marked.has(key);
          const isPublished = published.has(key);
          const isToday = key === today;
          const cls = [
            "cal-day",
            isPost ? "post" : "",
            isPublished ? "published" : "",
            isToday ? "today" : "",
          ]
            .join(" ")
            .trim();
          const title = isPublished ? "Published" : isPost ? "Post day" : undefined;
          return (
            <div key={key} className={cls} title={title}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
