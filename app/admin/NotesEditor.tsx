"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = { text: string; error: boolean } | null;

const CLOUD_DOMAINS = [
  "Design secure architectures",
  "Design resilient architectures",
  "Design high-performing architectures",
  "Design cost-optimized architectures",
  "Other",
];

const MCP_STATUSES = [
  { value: "working", label: "Working" },
  { value: "blocked", label: "Blocked" },
  { value: "todo", label: "To do" },
];

type CloudNote = { id: string; domain: string; title: string; body: string; created_at: string };
type McpNote = { id: string; status: string; title: string; body: string; created_at: string };

function errMsg(err: unknown): string {
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Something went wrong.";
}

function StatusLine({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <p className={status.error ? "status error" : "status"} role="status">
      {status.text}
    </p>
  );
}

// Cloud notes (/cloud): AWS SAA-C03 study log, grouped by exam domain on the page.
export function CloudNotesEditor() {
  const [notes, setNotes] = useState<CloudNote[]>([]);
  const [status, setStatus] = useState<Status>(null);
  const [domain, setDomain] = useState(CLOUD_DOMAINS[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    supabase
      .from("cloud_notes")
      .select("id, domain, title, body, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setStatus({ text: errMsg(error), error: true });
        else setNotes((data ?? []) as CloudNote[]);
      });
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase
      .from("cloud_notes")
      .insert({ domain, title: title.trim(), body: body.trim() })
      .select("id, domain, title, body, created_at")
      .single();
    if (error) return setStatus({ text: errMsg(error), error: true });
    setNotes([data as CloudNote, ...notes]);
    setTitle("");
    setBody("");
    setStatus({ text: "Note saved.", error: false });
  }

  async function remove(n: CloudNote) {
    if (!window.confirm(`Delete "${n.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("cloud_notes").delete().eq("id", n.id);
    if (error) return setStatus({ text: errMsg(error), error: true });
    setNotes(notes.filter((x) => x.id !== n.id));
    setStatus({ text: "Note deleted.", error: false });
  }

  return (
    <section className="card">
      <h2>Cloud notes</h2>
      <StatusLine status={status} />
      <form onSubmit={add}>
        <label>
          Domain
          <select value={domain} onChange={(e) => setDomain(e.target.value)}>
            {CLOUD_DOMAINS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Topic
          <input type="text" required maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Note
          <textarea required rows={5} maxLength={20000} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <button type="submit">Save note</button>
      </form>
      {notes.length === 0 ? <p className="muted">No notes yet.</p> : null}
      {notes.map((n) => (
        <div className="row-item" key={n.id}>
          <div>
            <strong>{n.title}</strong> <span className="tag">{n.domain}</span>
          </div>
          <div className="row-actions">
            <button type="button" className="ghost danger" onClick={() => remove(n)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

// NexTex MCP working notes (/nextex-mcp), each with a working / blocked / to-do status.
export function McpNotesEditor() {
  const [notes, setNotes] = useState<McpNote[]>([]);
  const [status, setStatus] = useState<Status>(null);
  const [mcpStatus, setMcpStatus] = useState(MCP_STATUSES[0].value);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    supabase
      .from("mcp_notes")
      .select("id, status, title, body, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setStatus({ text: errMsg(error), error: true });
        else setNotes((data ?? []) as McpNote[]);
      });
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase
      .from("mcp_notes")
      .insert({ status: mcpStatus, title: title.trim(), body: body.trim() })
      .select("id, status, title, body, created_at")
      .single();
    if (error) return setStatus({ text: errMsg(error), error: true });
    setNotes([data as McpNote, ...notes]);
    setTitle("");
    setBody("");
    setStatus({ text: "Entry saved.", error: false });
  }

  async function changeStatus(n: McpNote, next: string) {
    const { error } = await supabase.from("mcp_notes").update({ status: next }).eq("id", n.id);
    if (error) return setStatus({ text: errMsg(error), error: true });
    setNotes(notes.map((x) => (x.id === n.id ? { ...x, status: next } : x)));
    setStatus({ text: "Status updated.", error: false });
  }

  async function remove(n: McpNote) {
    if (!window.confirm(`Delete "${n.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("mcp_notes").delete().eq("id", n.id);
    if (error) return setStatus({ text: errMsg(error), error: true });
    setNotes(notes.filter((x) => x.id !== n.id));
    setStatus({ text: "Entry deleted.", error: false });
  }

  return (
    <section className="card">
      <h2>NexTex MCP notes</h2>
      <StatusLine status={status} />
      <form onSubmit={add}>
        <label>
          Title
          <input type="text" required maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Status
          <select value={mcpStatus} onChange={(e) => setMcpStatus(e.target.value)}>
            {MCP_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Notes
          <textarea required rows={5} maxLength={20000} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <button type="submit">Save entry</button>
      </form>
      {notes.length === 0 ? <p className="muted">No entries yet.</p> : null}
      {notes.map((n) => (
        <div className="row-item" key={n.id}>
          <div>
            <strong>{n.title}</strong>
          </div>
          <div className="row-actions">
            {/* Status changes often as work moves on, so it can be switched in place. */}
            <select
              aria-label={`Status of ${n.title}`}
              value={n.status}
              onChange={(e) => changeStatus(n, e.target.value)}
            >
              {MCP_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button type="button" className="ghost danger" onClick={() => remove(n)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
