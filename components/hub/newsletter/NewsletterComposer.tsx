"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { draftNewsletterAction, saveNewsletterAction, sendNewsletterAction } from "@/app/hub/newsletter/actions";

/** Founder: generate a monthly newsletter draft from the scout roll-up, edit it,
 *  and send it to opted-in members. */
export function NewsletterComposer({ initialSubject, initialBody, aiOn }: {
  initialSubject: string; initialBody: string; aiOn: boolean;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [drafting, startDraft] = useTransition();
  const [saving, startSave] = useTransition();
  const [sending, startSend] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const busy = drafting || saving || sending;
  const empty = !subject.trim() || !body.trim();

  function generate() {
    setMsg(null);
    startDraft(async () => {
      const r = await draftNewsletterAction();
      if (r.ok) { setSubject(r.subject ?? ""); setBody(r.body ?? ""); setMsg("Draft written from this month's scan — edit it, then send."); }
      else setMsg("Couldn't draft one — is there a scout report this month? Run the scout first.");
    });
  }
  function save() {
    setMsg(null);
    startSave(async () => {
      const r = await saveNewsletterAction(subject, body);
      setMsg(r.ok ? "Draft saved." : "Couldn't save — add a subject and body.");
      if (r.ok) router.refresh();
    });
  }
  function send() {
    setMsg(null);
    startSend(async () => {
      const r = await sendNewsletterAction(subject, body);
      if (r.ok) { setMsg(`Sent to ${r.sent} member${r.sent === 1 ? "" : "s"}${r.recipients && r.recipients !== r.sent ? ` of ${r.recipients}` : ""}. ✓`); setConfirm(false); router.refresh(); }
      else if (r.reason === "email-not-configured") setMsg("Email isn't configured on the server — can't send yet.");
      else if (r.reason === "empty") setMsg("Add a subject and body first.");
      else setMsg("Couldn't send just now. Try again in a moment.");
    });
  }

  return (
    <div className="nl-compose">
      <div className="nl-toolbar">
        <button className="nl-btn" onClick={generate} disabled={busy || !aiOn} title={aiOn ? "" : "Set ANTHROPIC_API_KEY to draft"}>
          {drafting ? "Drafting…" : "✨ Draft from this month's scan"}
        </button>
        <span className="nl-hint">Generates a draft from the article-scout roll-up — you edit before anything sends.</span>
      </div>

      <label className="nl-field"><span>Subject</span>
        <input className="nl-in" value={subject} maxLength={120} placeholder="This month in the age of AI" onChange={(e) => setSubject(e.target.value)} />
      </label>
      <label className="nl-field"><span>Body <em>(markdown: <code>## heading</code>, <code>[text](url)</code>, <code>**bold**</code>)</em></span>
        <textarea className="nl-ta" rows={18} value={body} placeholder="Write the issue, or draft one from the scan above and edit it." onChange={(e) => setBody(e.target.value)} />
      </label>

      {msg && <p className="nl-msg">{msg}</p>}

      <div className="nl-actions">
        <button className="nl-btn" onClick={save} disabled={busy || empty}>{saving ? "Saving…" : "Save draft"}</button>
        {!confirm ? (
          <button className="nl-btn primary" onClick={() => setConfirm(true)} disabled={busy || empty}>Send to members →</button>
        ) : (
          <span className="nl-confirm">
            <span>Send this to every member who accepts community email?</span>
            <button className="nl-btn primary" onClick={send} disabled={sending}>{sending ? "Sending…" : "Yes, send it"}</button>
            <button className="nl-btn ghost" onClick={() => setConfirm(false)} disabled={sending}>Cancel</button>
          </span>
        )}
      </div>
    </div>
  );
}
