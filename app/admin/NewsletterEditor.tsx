"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = { text: string; error: boolean } | null;

// Newsletter settings for the blog box. An empty link hides the box on the blog.
export default function NewsletterEditor() {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [frequency, setFrequency] = useState("");
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    supabase
      .from("newsletter")
      .select("url, text, frequency")
      .eq("id", 1)
      .maybeSingle<{ url: string; text: string; frequency: string }>()
      .then(({ data, error }) => {
        if (error) return setStatus({ text: error.message, error: true });
        if (data) {
          setUrl(data.url);
          setText(data.text);
          setFrequency(data.frequency);
        }
      });
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    const link = url.trim();
    if (link && !/^https:\/\/\S+$/.test(link)) {
      return setStatus({ text: "Use a full https:// address.", error: true });
    }
    const { error } = await supabase.from("newsletter").upsert({
      id: 1,
      url: link,
      text: text.trim(),
      frequency: frequency.trim(),
      updated_at: new Date().toISOString(),
    });
    setStatus(
      error
        ? { text: error.message, error: true }
        : { text: link ? "Newsletter saved." : "Saved. The box is hidden until a link is set.", error: false },
    );
  }

  return (
    <section className="card">
      <h2>Newsletter</h2>
      {status ? (
        <p className={status.error ? "status error" : "status"} role="status">
          {status.text}
        </p>
      ) : null}
      <form onSubmit={save}>
        <label>
          Sign-up link (must start with https://; leave empty to hide the box)
          <input type="text" maxLength={500} value={url} onChange={(e) => setUrl(e.target.value)} />
        </label>
        <label>
          Text shown on the blog (optional)
          <input type="text" maxLength={300} value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <label>
          How often (optional)
          <input type="text" maxLength={200} value={frequency} onChange={(e) => setFrequency(e.target.value)} />
        </label>
        <button type="submit">Save newsletter</button>
      </form>
    </section>
  );
}
