export function shortHash(id: string): string {
  // Returns the first 7 characters of the id, like a short hash.
  return id.slice(0, 7);
}

export function excerpt(body: string, max = 140): string {
  // returns text no longer than max. If it's longer, it cuts at the last space before the limit and adds …, so a word is never cut in half
  const text = body.replace(/\s+/g, " ").trim();
  if (text.length === 0) {
    return "";
  }
  if (text.length <= max) {
    return text;
  }
  const truncated = text.slice(0, max);
  const lastSpace = truncated.lastIndexOf(" ");
  const cut = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  return cut.replace(/[\s.,;:!?-]+$/, "") + "…";
}

export function readingTime(body: string): string {
  // estimates the reading time of the body text in minutes, assuming an average reading speed of 200 words per minute
  const text = body.trim();
  const words = text ? text.split(/\s+/).length : 0;
  if (words === 0) return "";
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
