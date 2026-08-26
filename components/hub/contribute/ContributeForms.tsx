"use client";
import { useRef, useState, useTransition } from "react";
import { proposeSession, submitArticle } from "@/app/hub/contribute/actions";

/** Two ways for a member to contribute: propose a session to host, or submit an
 *  article to publish. Both go to Adam for review before they go live. */
export function ContributeForms() {
  const [tab, setTab] = useState<"session" | "article">("session");
  const sRef = useRef<HTMLFormElement>(null);
  const aRef = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [done, setDone] = useState<"" | "session" | "article">("");

  return (
    <div className="contribute">
      <div className="contribute-tabs">
        <button className={tab === "session" ? "on" : ""} onClick={() => { setTab("session"); setDone(""); }}>Host a session</button>
        <button className={tab === "article" ? "on" : ""} onClick={() => { setTab("article"); setDone(""); }}>Write an article</button>
      </div>

      {done && (
        <p className="contribute-done">
          Sent to Adam for review. You&apos;ll get a notification when it&apos;s live{done === "session" ? " on the calendar" : ""}.
        </p>
      )}

      {tab === "session" ? (
        <form ref={sRef} className="newevent"
          action={(fd) => start(async () => { await proposeSession(fd); sRef.current?.reset(); setDone("session"); })}>
          <p className="contribute-hint">Pitch a session you&apos;d run for the community — a walkthrough, a topic you know deeply, a guest you&apos;d bring. Adam approves it onto the calendar.</p>
          <input name="title" placeholder="Session title" required maxLength={200} />
          <div className="newevent-row">
            <select name="type" defaultValue="sme">
              <option value="sme">SME / topic session</option>
              <option value="open_stage">Open Stage</option>
              <option value="wins">Celebrate the Wins</option>
              <option value="social">Social</option>
            </select>
            <input name="startsAt" type="datetime-local" title="Proposed time" />
            <input name="durationMins" type="number" defaultValue={45} min={15} step={15} title="Minutes" />
          </div>
          <input name="joinUrl" placeholder="Google Meet link — optional, Adam can add one" maxLength={500} />
          <textarea name="body" rows={4} required maxLength={8000}
            placeholder="What's the session about? Who's it for, and what will people walk away with?" />
          <div className="newevent-foot">
            <button type="submit" disabled={pending}>{pending ? "Sending…" : "Submit for review"}</button>
          </div>
        </form>
      ) : (
        <form ref={aRef} className="newevent"
          action={(fd) => start(async () => { await submitArticle(fd); aRef.current?.reset(); setDone("article"); })}>
          <p className="contribute-hint">Write a longer piece for the community — a lesson learned, a workflow you rebuilt, a read on your field. Approved articles publish to the feed under your name.</p>
          <input name="title" placeholder="Article title" required maxLength={200} />
          <textarea name="body" rows={12} required maxLength={8000}
            placeholder="Write your article here…" />
          <div className="newevent-foot">
            <button type="submit" disabled={pending}>{pending ? "Sending…" : "Submit for review"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
