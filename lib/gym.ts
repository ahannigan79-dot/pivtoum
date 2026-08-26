/* The Judgment Gym — data-driven. The AI hands you polished, confident work;
   some of it is subtly wrong. Judge each piece Ship or Flag, then get scored.
   Adding a lane is just another Scenario here — no bespoke tool per career. */

import { ACCOUNTING_SCENARIOS } from "@/lib/gym-accounting";
import { MARKETING_SCENARIOS } from "@/lib/gym-marketing";

export type Severity = "minor" | "major" | "critical";
export type GymItem = {
  area: string;              // "Audience targeting"
  output: string;            // what the AI produced (the thing you're judging)
  verdict: "ship" | "flag";  // the correct call
  severity?: Severity;       // for flag items
  why: string;               // why it's right/wrong
  cost: string;              // what getting it wrong costs
  trains: string;            // the judgment muscle it builds
};

export type Scenario = {
  slug: string;
  career: string;
  short: string;             // one-line card blurb
  client: string;            // the subject of the brief
  artifact: string;          // the AI's deliverable filename
  thesis: string;            // the intro framing
  brief: { l: string; v: string }[];
  items: GymItem[];
  lesson: string;            // closing line
};

export const GYM_SCENARIOS: Record<string, Scenario> = {
  // Full 12-rep lanes live in their own modules. See lib/gym-accounting.ts, lib/gym-marketing.ts.
  ...ACCOUNTING_SCENARIOS,
  ...MARKETING_SCENARIOS,

  "software-review": {
    slug: "software-review", career: "Software Engineering",
    short: "Review an AI-written pull request against the ticket — correctness, security, and the tests.",
    client: "Checkout service — “add promo codes” PR",
    artifact: "feat-promo-codes.diff",
    thesis: "The AI opened a pull request — it builds, it's tidy, the description is confident. Some of it is subtly wrong. Approve only what should merge.",
    brief: [
      { l: "Ticket", v: "Apply a promo code at checkout: look it up, validate, discount the total" },
      { l: "Stack", v: "TypeScript · Postgres · public checkout endpoint" },
      { l: "Rule", v: "Codes are single-use per customer; expired codes rejected" },
      { l: "Bar", v: "No unparameterised SQL; every path tested" },
    ],
    items: [
      { area: "Code lookup query", verdict: "flag", severity: "critical",
        output: "`db.query(\"SELECT * FROM promos WHERE code = '\" + input.code + \"'\")`",
        why: "SQL injection. The user's code is concatenated straight into the query on a public endpoint — the one thing the bar explicitly forbids. It works in the demo and is a breach in production.",
        cost: "A public, exploitable injection on checkout — data exfiltration or worse, shipped under your approval. The incident traces to this review.",
        trains: "Reading AI code for the security hole under the working feature, not just whether it runs." },
      { area: "Discount calculation", verdict: "ship",
        output: "`const total = Math.max(0, subtotal - subtotal * (promo.percent / 100))`",
        why: "Correct. Applies the percentage and floors at zero so a large code can't produce a negative total. Clean and right.",
        cost: "Rewriting correct logic wastes the author's time and yours, and reads as not trusting good work.",
        trains: "Recognizing a correct implementation and moving on." },
      { area: "Error handling", verdict: "flag", severity: "major",
        output: "`try { applyPromo() } catch (e) { return { ok: true } }`",
        why: "It swallows the error and returns success. A failed promo application reports OK — the discount silently doesn't apply, or worse, an error is hidden. Confident, and wrong.",
        cost: "Customers charged full price after “applying” a code, with no error surfaced — support tickets, chargebacks, and a bug that's invisible in the logs.",
        trains: "Catching the failure path the machine papered over — success returned on error." },
      { area: "Single-use test", verdict: "ship",
        output: "Test asserts the same code returns 409 on a second use by the same customer.",
        why: "Good. It covers the single-use rule from the ticket — the exact behavior that matters, tested directly.",
        cost: "Demanding changes to a valid test just delays the merge.",
        trains: "Confirming the test actually exercises the requirement." },
      { area: "Expiry check", verdict: "flag", severity: "minor",
        output: "`if (promo.expires_at > now)` accept — using date-only comparison, ignoring time.",
        why: "An off-by-a-day edge. Comparing a date-only value means a code expiring today is honored until tomorrow. Small, but it's real money on a boundary the ticket calls out.",
        cost: "Expired codes keep working for up to a day — a slow leak of margin that no one notices until finance asks.",
        trains: "Spotting the boundary bug hiding in plausible-looking date logic." },
      { area: "Config change", verdict: "ship",
        output: "Adds `PROMO_ENABLED` feature flag, defaulted off, read from env at startup.",
        why: "Sensible. Ships behind a flag defaulted off, so the feature can be enabled deliberately. Nothing to flag.",
        cost: "Blocking a safe, flag-gated rollout for no reason stalls the release.",
        trains: "Letting good operational hygiene through." },
    ],
    lesson: "The injection and the swallowed error were the two that would have been yours to answer for. The AI writes more code, faster — which means the judgment in the review is where your value now lives.",
  },

  "software-auth": {
    slug: "software-auth", career: "Software Engineering",
    short: "Review an AI-written admin endpoint against the ticket — authorization, audit, and safety.",
    client: "Admin API — “delete a user” endpoint",
    artifact: "feat-admin-delete-user.diff",
    thesis: "The AI opened a PR for a destructive admin action — it builds and the description is confident. Some of it should never merge. Approve only what's safe.",
    brief: [
      { l: "Ticket", v: "Admins can delete a user account by id" },
      { l: "Rule", v: "Only users with the admin role may call it" },
      { l: "Rule", v: "Destructive actions must be audit-logged" },
      { l: "Bar", v: "Soft-delete, and every path tested" },
    ],
    items: [
      { area: "Authorization check", verdict: "flag", severity: "critical",
        output: "`if (req.user) { await deleteUser(req.params.id) }` — checks logged-in, not role.",
        why: "It authenticates but doesn't authorize. Any logged-in user — not just admins — can delete any account by id. The exact rule the ticket states, missing.",
        cost: "A privilege-escalation hole on a destructive endpoint: any user deletes any account. This is the breach that makes the news, shipped under your approval.",
        trains: "Separating “is logged in” from “is allowed” — the check AI most often skips." },
      { area: "Rate limiting", verdict: "ship",
        output: "Endpoint is behind the existing admin rate-limit middleware (30 req/min).",
        why: "Fine. Reuses the standard admin rate limit — appropriate for the action.",
        cost: "Re-litigating a sensible reuse of existing middleware wastes time.",
        trains: "Recognizing sound reuse of existing controls." },
      { area: "Soft delete", verdict: "ship",
        output: "Sets `deleted_at = now()` and filters deleted users from queries, rather than hard-deleting.",
        why: "Correct and on-brief. Soft-delete as the ticket requires, with reads filtered. Good.",
        cost: "Demanding a hard delete would contradict the ticket.",
        trains: "Confirming the implementation matches the stated approach." },
      { area: "Audit logging", verdict: "flag", severity: "major",
        output: "No audit entry is written; the only record is a `console.log(user.email + ' ' + user.passwordHash)`.",
        why: "Two problems. The required audit log is missing — and the console line leaks a password hash into stdout. Destructive action, no trail, and sensitive data in the logs.",
        cost: "No record of who deleted whom (a compliance and forensics gap) plus password hashes sprayed into log aggregation. Both are incidents on their own.",
        trains: "Catching the missing audit trail and the sensitive data the machine logged." },
      { area: "Input handling", verdict: "flag", severity: "minor",
        output: "No check that the id exists or isn't the caller's own account before deleting.",
        why: "A small robustness gap. Deleting a non-existent id should 404, and an admin deleting their own account mid-session is a foot-gun worth blocking. Minor, but real.",
        cost: "Confusing 500s on bad ids and an admin able to lock themselves out — small bugs that generate support load.",
        trains: "Spotting the missing guard on the unhappy path." },
      { area: "Tests", verdict: "ship",
        output: "Tests cover: admin deletes a user (200), soft-delete flag set, deleted user hidden from list.",
        why: "Good coverage of the happy path and the soft-delete behavior from the ticket.",
        cost: "Blocking valid tests just delays the merge — the gap is the missing auth test, not these.",
        trains: "Confirming the tests exercise the stated behavior." },
    ],
    lesson: "The missing role check and the absent audit log (with a leaked hash) were the two that would have been yours to answer for. More AI-written code means the review is where your judgment now earns its keep.",
  },
};

export const GYM_LIST = Object.values(GYM_SCENARIOS);

/** Scenarios grouped by lane, so a member can return for a fresh rep each week. */
export function gymByLane(): { lane: string; reps: Scenario[] }[] {
  const byLane = new Map<string, Scenario[]>();
  for (const s of GYM_LIST) {
    const arr = byLane.get(s.career) ?? byLane.set(s.career, []).get(s.career)!;
    arr.push(s);
  }
  return [...byLane.entries()].map(([lane, reps]) => ({ lane, reps }));
}

export function scoreLine(missedCritical: number, missed: number, over: number): string {
  if (missedCritical > 0) return "A critical flaw shipped — that one would have been yours to answer for.";
  if (missed === 0 && over === 0) return "Clean sweep. You caught every buried flaw and let the good work through.";
  if (missed === 0) return "Every flaw caught. Ease off the good work — over-flagging costs trust too.";
  return "Solid, with gaps. Some buried flaws still shipped — that's where the reps pay off.";
}
