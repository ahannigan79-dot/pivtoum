import type { ReactNode } from "react";
import { CircledScore } from "@/components/CircledScore";

/**
 * Render a data string that uses the Pivotum marker syntax into React nodes.
 * Handles ==highlight== (and +/-/? variants), **bold**, the {n} career-count
 * token, and optionally wraps the first literal occurrence of a score in the
 * hand-drawn CircledScore (used once, for the quick-answer headline).
 *
 * The remark plugin does the same job for MDX prose; this covers strings that
 * live in data (quick answers, FAQ answers).
 */

const HL = /==([+\-?]?)([\s\S]+?)==/g;
const BOLD = /\*\*([\s\S]+?)\*\*/g;
const CLASS: Record<string, string> = { "+": "hl g", "-": "hl r", "?": "hl b", "": "hl" };

interface Opts {
  count?: number;
  circleScore?: number;
}

interface CircleState {
  score: string;
  used: boolean;
}

function withCircle(text: string, keyBase: string, circle?: CircleState): ReactNode[] {
  if (!circle || circle.used) return [text];
  const idx = text.indexOf(circle.score);
  if (idx < 0) return [text];
  circle.used = true;
  return [
    text.slice(0, idx),
    <CircledScore key={`${keyBase}-c`}>{circle.score}</CircledScore>,
    text.slice(idx + circle.score.length),
  ];
}

function renderBold(text: string, keyBase: string, circle?: CircleState): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  BOLD.lastIndex = 0;
  while ((m = BOLD.exec(text)) !== null) {
    if (m.index > last) out.push(...withCircle(text.slice(last, m.index), `${keyBase}-t${i}`, circle));
    out.push(<strong key={`${keyBase}-b${i}`}>{withCircle(m[1], `${keyBase}-bi${i}`, circle)}</strong>);
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(...withCircle(text.slice(last), `${keyBase}-tend`, circle));
  return out;
}

export function renderMarks(input: string, opts: Opts = {}): ReactNode[] {
  let text = input;
  if (opts.count != null) text = text.replace(/\{n\}/g, String(opts.count));
  const circle: CircleState | undefined =
    opts.circleScore != null ? { score: String(opts.circleScore), used: false } : undefined;

  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  HL.lastIndex = 0;
  while ((m = HL.exec(text)) !== null) {
    if (m.index > last) out.push(...renderBold(text.slice(last, m.index), `p${i}`, circle));
    out.push(
      <span key={`h${i}`} className={CLASS[m[1]]}>
        {m[2]}
      </span>,
    );
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(...renderBold(text.slice(last), "pend", circle));
  return out;
}
