"use client";
import { useRef, useState, useTransition } from "react";
import { submitMoveArtifact } from "@/app/hub/focus-actions";
import type { ArtifactStatus } from "@/lib/artifacts";

/** Proof-of-work on a completed play: submit the artifact you built (a link or a
 *  note). It files to your Library and goes to your domain leader to verify. */
export function ArtifactForm({ goalId, playSlug, playTitle, status }: {
  goalId: string; playSlug: string; playTitle: string; status: ArtifactStatus | null;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"link" | "note">("link");
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  if (status === "verified") {
    return <p className="art-state verified">✓ Verified by your domain leader — this move is confirmed.</p>;
  }
  if (status === "submitted") {
    return <p className="art-state submitted">⏳ Artifact submitted — awaiting your domain leader&rsquo;s review. Filed in your <a href="/hub/library">Library</a>.</p>;
  }

  if (!open) {
    return (
      <div className="art-prompt">
        <p className="art-prompt-t">
          {status === "returned"
            ? "↩ Sent back by your domain leader — add more and resubmit. (See the note in your Library.)"
            : "One more step to confirm this move: submit the artifact you built. It goes to your Library, and your domain leader verifies it."}
        </p>
        <button className="art-open" onClick={() => setOpen(true)}>
          {status === "returned" ? "Resubmit the artifact →" : "Submit your artifact →"}
        </button>
      </div>
    );
  }

  return (
    <form ref={ref} className="art-form"
      action={(fd) => start(async () => { await submitMoveArtifact(goalId, playSlug, playTitle, fd); ref.current?.reset(); setOpen(false); })}>
      <input type="hidden" name="kind" value={kind} />
      <div className="art-kind">
        <button type="button" className={kind === "link" ? "on" : ""} onClick={() => setKind("link")}>🔗 A link</button>
        <button type="button" className={kind === "note" ? "on" : ""} onClick={() => setKind("note")}>📝 A note</button>
      </div>
      {kind === "link" ? (
        <input name="url" type="url" required placeholder="Link to what you built — a doc, a deck, a PR, a page…" maxLength={600} />
      ) : (
        <textarea name="body" rows={3} required maxLength={4000} placeholder="Describe what you produced and where it landed — what you shipped, and the result." />
      )}
      <div className="art-form-foot">
        <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit for review"}</button>
      </div>
    </form>
  );
}
