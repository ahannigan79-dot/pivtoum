"use client";

import { useState } from "react";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <p className="signup-note">Thanks — we&rsquo;ll email you when the next edition publishes.</p>
    );
  }

  return (
    <form className="signup" onSubmit={submit}>
      <label className="signup-label" htmlFor="signup-email">
        Get the next edition
      </label>
      <div className="signup-row">
        <input
          id="signup-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "…" : "Notify me"}
        </button>
      </div>
      {status === "error" ? <p className="signup-note">Something went wrong — try again.</p> : null}
    </form>
  );
}
