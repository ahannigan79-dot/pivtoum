"use client";
import { useState } from "react";
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

// A scaffold that pulls the detail the transformer needs out of a low-effort
// member — the richer the input, the sharper (and less assumed) the doc.
const TEMPLATE = `Process owner: [your role]
Trigger: [what kicks it off — e.g. "monthly, client report due the 5th"]
Cycle time: [rough total time you spend — e.g. "4-5 hours a week"]
Systems & artifacts touched: [the plan, the spreadsheet, email/Teams, last month's file…]

Steps as they run today:
1. [first step] — [who does it, ~how long]
2. [next step] — [who, ~time]
3. …

Where the time really goes: [the slow, annoying, or error-prone part]`;

export function TransformForm({ role }: { role: string }) {
  const [steps, setSteps] = useState("");

  return (
    <form action={transformWorkflow} className="tf-form">
      <label className="tf-field">
        <span>The workflow</span>
        <input name="workflow" maxLength={160} required placeholder="e.g. Weekly client status report" className="tf-input" />
      </label>
      <label className="tf-field">
        <span className="tf-labrow">
          How it&apos;s done today
          <button type="button" className="tf-tmpl" onClick={() => setSteps(TEMPLATE)}>Start from a template</button>
        </span>
        <textarea name="steps" maxLength={2000} required rows={9} className="tf-textarea"
          value={steps} onChange={(e) => setSteps(e.target.value)}
          placeholder="Walk through the steps as they run now — who does what, roughly how long each takes, where the time goes. The more real detail you give, the sharper the rebuild (and the less it has to assume)." />
      </label>
      <label className="tf-field">
        <span>Your role <em>(optional)</em></span>
        <input name="role" maxLength={120} defaultValue={role} placeholder="e.g. Senior Financial Analyst" className="tf-input" />
      </label>
      <SubmitBtn />
      <p className="tf-note">One rebuild per month. Give it a minute — it&apos;s building the full transformation. Thin detail still works: anything it has to guess is marked <b>“assumed — confirm”</b> for you to check.</p>
    </form>
  );
}
