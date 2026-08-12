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
  unlimited = false,
}: {
  token: string;
  packSize: number;
  choices: Choice[];
  unlimited?: boolean;
}) {
  const [stage, setStage] = useState<"planning" | "active" | "">("");
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState<{ name: string; url: string }[] | null>(null);

  // Unlimited grants the whole catalog, so you can take any number up to all of
  // them; a fixed pack must be claimed exactly.
  const target = unlimited ? choices.length : packSize;
  const full = selected.length >= target;
  const enough = unlimited ? selected.length >= 1 : selected.length === packSize;
  const canSubmit = Boolean(stage) && enough;

  function toggle(slug: string) {
    setSelected((cur) =>
      cur.includes(slug) ? cur.filter((s) => s !== slug) : full ? cur : [...cur, slug],
    );
  }
  function selectAll() {
    setSelected(choices.map((c) => c.slug));
  }

  async function submit() {
    setStatus("sending");
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, slugs: selected, stage }),
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
      <div className="claim-stage">
        <p className="claim-stage-q">First — where are you with these careers?</p>
        <div className="pkg-opts">
          <button
            type="button"
            className={`pkg-opt${stage === "planning" ? " on" : ""}`}
            onClick={() => setStage("planning")}
            aria-pressed={stage === "planning"}
          >
            <b>Still choosing</b>
            <span>weighing a degree or path</span>
          </button>
          <button
            type="button"
            className={`pkg-opt${stage === "active" ? " on" : ""}`}
            onClick={() => setStage("active")}
            aria-pressed={stage === "active"}
          >
            <b>Already in it</b>
            <span>in the degree, or working</span>
          </button>
        </div>
        <p className="claim-stage-note">
          Your guides are written for exactly this — we&rsquo;ll send the {stage === "active" ? "already-in-it" : stage === "planning" ? "planning" : "matching"} edition of each.
        </p>
      </div>

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
          {unlimited ? (
            <>
              {selected.length} selected
              {!full ? (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={selectAll}
                    style={{
                      background: "none",
                      border: 0,
                      padding: 0,
                      font: "inherit",
                      color: "var(--pen)",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Select all
                  </button>
                </>
              ) : null}
            </>
          ) : (
            <>
              {selected.length} of {packSize} chosen
            </>
          )}
        </span>
        <button
          className="claim-submit"
          disabled={!canSubmit || status === "sending"}
          onClick={submit}
        >
          {status === "sending" ? "Sending…" : "Email me these guides"}
        </button>
        {status === "error" ? <span className="claim-note">{message}</span> : null}
      </div>
    </div>
  );
}
