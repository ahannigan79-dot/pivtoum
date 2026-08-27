import type { Career } from "@/data/careers";

type Cell = "yes" | "no" | string;

type Row = { label: string; sample: Cell } | { group: string };

/**
 * Sample vs Community. The free sampler shows where a career stands; membership
 * in Winning in the Age of AI is how you act on it — every career's full profile
 * plus the living loop. The list is identical across careers, so it lives here
 * rather than in each MDX file. The Community column is always a yes.
 */
const ROWS: Row[] = [
  { group: "The full career profile" },
  { label: "Verdict, all sub-track scores, 3-year trend", sample: "yes" },
  { label: "Six-factor ratings", sample: "yes" },
  { label: "Reasoning behind every factor rating", sample: "one example" },
  { label: "How durable each protection is — where AI is already pressing", sample: "no" },
  { label: "The honest downsides", sample: "no" },
  { label: "What's genuinely good about it — satisfaction data", sample: "no" },
  { label: "Who this work suits, and who it doesn't", sample: "no" },
  { label: "The AI-native advantage — how to prepare", sample: "no" },
  { label: "Routes in", sample: "no" },
  { label: "Where the path leads later — and which exits raise exposure", sample: "no" },
  { label: "Path evaluation checklist", sample: "no" },
  { label: "Questions to ask — twelve, plus red flags", sample: "no" },
  { label: "Sourced further reading, including the strongest case against our score", sample: "no" },
  { label: "Discussion questions", sample: "no" },
  { label: "A short version written directly to you", sample: "no" },
  { label: "Technical scoring appendix", sample: "no" },
  { group: "The community" },
  { label: "Your living Career Map — re-scored as the field moves", sample: "no" },
  { label: "Your Together pod — a small group in your exact lane", sample: "no" },
  { label: "The Judgment Gym & Workflow Rebuilds — reps that build your edge", sample: "no" },
  { label: "Live clinics, events, and direct access to the founder", sample: "no" },
  { label: "The full Learn curriculum and asset library", sample: "no" },
];

function Mark({ value }: { value: Cell }) {
  if (value === "yes") return <span className="yes">✓</span>;
  if (value === "no") return <span className="no">—</span>;
  return <span className="no">{value}</span>;
}

export function FullProfileTable({ career }: { career: Career }) {
  return (
    <div className="incl" data-career={career.slug}>
      <div className="h">
        <span />
        <span>Sample</span>
        <span>Community</span>
      </div>
      {ROWS.map((r, i) =>
        "group" in r ? (
          <div key={i} className="grp"><span>{r.group}</span></div>
        ) : (
          <div key={i}>
            <span>{r.label}</span>
            <Mark value={r.sample} />
            <span className="yes">✓</span>
          </div>
        ),
      )}
    </div>
  );
}
