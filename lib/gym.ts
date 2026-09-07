/* The Judgment Gym — data-driven. The AI hands you polished, confident work;
   some of it is subtly wrong. Judge each piece Ship or Flag, then get scored.
   Adding a lane is just another Scenario here — no bespoke tool per career. */

import { ACCOUNTING_SCENARIOS } from "@/lib/gym-accounting";
import { MARKETING_SCENARIOS } from "@/lib/gym-marketing";

export type Severity = "minor" | "major" | "critical";

/** How the call is made: a fact you can verify against the inputs, or a judgment
 *  call that rests on experience with no clean formula. A great review needs both. */
export type JudgeMode = "fact" | "judgment";

/** The named AI failure patterns — so a miss teaches the *type*, not just the case. */
export type PatternKey = "fabrication" | "stale" | "unverified" | "omission" | "overreach" | "miscalc" | "security";
export const FAILURE_PATTERNS: Record<PatternKey, { label: string; note: string }> = {
  fabrication: { label: "Confident fabrication", note: "AI states something untrue with total fluency. The confidence is the trap — it reads exactly like the parts that are right." },
  stale:       { label: "Stale value", note: "AI uses last year's figure, an old rate, or a superseded rule. Plausible, because it was true once." },
  unverified:  { label: "Plausible but unverified", note: "AI accepts a tidy explanation and closes the point without checking the evidence. It writes a reasonable-sounding reason and moves on." },
  omission:    { label: "Silent omission", note: "AI leaves out something required. The most dangerous error, because there's nothing on the page to catch — you only see it if you know to look." },
  overreach:   { label: "Over-reach", note: "AI commits or promises beyond what's true, authorized, or in the contract — to be helpful. The over-commitment becomes your liability." },
  miscalc:     { label: "Arithmetic slip", note: "A clean-looking calculation that's simply wrong. AI is fluent, not reliably numerate — re-perform the figures that anchor the work." },
  security:    { label: "Security / safety hole", note: "Works in the demo, breaches in production. The happy path is fine; the gap is on the path AI didn't consider." },
};

export type GymItem = {
  area: string;              // the segment's label — a section / field / line of the artifact
  output: string;            // what the AI produced in that segment (the thing you're judging)
  verdict: "ship" | "flag";  // the correct call
  severity?: Severity;       // for flag items
  mode?: JudgeMode;          // fact-check vs experience judgment
  pattern?: PatternKey;      // for flag items — the AI failure pattern it belongs to
  why: string;               // why it's right/wrong
  cost: string;              // what getting it wrong costs
  trains: string;            // the judgment muscle it builds
};

/** The shape of the AI's output. Drives how the artifact is framed and rendered —
 *  an email reads as an email, a spreadsheet as a grid, code as a diff, and so on. */
export type ScenarioKind =
  | "document" | "email" | "spreadsheet" | "ticket" | "contract" | "code" | "message" | "order" | "memo";

/** How each artifact kind is framed in the UI — the chrome that makes a rep
 *  read like the real deliverable (a file, an email, a PR…). Single source of
 *  truth, shared by the landing page and the rep view. */
export const KIND_CHROME: Record<ScenarioKind, { icon: string; label: string }> = {
  document:    { icon: "📄", label: "Document" },
  email:       { icon: "✉️", label: "Email" },
  spreadsheet: { icon: "▦", label: "Spreadsheet" },
  ticket:      { icon: "🎫", label: "Ticket" },
  contract:    { icon: "§", label: "Contract" },
  code:        { icon: "‹∕›", label: "Pull request" },
  message:     { icon: "💬", label: "Message" },
  order:       { icon: "🧾", label: "Order" },
  memo:        { icon: "📝", label: "Memo" },
};

export type Scenario = {
  slug: string;
  career: string;
  short: string;             // one-line card blurb
  client: string;            // the subject of the brief
  artifact: string;          // the AI's deliverable filename / subject
  thesis: string;            // the intro framing
  brief: { l: string; v: string }[];
  items: GymItem[];
  lesson: string;            // closing line
  kind?: ScenarioKind;       // artifact shape (default: document)
  aiDid?: string;            // what the AI was responsible for — always visible while judging
  role?: string;            // the member's seat — "You're the auditor signing this off"
  parSecs?: number;          // the benchmark review time; default is complexity-derived
};

