// Short dates for entry cards, e.g. "15 Oct 2026", in Berlin time like the rest of the site.
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Berlin",
  });
}
