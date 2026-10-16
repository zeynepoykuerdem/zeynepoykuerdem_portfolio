import { Fragment } from "react";

// Post bodies are plain text. This turns every https:// address in them into a link,
// and leaves everything else as text (no HTML is ever interpreted).
const URL_PATTERN = /(https:\/\/[^\s<>"]+)/g;

// Punctuation that usually ends the sentence rather than the address, e.g. "(https://…)."
const TRAILING = /[.,;:!?)\]]+$/;

export default function LinkedText({ text }: { text: string }) {
  const parts = text.split(URL_PATTERN);
  return (
    <>
      {parts.map((part, i) => {
        // split() with a capturing group puts the matches at odd indexes.
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        const trailing = part.match(TRAILING)?.[0] ?? "";
        const url = trailing ? part.slice(0, -trailing.length) : part;
        return (
          <Fragment key={i}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url.replace(/^https:\/\/(www\.)?/, "")}
            </a>
            {trailing}
          </Fragment>
        );
      })}
    </>
  );
}
