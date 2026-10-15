"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import AdminPanel from "./AdminPanel";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Any email can sign in, so check the admins table before showing the panel.
  // Row-level security still blocks writes either way; this only keeps the UI honest.
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    supabase.rpc("is_admin").then(({ data, error }) => {
      if (!cancelled) setIsAdmin(!error && data === true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function sendLink(e: FormEvent) {
    e.preventDefault();
    // Supabase answers only after the mail server accepts the email, which can take a while.
    setSending(true);
    setMessage("Sending…");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setMessage(error ? error.message : "Check your email for the sign-in link.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not send the link. Try again.");
    } finally {
      setSending(false);
    }
  }

  if (!ready) return <p className="muted">Loading…</p>;

  if (!session) {
    return (
      <section className="card narrow">
        <h1>Admin sign-in</h1>
        <p className="muted">Enter your email and we'll send you a sign-in link.</p>
        <form onSubmit={sendLink}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
        {message ? <p className="muted">{message}</p> : null}
      </section>
    );
  }

  if (isAdmin === null) return <p className="muted">Checking access…</p>;

  if (!isAdmin) {
    return (
      <section className="card narrow">
        <h1>Not an admin</h1>
        <p className="muted">
          You're signed in as {session.user.email}, but this account isn't in the admins table.
        </p>
        <p className="muted">
          User id: <code>{session.user.id}</code>
        </p>
        <button type="button" className="ghost" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </section>
    );
  }

  return <AdminPanel />;
}
