import type { Career } from "@/data/careers";

type Cell = "yes" | "no" | string;

interface Row {
  label: string;
  free: Cell; // "yes" | "no" | free-text note
}

/**
 * The free-vs-full comparison. The value list is identical across careers, so it
 * lives here rather than in each MDX file. Every full-profile column is a yes.
 */
const ROWS: Row[] = [
  { label: "Verdict, all sub-track scores, 3-year trend", free: "yes" },
  { label: "Six-factor ratings", free: "yes" },
  { label: "Reasoning behind every factor rating", free: "one example" },
  { label: "How durable each protection is — where AI is already pressing", free: "no" },
  { label: "The honest downsides", free: "no" },
  { label: "What's genuinely good about it — satisfaction data", free: "no" },
  { label: "Who this work suits, and who it doesn't", free: "no" },
  { label: "The AI-native advantage — how to prepare", free: "no" },
  { label: "Routes in", free: "no" },
  { label: "Where the degree leads later — and which exits raise exposure", free: "no" },
  { label: "Program evaluation checklist", free: "no" },
  { label: "Questions to ask an admissions office — twelve, plus red flags", free: "no" },
  { label: "Sourced further reading, including the strongest case against our score", free: "no" },
  { label: "Discussion questions for parent and student", free: "no" },
  { label: "A short version written directly to the student", free: "no" },
  { label: "Technical scoring appendix", free: "no" },
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
        <span>Free</span>
        <span>Full</span>
      </div>
      {ROWS.map((r, i) => (
        <div key={i}>
          <span>{r.label}</span>
          <Mark value={r.free} />
          <span className="yes">✓</span>
        </div>
      ))}
    </div>
  );
}
