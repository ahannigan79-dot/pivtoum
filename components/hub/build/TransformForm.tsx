"use client";
import { useFormStatus } from "react-dom";
import { transformWorkflow } from "@/app/hub/build/rebuild/actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="tf-go" disabled={pending}>
      {pending ? "Rebuilding your workflow…" : "Rebuild my workflow AI-native →"}
    </button>
  );
}

export function TransformForm({ role }: { role: string }) {
  return (
    <form action={transformWorkflow} className="tf-form">
      <label className="tf-field">
        <span>The workflow</span>
        <input name="workflow" maxLength={160} required placeholder="e.g. Monthly board reporting pack" className="tf-input" />
      </label>
      <label className="tf-field">
        <span>How it's done today</span>
        <textarea name="steps" maxLength={2000} required rows={5} className="tf-textarea"
          placeholder="Walk through the steps as they run now — who does what, roughly how long each takes, where the time goes." />
      </label>
      <label className="tf-field">
        <span>Your role <em>(optional)</em></span>
        <input name="role" maxLength={120} defaultValue={role} placeholder="e.g. Senior Financial Analyst" className="tf-input" />
      </label>
      <SubmitBtn />
      <p className="tf-note">One rebuild per month. Give it a minute — it&apos;s building the full transformation.</p>
    </form>
  );
}
