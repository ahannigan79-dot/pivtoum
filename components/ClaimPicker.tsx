"use client";

import { useState } from "react";

interface Choice {
  slug: string;
  name: string;
  range: string;
}

export function ClaimPicker({
  token,
  packSize,
  choices,
}: {
  token: string;
  packSize: number;
  choices: Choice[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState<{ name: string; url: string }[] | null>(null);

  const full = selected.length >= packSize;

  function toggle(slug: string) {
    setSelected((cur) =>
      cur.includes(slug) ? cur.filter((s) => s !== slug) : full ? cur : [...cur, slug],
    );
  }

  async function submit() {
    setStatus("sending");
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, slugs: selected }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setStatus("done");
      if (data.links?.length) {
        setLinks(data.links);
        setMessage(`Your ${data.delivered} guide(s) are ready — links valid for 7 days:`);
      } else {
        setMessage(`Sent ${data.delivered} guide(s) to ${data.email}. The links are valid for 7 days.`);
      }
    } else {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="claim-note">
        <p>
          <strong>Done.</strong> {message}
        </p>
        {links ? (
          <ul>
            {links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noreferrer">
                  {l.name} — Career Value Guide (PDF)
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="claim-grid">
        {choices.map((c) => {
          const checked = selected.includes(c.slug);
          const disabled = !checked && full;
          return (
            <label key={c.slug} className={`claim-opt${disabled ? " disabled" : ""}`}>
              <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(c.slug)} />
              <span>{c.name}</span>
              <span className="s">{c.range}</span>
            </label>
          );
        })}
      </div>
      <div className="claim-bar">
        <span>
          {selected.length} of {packSize} chosen
        </span>
        <button
          className="claim-submit"
          disabled={selected.length !== packSize || status === "sending"}
          onClick={submit}
        >
          {status === "sending" ? "Sending…" : "Email me these guides"}
        </button>
        {status === "error" ? <span className="claim-note">{message}</span> : null}
      </div>
    </div>
  );
}