/** The AI failure pattern a flagged item belongs to — explicit when tagged, else
 *  inferred from the explanation so every miss still teaches a named pattern. */
export function patternFor(it: GymItem): PatternKey | null {
  if (it.verdict !== "flag") return null;
  if (it.pattern) return it.pattern;
  const s = `${it.why} ${it.area}`.toLowerCase();
  if (/injection|security|breach|privilege|exploit|leak|unauthenti|\bauth\b/.test(s)) return "security";
  if (/missing|omit|absent|left out|never (surfaced|disclosed|logged)|no (audit|disclosure|record)|not disclosed/.test(s)) return "omission";
  if (/guarantee|commit|promise|beyond|authoriz|exceeds|over-?commit|binding/.test(s)) return "overreach";
  if (/without (corroborat|checking|evidence)|accepts|at face value|no further work|unsubstantiat|didn't verify/.test(s)) return "unverified";
  if (/last year|prior year|old rate|superseded|stale|out of date|previous edition/.test(s)) return "stale";
  if (/arithmetic|off by|off-by|doesn't add|adds up|foots|wrong (number|rate|figure|amount)|miscalc|percentage|backwards|sign/.test(s)) return "miscalc";
  return "fabrication";
}

export const GYM_SCENARIOS: Record<string, Scenario> = {
  // Full 12-rep lanes live in their own modules. See lib/gym-accounting.ts, lib/gym-marketing.ts.
  ...ACCOUNTING_SCENARIOS,
  ...MARKETING_SCENARIOS,

  "software-review": {
    slug: "software-review", career: "Software Engineering",
    kind: "code",
    aiDid: "An AI coding agent wrote this entire pull request from the ticket — the code, the tests, and a confident description. It builds and the demo passes. Your job is the review: approve only what should merge.",
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
      { area: "Code lookup query", verdict: "flag", severity: "critical", mode: "fact", pattern: "security",
        output: "`db.query(\"SELECT * FROM promos WHERE code = '\" + input.code + \"'\")`",
        why: "SQL injection. The user's code is concatenated straight into the query on a public endpoint — the one thing the bar explicitly forbids. It works in the demo and is a breach in production.",
        cost: "A public, exploitable injection on checkout — data exfiltration or worse, shipped under your approval. The incident traces to this review.",
        trains: "Reading AI code for the security hole under the working feature, not just whether it runs." },
      { area: "Discount calculation", verdict: "ship", mode: "fact",
        output: "`const total = Math.max(0, subtotal - subtotal * (promo.percent / 100))`",
        why: "Correct. Applies the percentage and floors at zero so a large code can't produce a negative total. Clean and right.",
        cost: "Rewriting correct logic wastes the author's time and yours, and reads as not trusting good work.",
        trains: "Recognizing a correct implementation and moving on." },
      { area: "Error handling", verdict: "flag", severity: "major", mode: "fact", pattern: "fabrication",
        output: "`try { applyPromo() } catch (e) { return { ok: true } }`",
        why: "It swallows the error and returns success. A failed promo application reports OK — the discount silently doesn't apply, or worse, an error is hidden. Confident, and wrong.",
        cost: "Customers charged full price after “applying” a code, with no error surfaced — support tickets, chargebacks, and a bug that's invisible in the logs.",
        trains: "Catching the failure path the machine papered over — success returned on error." },
      { area: "Single-use test", verdict: "ship", mode: "fact",
        output: "Test asserts the same code returns 409 on a second use by the same customer.",
        why: "Good. It covers the single-use rule from the ticket — the exact behavior that matters, tested directly.",
        cost: "Demanding changes to a valid test just delays the merge.",
        trains: "Confirming the test actually exercises the requirement." },
      { area: "Expiry check", verdict: "flag", severity: "minor", mode: "fact", pattern: "miscalc",
        output: "`if (promo.expires_at > now)` accept — using date-only comparison, ignoring time.",
        why: "An off-by-a-day edge. Comparing a date-only value means a code expiring today is honored until tomorrow. Small, but it's real money on a boundary the ticket calls out.",
        cost: "Expired codes keep working for up to a day — a slow leak of margin that no one notices until finance asks.",
        trains: "Spotting the boundary bug hiding in plausible-looking date logic." },
      { area: "Config change", verdict: "ship", mode: "judgment",
        output: "Adds `PROMO_ENABLED` feature flag, defaulted off, read from env at startup.",
        why: "Sensible. Ships behind a flag defaulted off, so the feature can be enabled deliberately. Nothing to flag.",
        cost: "Blocking a safe, flag-gated rollout for no reason stalls the release.",
        trains: "Letting good operational hygiene through." },
    ],
    lesson: "The injection and the swallowed error were the two that would have been yours to answer for. The AI writes more code, faster — which means the judgment in the review is where your value now lives.",
  },

  "software-auth": {
    slug: "software-auth", career: "Software Engineering",
    kind: "code",
    aiDid: "An AI coding agent built this destructive admin endpoint from the ticket, tests and all. It builds and reads clean. Some of it should never merge — your review is the gate.",
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

  "sales-renewal-email": {
    slug: "sales-renewal-email", career: "Sales & Account Management",
    kind: "email",
    aiDid: "AI drafted this client renewal email from the CRM notes and the signed contract. It's warm, confident, and ready to send. Some lines don't match the contract or your authority — you're the one hitting send.",
    short: "Sign off an AI-drafted client renewal email against the contract — numbers, promises, and authority.",
    client: "Meridian Corp — annual renewal email to Sarah (buyer)",
    artifact: "Re: Your Meridian renewal ✨",
    thesis: "The AI drafted a warm, polished renewal email to a key client — it reads perfectly. Some of it over-promises, misprices, or commits things you can't. Send only what's true and within your authority.",
    brief: [
      { l: "Account", v: "Meridian Corp · current ARR $84,000 · renewal due" },
      { l: "Contract", v: "Uptime SLA 99.5% · annual price uplift capped at 5%" },
      { l: "List renewal", v: "$88,200 (the 5% uplift)" },
      { l: "Authority", v: "Discounts over 10% need VP sign-off; never commit an SLA beyond contract" },
      { l: "Goal", v: "A warm renewal email that confirms terms and protects the relationship" },
    ],
    items: [
      { area: "Opening", verdict: "ship", mode: "judgment",
        output: "“Hi Sarah — it's been a strong year working together, and the team has genuinely valued partnering with you on the rollout.”",
        why: "Warm, accurate, on-brand. A good relationship opener with nothing to correct.",
        cost: "Rewriting a perfectly good opener wastes time and dulls the warmth.",
        trains: "Letting genuinely good copy through." },
      { area: "Renewal price", verdict: "flag", severity: "major", mode: "fact", pattern: "miscalc",
        output: "“Your renewal comes in at $92,400 for the year — a small increase in line with your agreement.”",
        why: "Wrong, and it breaches the contract. A 5% uplift on $84,000 is $88,200. $92,400 is a 10% increase — over the contractual cap, sent in writing as \"in line with your agreement.\"",
        cost: "You overbill by $4,200 and breach the price cap on the way — a dispute, a credit note, and a dent in trust at exactly the wrong moment.",
        trains: "Re-performing the number against the contract, not trusting a confident figure." },
      { area: "SLA commitment", verdict: "flag", severity: "critical", mode: "fact", pattern: "overreach",
        output: "“And yes — we can absolutely guarantee 99.9% uptime going forward.”",
        why: "The contract SLA is 99.5%. Committing 99.9% in writing over-promises beyond both the contract and what operations can stand behind — a new, unbacked liability created in one friendly line.",
        cost: "A written commitment you can't keep. The first breach triggers penalties or a churn conversation, and it traces to this email.",
        trains: "Catching the over-promise the AI made to sound helpful." },
      { area: "Goodwill discount", verdict: "flag", severity: "major", mode: "fact", pattern: "overreach",
        output: "“To say thanks for your loyalty, I've applied a 15% discount to this renewal.”",
        why: "Over your authority. Discounts above 10% need VP sign-off, and this commits 15% to the client in writing before anyone approved it.",
        cost: "An unauthorized ~$13k giveaway you can't walk back without looking like you're clawing it away — worse for the relationship than never offering it.",
        trains: "Knowing the limit of your own authority before the machine spends it for you." },
      { area: "Next step", verdict: "ship", mode: "judgment",
        output: "“I'd love to set up a call next week to walk through the roadmap and hear what's next for your team.”",
        why: "Appropriate, genuine relationship-building — exactly the human touch that keeps the account. Nothing to flag.",
        cost: "Cutting a warm, well-judged next step removes the point of the email.",
        trains: "Recognizing the relationship move worth keeping." },
      { area: "Sign-off", verdict: "flag", severity: "critical", mode: "judgment", pattern: "fabrication",
        output: "“Consider this email your binding renewal confirmation — no further paperwork needed.”",
        why: "An email isn't the executed renewal. Declaring it \"binding, no paperwork\" invents a contract-formation claim that skips the signed order — and does it on terms that are already wrong.",
        cost: "A legal mess: is there now a binding contract, on incorrect price and SLA? Untangling it costs far more than the renewal.",
        trains: "Spotting where the AI casually created legal exposure." },
    ],
    lesson: "The mispriced renewal, the 99.9% promise, and the \"binding, no paperwork\" line were the three that would have been yours to answer for. AI writes a warm, confident client email in seconds — but a wrong number or an over-promise in writing is a real liability, and catching it before send is the judgment you're paid for.",
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

/* ── Cost model ─────────────────────────────────────────────────────────────
   The gym is a review under real pressure, not a quiz. Three things cost money:
   a buried flaw you ship (by severity), good work you over-flag (rework + trust),
   and time — every minute past the benchmark pace is a minute a human elsewhere
   is faster, and slowness in an AI workflow is a cost. Lower total wins. */
export const MISS_COST: Record<Severity, number> = { critical: 40000, major: 8000, minor: 1500 };
export const OVERFLAG_COST = 900;      // rework + "doesn't trust good work" per over-flag
export const OVERTIME_PER_MIN = 600;   // the value of review time past the benchmark
/** The benchmark review time — complexity-aware, not just item count. A judgment
 *  call takes longer than a fact-check, and a long, dense segment longer than a
 *  one-liner. So a harder rep earns a longer clock before the cost starts. */
export function scenarioPar(s: Scenario): number {
  if (s.parSecs) return s.parSecs;
  const secs = s.items.reduce((t, it) => {
    let sec = 9;                                               // base: read the segment + decide
    if (it.mode === "judgment") sec += 7;                      // no formula — weigh it
    sec += Math.min(12, Math.floor((it.output?.length ?? 0) / 55)); // longer/denser content, more time
    return t + sec;
  }, 0);
  return Math.max(45, secs);
}

export type ReviewCost = { missed: number; over: number; time: number; total: number; overSecs: number };

/** Dollarise a completed rep: shipped flaws (by severity) + over-flags + time past par. */
export function reviewCost(
  s: Scenario,
  choices: Record<number, "ship" | "flag">,
  secs: number,
): ReviewCost {
  let missed = 0, over = 0;
  s.items.forEach((it, i) => {
    const c = choices[i];
    if (it.verdict === "flag" && c === "ship") missed += MISS_COST[it.severity ?? "minor"];
    if (it.verdict === "ship" && c === "flag") over += OVERFLAG_COST;
  });
  const overSecs = Math.max(0, secs - scenarioPar(s));
  const time = Math.round((overSecs / 60) * OVERTIME_PER_MIN);
  return { missed, over, time, total: missed + over + time, overSecs };
}

export function money(n: number): string {
  return "$" + Math.round(n).toLocaleString();
}
