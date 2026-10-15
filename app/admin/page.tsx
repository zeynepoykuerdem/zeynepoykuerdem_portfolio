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
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setMessage(error ? error.message : "Check your email for the sign-in link.");
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
          <button type="submit">Send sign-in link</button>
        </form>
        {message ? <p className="muted">{message}</p> : null}
      </section>
    );
  }

  return <AdminPanel />;
}
