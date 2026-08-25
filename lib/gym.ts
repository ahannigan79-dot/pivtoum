/* The Judgment Gym — data-driven. The AI hands you polished, confident work;
   some of it is subtly wrong. Judge each piece Ship or Flag, then get scored.
   Adding a lane is just another Scenario here — no bespoke tool per career. */

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
  marketing: {
    slug: "marketing", career: "Marketing",
    short: "Judge an AI-built paid campaign against the brief — targeting, budget, claims, creative.",
    client: "FreshBowl — healthy meal delivery",
    artifact: "FreshBowl_Launch_Campaign.draft",
    thesis: "The AI has built a paid campaign to your brief — polished, confident, complete. Some of it is subtly wrong. Catch what doesn't hold, at speed, and ship only what's right.",
    brief: [
      { l: "Launch", v: "New high-protein range · 30g protein/bowl · from £7.99" },
      { l: "Audience", v: "Budget-conscious young professionals, ~25–35" },
      { l: "Budget", v: "£8,000 over 30 days" },
      { l: "Goal", v: "Free-trial signups" },
      { l: "Brand tone", v: "Upbeat, encouraging — no guilt" },
    ],
    items: [
      { area: "Audience targeting", verdict: "flag", severity: "major",
        output: "Adults 18–65 · Income: top 15% (£70k+) · Interests: fitness, wellness, meal kits · IG + TikTok feeds",
        why: "It contradicts the brief. You wanted budget-conscious professionals aged ~25–35 — this targets high earners (£70k+) across an 18–65 span. Finished-looking spec, pointed at the wrong people.",
        cost: "£8,000 spent reaching high earners who don't want budget meals. The campaign under-delivers and the client asks what they're paying you for.",
        trains: "Cross-checking AI output against the brief — reading for correctness, not polish." },
      { area: "Headline copy", verdict: "ship",
        output: "“30g of protein. Zero faff. New high-protein bowls, from £7.99.”",
        why: "This one is right. 30g matches, £7.99 matches, tone is on-brief. The specific price looks like somewhere AI would hallucinate — but it checks out.",
        cost: "Flagging good work sends it back for no reason — a delay, and a hit to trust when you cry wolf.",
        trains: "Proportionate scrutiny — not flagging good work just because it could have been wrong." },
      { area: "Budget allocation", verdict: "flag", severity: "minor",
        output: "£8,000 / 30 days — Instagram 70% (£5,400) · TikTok 30% (£2,400)",
        why: "The maths doesn't add up. 70% of £8,000 is £5,600, not £5,400 — and £5,400 + £2,400 = £7,800, leaving £200 unspent. Official-looking numbers you have to re-add.",
        cost: "£200 of the client's budget quietly goes unspent and your reported split is wrong. Small — but it's the sloppiness that erodes trust one detail at a time.",
        trains: "Re-doing the numbers the machine hands you — beating the lull of official-looking figures." },
      { area: "Creative concept", verdict: "ship",
        output: "Hero: 15-sec vertical — a commuter swaps a sad desk sandwich for a FreshBowl. End card: “Real food, real fast.”",
        why: "Solid. On-brief for time-poor young professionals, upbeat, no guilt. Nothing to flag.",
        cost: "Over-flagging good creative stalls the work and trains the team to route around you.",
        trains: "Recognising genuinely good work — and having the confidence to let it through." },
      { area: "Primary ad text", verdict: "flag", severity: "critical",
        output: "Opens with: “The healthiest meal you'll eat all week — guaranteed.”",
        why: "A regulatory landmine. An unsubstantiated absolute health claim plus “guaranteed” — exactly the line an ad-standards body pulls.",
        cost: "An ASA complaint. The ad is pulled, the brand takes a public hit, and it traces straight back to your sign-off — no one else's.",
        trains: "Domain scrutiny — spotting the claim that quietly becomes your legal accountability." },
      { area: "Call to action", verdict: "ship",
        output: "CTA button: “Start my free trial” → freshbowl.com/protein-trial",
        why: "On the money. Matches the goal (trial signups) and points to a sensible landing page.",
        cost: "Sending a correct CTA back for review just burns time you don't have.",
        trains: "Confirming the fundamentals are right — fast — and moving on." },
    ],
    lesson: "The wrong audience and the “guaranteed” claim were the two that would have been yours to answer for. Judging fast and right is the operator's edge — the machine drafts, you own the call.",
  },

  "audit-accounting": {
    slug: "audit-accounting", career: "Audit & Accounting",
    short: "Sign off an AI-drafted set of audit workpapers against the file — recognition, materiality, disclosure.",
    client: "Northwind Ltd — FY25 statutory audit",
    artifact: "Northwind_FY25_Workpapers.draft",
    thesis: "The AI has drafted the workpapers and conclusions for this audit — clean, referenced, confident. Some of it doesn't hold against the standards or the numbers. Sign off only what's right.",
    brief: [
      { l: "Engagement", v: "FY25 statutory audit, revenue £42.0m (PY £38.4m)" },
      { l: "Materiality", v: "Set at 1.5% of revenue for planning" },
      { l: "Key risk", v: "Revenue recognition on multi-year support contracts (IFRS 15)" },
      { l: "New this year", v: "A related-party lease with a director's company" },
      { l: "Standard", v: "UK GAAP / IFRS as applicable; document the basis" },
    ],
    items: [
      { area: "Materiality calculation", verdict: "flag", severity: "minor",
        output: "Planning materiality = 1.5% × £42.0m = £680,000.",
        why: "The arithmetic is off. 1.5% of £42.0m is £630,000, not £680,000. A number that sets the threshold for everything downstream, quietly wrong.",
        cost: "An inflated threshold lets ~£50k of misstatements pass untested. If it later matters, the file shows you approved the wrong basis.",
        trains: "Re-performing the figure that anchors the whole file, not trusting the machine's arithmetic." },
      { area: "Revenue recognition memo", verdict: "flag", severity: "critical",
        output: "“The full £1.2m on the 3-year support contract signed in June is recognised in FY25, as the contract is executed and non-cancellable.”",
        why: "Wrong under IFRS 15. Support delivered over time is a performance obligation satisfied over the three years — roughly £1.2m ÷ 3 in FY25, not the whole amount up front. Non-cancellable doesn't mean earned.",
        cost: "Revenue overstated by ~£800k — well over materiality. A misstated set of accounts with your name on the opinion, and a restatement risk.",
        trains: "Testing the AI's technical conclusion against the actual standard, not its confident phrasing." },
      { area: "Sample selection — receivables", verdict: "ship",
        output: "Selected 25 items: all balances > materiality, plus a random monetary-unit sample of the remainder.",
        why: "Sound. Covers everything individually material and gives representative coverage of the rest — a defensible sampling approach.",
        cost: "Re-designing a valid sample wastes hours and signals you can't tell good work from bad.",
        trains: "Recognising a methodologically sound approach and letting it stand." },
      { area: "Analytical review commentary", verdict: "flag", severity: "major",
        output: "“Gross margin rose 4 points; management attribute this to improved supplier terms. No further work required.”",
        why: "It accepts management's explanation without corroboration. A 4-point margin swing on a key risk is exactly what you're meant to substantiate — the AI wrote a plausible reason and closed the point.",
        cost: "An unexplained margin movement — potentially a recognition or cut-off error — goes untested. This is how real misstatements slip through.",
        trains: "Professional scepticism — refusing to let a tidy narrative substitute for evidence." },
      { area: "Going concern conclusion", verdict: "ship",
        output: "“Net current assets positive, facility renewed to 2027, 12-month cash forecast stress-tested. Going concern basis appropriate.”",
        why: "Appropriate and evidenced — headroom, a renewed facility, and a stress-tested forecast. The conclusion follows the work.",
        cost: "Second-guessing a well-supported conclusion delays sign-off for no gain.",
        trains: "Confirming a conclusion is actually backed by the evidence cited." },
      { area: "Related-party disclosure", verdict: "flag", severity: "critical",
        output: "The director's-company lease is recorded in operating costs; the related-party note lists “None requiring disclosure.”",
        why: "A required disclosure is missing. A lease with a director's company is a related-party transaction that must be disclosed — the AI booked the cost but never surfaced the relationship.",
        cost: "A non-compliant set of accounts and a governance red flag omitted from the file. This is the omission a regulator or the next auditor finds.",
        trains: "Catching what the machine leaves out — the missing disclosure is invisible unless you know to look." },
    ],
    lesson: "The recognition memo and the missing related-party note were the two that would have been yours to answer for. AI can draft the file at speed — but the opinion, and the accountability, are still human.",
  },

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
        trains: "Recognising a correct implementation and moving on." },
      { area: "Error handling", verdict: "flag", severity: "major",
        output: "`try { applyPromo() } catch (e) { return { ok: true } }`",
        why: "It swallows the error and returns success. A failed promo application reports OK — the discount silently doesn't apply, or worse, an error is hidden. Confident, and wrong.",
        cost: "Customers charged full price after “applying” a code, with no error surfaced — support tickets, chargebacks, and a bug that's invisible in the logs.",
        trains: "Catching the failure path the machine papered over — success returned on error." },
      { area: "Single-use test", verdict: "ship",
        output: "Test asserts the same code returns 409 on a second use by the same customer.",
        why: "Good. It covers the single-use rule from the ticket — the exact behaviour that matters, tested directly.",
        cost: "Demanding changes to a valid test just delays the merge.",
        trains: "Confirming the test actually exercises the requirement." },
      { area: "Expiry check", verdict: "flag", severity: "minor",
        output: "`if (promo.expires_at > now)` accept — using date-only comparison, ignoring time.",
        why: "An off-by-a-day edge. Comparing a date-only value means a code expiring today is honoured until tomorrow. Small, but it's real money on a boundary the ticket calls out.",
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

  "marketing-email": {
    slug: "marketing-email", career: "Marketing",
    short: "Sign off an AI-drafted win-back email to lapsed customers — offer, list, and claims.",
    client: "FreshBowl — lapsed-customer win-back",
    artifact: "FreshBowl_Winback_Email.draft",
    thesis: "The AI has drafted a re-engagement email to customers who've drifted — warm, on-brand, ready to send. Some of it will cost you if it goes out. Ship only what's right.",
    brief: [
      { l: "Audience", v: "Customers with no order in 90+ days" },
      { l: "Offer", v: "20% off the next order, one use per customer" },
      { l: "Goal", v: "Win-back orders — not unsubscribes" },
      { l: "Tone", v: "Warm, we-miss-you — never guilt-trippy" },
      { l: "Rule", v: "Marketing consent required; honour suppressions" },
    ],
    items: [
      { area: "Subject line", verdict: "ship",
        output: "“We saved your spot 🥗 — 20% off your next FreshBowl”",
        why: "On-brief. Warm, names the offer, no guilt. A clean subject line.",
        cost: "Rewriting a good subject line delays the send for nothing.",
        trains: "Recognising on-brand copy and letting it go." },
      { area: "Discount code setup", verdict: "flag", severity: "critical",
        output: "Code WELCOME20 — 20% off, stackable with active promotions, no minimum, unlimited uses.",
        why: "It contradicts the brief and the margin. “One use per customer” became unlimited and stackable — on top of live promos with no minimum. A margin bomb dressed as a win-back.",
        cost: "A discount that stacks and repeats with no floor — resold, shared, and combined with other offers. The campaign loses money on every order and finance traces it to this send.",
        trains: "Checking the offer mechanics against the brief, not just the headline number." },
      { area: "Send list", verdict: "flag", severity: "major",
        output: "Recipients: all 12,400 lapsed contacts, including 380 who previously unsubscribed.",
        why: "It includes unsubscribed contacts. Mailing people who opted out is a consent breach — and it tanks your deliverability with spam complaints.",
        cost: "A CAN-SPAM/GDPR breach and a deliverability hit that pushes your whole domain toward the spam folder. One of the most expensive mistakes in email.",
        trains: "Catching the suppression the machine quietly ignored." },
      { area: "Preheader", verdict: "ship",
        output: "“It's been a while — here's a little something to come back to.”",
        why: "Warm, on-tone, complements the subject. Nothing to flag.",
        cost: "Over-editing good supporting copy just adds cycles.",
        trains: "Proportionate scrutiny on the small stuff." },
      { area: "Body claim", verdict: "flag", severity: "minor",
        output: "“The best deal we've ever offered — you won't see 20% off again.”",
        why: "An unsubstantiated scarcity claim. You run 20% offers regularly; “you won't see it again” isn't true and erodes trust when the next one lands.",
        cost: "A small credibility leak — customers notice when “last chance” keeps coming back, and your future urgency stops working.",
        trains: "Spotting the claim that's technically false and quietly costs trust." },
      { area: "CTA & link", verdict: "ship",
        output: "Button “Reorder my favourite” → freshbowl.com/reorder",
        why: "Matches the goal and points to a sensible page. On the money.",
        cost: "Sending a correct CTA back burns time you don't have.",
        trains: "Confirming the fundamentals fast and moving on." },
    ],
    lesson: "The stackable code and the unsubscribed contacts were the two that would have been yours to answer for. The AI writes the email in seconds — you're the one who catches what it costs.",
  },

  "audit-tax": {
    slug: "audit-tax", career: "Audit & Accounting",
    short: "Sign off an AI-drafted inventory and tax provision — valuation, deferred tax, cut-off.",
    client: "Meridian Manufacturing — FY25 year-end",
    artifact: "Meridian_FY25_InventoryTax.draft",
    thesis: "The AI has drafted the inventory valuation and tax provision — referenced and confident. Some of it doesn't hold against the standards or the numbers. Sign off only what's right.",
    brief: [
      { l: "Inventory", v: "£6.4m at cost; includes a slow-moving product line" },
      { l: "NRV", v: "The slow-moving line now sells below cost" },
      { l: "Tax", v: "Corporation tax rate is 25% for FY25 (was 19%)" },
      { l: "Year-end", v: "Goods-in-transit at 31 Dec, FOB shipping point" },
    ],
    items: [
      { area: "NRV write-down", verdict: "flag", severity: "major",
        output: "“Inventory held at cost of £6.4m. No write-down required.”",
        why: "Wrong. Inventory is the lower of cost and net realisable value. The slow-moving line sells below cost, so it must be written down to NRV — the AI left it at cost.",
        cost: "Inventory and profit overstated by the write-down you skipped. A known impairment ignored — exactly what the standard exists to catch.",
        trains: "Applying lower-of-cost-and-NRV, not accepting “held at cost” at face value." },
      { area: "Standard cost variance", verdict: "ship",
        output: "Favourable variance of £40k released to cost of sales, immaterial and consistent with prior year.",
        why: "Reasonable. Immaterial and treated consistently — a defensible call.",
        cost: "Re-opening an immaterial, consistent treatment wastes time.",
        trains: "Letting a sound, immaterial judgement stand." },
      { area: "Deferred tax rate", verdict: "flag", severity: "critical",
        output: "Deferred tax on timing differences calculated at 19%.",
        why: "Wrong rate. Deferred tax is measured at the rate expected when the difference reverses — 25% for FY25, not the old 19%. A single wrong percentage flows through the whole provision.",
        cost: "The deferred tax liability is understated by a third. A material misstatement in the tax line, with your sign-off on it.",
        trains: "Checking the rate the machine used against the enacted rate, not last year's." },
      { area: "Inventory count coverage", verdict: "ship",
        output: "Attended count covered 92% of value; roll-forward reconciled to year-end with no exceptions.",
        why: "Sound. High value coverage and a clean roll-forward — a defensible basis.",
        cost: "Demanding more on a well-covered count just delays sign-off.",
        trains: "Confirming coverage is adequate and moving on." },
      { area: "Cut-off — goods in transit", verdict: "flag", severity: "minor",
        output: "Goods shipped 30 Dec (FOB shipping point) excluded from year-end inventory.",
        why: "A cut-off error. FOB shipping point means title passed on despatch — those goods are the buyer's at year-end and should be in inventory. Small, but it's the boundary you're meant to test.",
        cost: "Inventory understated and a cut-off error in the file — the kind of detail the next auditor re-performs and finds.",
        trains: "Getting the cut-off right on the shipping terms, not the invoice date." },
      { area: "Accounting policy note", verdict: "ship",
        output: "Policy note states inventory valued at lower of cost and NRV; cost on a FIFO basis.",
        why: "The disclosed policy is correct and standard — even though the AI failed to apply it above. The note itself is fine.",
        cost: "Flagging a correct policy note is a false positive.",
        trains: "Judging the note on its own merits — the policy is right even where the application wasn't." },
    ],
    lesson: "The deferred-tax rate and the missing NRV write-down were the two that would have been yours to answer for. The machine drafts the numbers — you're the one who stands behind them.",
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
        trains: "Recognising sound reuse of existing controls." },
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
        why: "Good coverage of the happy path and the soft-delete behaviour from the ticket.",
        cost: "Blocking valid tests just delays the merge — the gap is the missing auth test, not these.",
        trains: "Confirming the tests exercise the stated behaviour." },
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
