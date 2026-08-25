/* Workflow Rebuild — a library of examples. Career → Lane → a few workflow
   variants each, so a member can see many concrete rebuilds. Each variant is a
   today-vs-AI-native flow; the ladder and the five moves are shared framework
   content rendered alongside every one. Adding a variant is just more data. */

export type RebuildStep = { label: string; today: string; own: string; ai: string; you: string };
export type RebuildVariant = {
  slug: string; title: string; field: string; short: string; thesis: string;
  steps: RebuildStep[];
  delta: { v: string; l: string }[];
  pull: string;
};
export type RebuildLane = { slug: string; name: string; variants: RebuildVariant[] };
export type CareerRebuild = { slug: string; career: string; blurb: string; lanes: RebuildLane[] };

const closeMonth: RebuildVariant = {
  slug: "audit-close", title: "Close and audit the month", field: "Assurance & reporting",
  short: "Month-end close and audit prep — reconcile, review, test, report.",
  thesis: "The backbone workflow of the finance function — done the way it's done today, then rebuilt AI-native. Watch what the machine takes, and where the human moves up.",
  steps: [
    { label: "Gather & reconcile", today: "Chase spreadsheets, tie out ledgers, reconcile accounts by hand.", own: "the exceptions", ai: "ingests the ledgers and reconciles automatically", you: "investigate the breaks the machine flags." },
    { label: "Journals & accruals", today: "Book accruals and adjustments manually, line by line.", own: "the estimates", ai: "proposes standard entries from the patterns", you: "own the judgemental estimates and provisions." },
    { label: "Analytical review", today: "Build variance analyses in Excel, hunt for what moved.", own: "the “why”", ai: "surfaces every material variance instantly", you: "decide which movements need real explanation." },
    { label: "Sampling & testing", today: "Pull samples, vouch to support, document the papers.", own: "the scope", ai: "tests the full population and drafts the papers", you: "set the risk-based scope and sign the conclusions." },
    { label: "Disclosures", today: "Draft the notes, cross-check the standards by hand.", own: "the technical call", ai: "drafts the notes and flags likely disclosures", you: "own the technical judgement and completeness." },
    { label: "Opinion & report", today: "Compile the file, write the memo, format the report.", own: "the opinion", ai: "assembles the file and drafts the narrative", you: "own the opinion and the accountability for it." },
  ],
  delta: [{ v: "Days → hours", l: "Close and tie-out cycle" }, { v: "Sample → 100%", l: "Population tested" }, { v: "Team of 4 → 1+AI", l: "People to run the close" }],
  pull: "The work moves from preparing the numbers to standing behind them — and the opinion is still yours alone.",
};

const planAudit: RebuildVariant = {
  slug: "audit-plan", title: "Plan and scope an audit", field: "Assurance & reporting",
  short: "Risk assessment and audit planning — understand the entity, scope the work.",
  thesis: "Before any testing, the audit is planned — risks assessed, materiality set, scope drawn. Here's that workflow today, then rebuilt AI-native.",
  steps: [
    { label: "Understand the entity", today: "Read prior files, industry reports, board minutes — days of reading.", own: "the risk story", ai: "summarises the history, filings and sector in minutes", you: "form the view of where this entity could go wrong." },
    { label: "Assess risk", today: "Draft the risk assessment from experience and checklists.", own: "the risk calls", ai: "proposes risks from the data and prior findings", you: "decide which risks are real and significant." },
    { label: "Set materiality", today: "Calculate materiality, document the basis by hand.", own: "the basis", ai: "computes the options against benchmarks", you: "choose and justify the basis for this engagement." },
    { label: "Design the approach", today: "Decide controls vs substantive, build the programme.", own: "the strategy", ai: "drafts a tailored audit programme", you: "own the audit strategy and where to push hardest." },
    { label: "Scope & resource", today: "Estimate hours, staff the job, build the timeline.", own: "the trade-offs", ai: "models the plan and flags the pinch points", you: "make the scope and resourcing trade-offs." },
    { label: "Team brief", today: "Write the planning memo, brief the team.", own: "the direction", ai: "drafts the memo from the plan", you: "own the direction and what the team must not miss." },
  ],
  delta: [{ v: "Days → hours", l: "Time to a planned audit" }, { v: "Checklist → tailored", l: "Risk assessment per entity" }, { v: "Senior-led → senior-owned", l: "Where the judgement sits" }],
  pull: "The machine drafts the plan; you own the risk calls that decide whether the audit finds what matters.",
};

const taxReturn: RebuildVariant = {
  slug: "tax-return", title: "Prepare a corporate tax return", field: "Tax & compliance",
  short: "Compute the tax, prepare the return, file it — accurately and on time.",
  thesis: "The recurring compliance workflow of every tax team — done the way it's done today, then rebuilt AI-native.",
  steps: [
    { label: "Gather the data", today: "Collect accounts, schedules and prior returns; chase gaps.", own: "the completeness", ai: "pulls and structures the source data", you: "judge what's missing and what looks wrong." },
    { label: "Adjust the profit", today: "Work through add-backs and allowances by hand.", own: "the treatment", ai: "proposes the standard adjustments", you: "own the treatment where the rules are grey." },
    { label: "Compute the tax", today: "Build the computation, apply rates and reliefs.", own: "the reliefs", ai: "runs the computation and tests relief options", you: "decide which positions to take, and how hard." },
    { label: "Review", today: "Second-partner review, tie back to the accounts.", own: "the risk", ai: "cross-checks and flags the anomalies", you: "own the risk of every position on the return." },
    { label: "Prepare the return", today: "Populate the forms, draft the disclosures.", own: "the disclosure", ai: "fills the return and drafts disclosures", you: "own what to disclose and how much." },
    { label: "File & advise", today: "Submit, then write the client note.", own: "the advice", ai: "drafts the filing and the client summary", you: "own the advice and the planning for next year." },
  ],
  delta: [{ v: "Days → hours", l: "Return preparation time" }, { v: "Manual → checked", l: "Every figure cross-tested" }, { v: "Prep-heavy → advice-heavy", l: "Where your time goes" }],
  pull: "Compliance collapses to minutes — and your value moves to the positions taken and the advice around them.",
};

const taxAdvisory: RebuildVariant = {
  slug: "tax-advisory", title: "Advise on a transaction", field: "Tax & compliance",
  short: "Structure a deal or transaction — options, risk, and the recommendation.",
  thesis: "The high-value end of tax: advising on how to structure something before it happens. Here's that workflow today, then rebuilt AI-native.",
  steps: [
    { label: "Understand the deal", today: "Read the terms, map the parties and the goal.", own: "the real objective", ai: "summarises the structure and the moving parts", you: "pin down what the client actually needs to achieve." },
    { label: "Research the law", today: "Work through legislation, cases and guidance for days.", own: "the interpretation", ai: "surfaces the relevant law and precedents fast", you: "interpret where it's unsettled or arguable." },
    { label: "Model the options", today: "Build the scenarios and the tax outcomes by hand.", own: "the trade-offs", ai: "models every option and the numbers", you: "weigh the trade-offs beyond the tax." },
    { label: "Assess the risk", today: "Judge challenge risk from experience.", own: "the risk appetite", ai: "flags the aggressive positions and exposure", you: "own the call on how much risk to take." },
    { label: "Recommend", today: "Write the advice, caveat it, present.", own: "the recommendation", ai: "drafts the advice from the analysis", you: "own the recommendation you put your name to." },
    { label: "Support the deal", today: "Answer questions, defend the position live.", own: "the defence", ai: "prepares the answers and the file", you: "own the position when it's challenged." },
  ],
  delta: [{ v: "Days → hours", l: "Research and modelling time" }, { v: "One option → all options", l: "Scenarios modelled" }, { v: "Analysis → judgement", l: "Where your value sits" }],
  pull: "The research and the modelling are the machine's now — the recommendation, and the risk you take on it, are yours.",
};

const paidCampaign: RebuildVariant = {
  slug: "paid-campaign", title: "Run a paid campaign", field: "Performance & paid",
  short: "Plan, build, launch and optimise a paid media campaign.",
  thesis: "The most common workflow in performance marketing — done the way it's done today, then rebuilt AI-native. Watch what the machine takes, and where the human moves up.",
  steps: [
    { label: "Brief & research", today: "Read the goal, dig through audience data, size up competitors.", own: "the angle", ai: "synthesises the research in minutes", you: "set the strategic angle and the “why now.”" },
    { label: "Creative", today: "Write 5–10 ad variants, brief a designer, iterate over days.", own: "brand taste", ai: "generates 50 on-brief variants instantly", you: "curate for brand truth and kill the off-brand." },
    { label: "Build & target", today: "Set targeting, budgets and placements by hand.", own: "the guardrails", ai: "configures it from the brief", you: "approve the spend logic and set the guardrails." },
    { label: "Launch & monitor", today: "Watch the dashboards daily, pause the losers manually.", own: "the exceptions", ai: "monitors in real time and reallocates budget", you: "handle the exceptions and escalations." },
    { label: "Optimise", today: "Shift budget and tweak creative weekly.", own: "the bets", ai: "runs continuous multivariate testing", you: "own the creative bets and which way to push." },
    { label: "Report", today: "Pull the numbers, build the deck, present.", own: "the story", ai: "writes the narrative from the data", you: "own the story to the client and the next-quarter call." },
  ],
  delta: [{ v: "Days → hours", l: "Full campaign cycle time" }, { v: "Team of 3 → 1+AI", l: "People to run it" }, { v: "~10×", l: "Creative volume" }],
  pull: "The bottleneck moves from making to judging — and judgment is the part AI can't do for you.",
};

const paidReport: RebuildVariant = {
  slug: "paid-report", title: "Build the monthly performance review", field: "Performance & paid",
  short: "Pull the numbers, find the story, present the review to the client.",
  thesis: "The recurring reporting workflow that eats a marketer's month-end — done today, then rebuilt AI-native.",
  steps: [
    { label: "Pull the data", today: "Export from every platform, stitch it in a spreadsheet.", own: "the definitions", ai: "aggregates every source automatically", you: "own what each metric actually means." },
    { label: "Find the story", today: "Eyeball the trends, hunt for what changed.", own: "the insight", ai: "surfaces the significant movements", you: "decide which movements are the real story." },
    { label: "Explain it", today: "Reason about causes from memory of the month.", own: "the causation", ai: "correlates changes to campaign events", you: "judge cause from coincidence." },
    { label: "Build the deck", today: "Format slides, charts and commentary for hours.", own: "the narrative", ai: "drafts the deck and the commentary", you: "own the narrative and what to lead with." },
    { label: "Recommend", today: "Decide next month's plan from the results.", own: "the plan", ai: "proposes options from the performance", you: "own the recommendation and the budget call." },
    { label: "Present", today: "Walk the client through it, handle the questions.", own: "the relationship", ai: "prepares the Q&A and the backup", you: "own the room and the trust." },
  ],
  delta: [{ v: "A day → minutes", l: "Report assembly time" }, { v: "Description → insight", l: "What the review delivers" }, { v: "Reporting → advising", l: "Your role in the room" }],
  pull: "Assembling the report stops being the job — reading it, and owning the recommendation, becomes it.",
};

const contentPiece: RebuildVariant = {
  slug: "content-piece", title: "Produce a content piece", field: "Content & SEO",
  short: "Research, write, edit and publish a piece of content.",
  thesis: "The core content workflow — done the way it's done today, then rebuilt AI-native.",
  steps: [
    { label: "Research the topic", today: "Read around the subject, gather sources for hours.", own: "the angle", ai: "assembles the research and the sources", you: "choose the angle only you would take." },
    { label: "Outline", today: "Structure the argument, plan the sections.", own: "the structure", ai: "proposes an outline from the research", you: "own the structure and what to cut." },
    { label: "Draft", today: "Write it, paragraph by paragraph, over a day.", own: "the voice", ai: "drafts the full piece in minutes", you: "rewrite for voice, truth and the parts that matter." },
    { label: "Fact-check", today: "Verify every claim and link by hand.", own: "the accuracy", ai: "flags claims to verify and likely errors", you: "own the accuracy and what carries your name." },
    { label: "Edit & optimise", today: "Polish, tighten, add the SEO elements.", own: "the judgement", ai: "suggests edits and optimises for search", you: "judge which edits keep the piece human." },
    { label: "Publish & distribute", today: "Format, publish, write the social posts.", own: "the framing", ai: "handles formatting and drafts distribution", you: "own how it's framed to the audience." },
  ],
  delta: [{ v: "A day → an hour", l: "Draft to publish" }, { v: "Writing → editing", l: "Where the craft moves" }, { v: "Volume unlocked", l: "Pieces you can ship" }],
  pull: "Anyone can generate a draft now — the value is the angle, the truth, and the taste that makes it worth reading.",
};

const seoStrategy: RebuildVariant = {
  slug: "seo-strategy", title: "Plan an SEO content strategy", field: "Content & SEO",
  short: "Research keywords, map the content, plan the roadmap.",
  thesis: "The strategic workflow behind organic growth — done today, then rebuilt AI-native.",
  steps: [
    { label: "Keyword research", today: "Pull keywords across tools, judge intent and volume.", own: "the priorities", ai: "gathers and clusters the whole keyword space", you: "decide which clusters are worth winning." },
    { label: "Analyse competitors", today: "Audit what's ranking and why, manually.", own: "the gaps", ai: "maps competitor coverage and gaps", you: "spot the gap only you can credibly fill." },
    { label: "Map the content", today: "Plan the pages and how they interlink.", own: "the architecture", ai: "proposes the content map and structure", you: "own the architecture and the bets." },
    { label: "Prioritise", today: "Sequence the roadmap by effort and payoff.", own: "the roadmap", ai: "models effort vs opportunity", you: "make the roadmap call under constraints." },
    { label: "Brief the work", today: "Write briefs for each piece by hand.", own: "the standard", ai: "drafts detailed briefs from the plan", you: "set the standard each piece must hit." },
    { label: "Measure & adjust", today: "Track rankings, react over months.", own: "the strategy", ai: "monitors and flags what's working", you: "own when to double down or change course." },
  ],
  delta: [{ v: "Weeks → days", l: "Research to roadmap" }, { v: "Sample → full space", l: "Keyword coverage" }, { v: "Doing → directing", l: "Where you add value" }],
  pull: "The research is instant now — the edge is the bets: which ground to fight for, and which to leave.",
};

const shipFeature: RebuildVariant = {
  slug: "ship-feature", title: "Ship a feature", field: "Product engineering",
  short: "Scope, build, test, review and ship a product feature.",
  thesis: "The core loop of building software — done the way it's done today, then rebuilt AI-native. Watch what the machine takes, and where the human moves up.",
  steps: [
    { label: "Scope & design", today: "Read the ticket, sketch the approach, weigh trade-offs.", own: "the architecture", ai: "drafts an approach and the trade-offs", you: "own the architecture and the constraints that matter." },
    { label: "Write the code", today: "Implement it by hand, function by function.", own: "the review", ai: "writes most of the implementation from the spec", you: "review it hard for the bug under the working feature." },
    { label: "Tests", today: "Write unit and integration tests by hand.", own: "the edge cases", ai: "generates the test suite", you: "define the edge cases and what “correct” means." },
    { label: "Review", today: "Open a PR, wait, address comments across days.", own: "the standards", ai: "self-reviews and explains the diff", you: "hold the bar on security, correctness and design." },
    { label: "Debug & fix", today: "Reproduce, bisect, patch — the slow part.", own: "the diagnosis", ai: "proposes fixes from the stack trace", you: "own the root-cause call, not the symptom patch." },
    { label: "Ship & operate", today: "Deploy, watch metrics, roll back if it breaks.", own: "the risk call", ai: "gates the rollout and watches the signals", you: "own the risk decision and the incident call." },
  ],
  delta: [{ v: "Days → hours", l: "Ticket to merged PR" }, { v: "Writing → reviewing", l: "Where the time goes" }, { v: "~10×", l: "Code volume" }],
  pull: "The value moves from writing the code to judging it — the review is where your edge now lives.",
};

const fixIncident: RebuildVariant = {
  slug: "fix-incident", title: "Resolve a production incident", field: "Product engineering",
  short: "Detect, diagnose, mitigate and learn from a live outage.",
  thesis: "The highest-pressure engineering workflow — done today, then rebuilt AI-native.",
  steps: [
    { label: "Detect & triage", today: "Alerts fire; scramble to judge severity.", own: "the severity call", ai: "correlates the signals and proposes severity", you: "own the call on how bad this is." },
    { label: "Diagnose", today: "Dig through logs and traces to find the cause.", own: "the root cause", ai: "surfaces the likely cause from the telemetry", you: "confirm the real cause vs the plausible one." },
    { label: "Mitigate", today: "Decide the fix or rollback under pressure.", own: "the call", ai: "proposes mitigations and their blast radius", you: "own the decision with the customers live." },
    { label: "Communicate", today: "Update status, stakeholders, customers.", own: "the message", ai: "drafts the updates from the state", you: "own what's said and what's promised." },
    { label: "Recover", today: "Verify, restore, watch it hold.", own: "the all-clear", ai: "monitors recovery and flags regressions", you: "own the call that it's actually over." },
    { label: "Post-mortem", today: "Write it up, find the actions.", own: "the lessons", ai: "drafts the timeline and candidate actions", you: "own the honest lessons and what changes." },
  ],
  delta: [{ v: "Hours → minutes", l: "Detection to diagnosis" }, { v: "Guesswork → evidence", l: "How you find the cause" }, { v: "Reacting → deciding", l: "Where your value sits" }],
  pull: "The machine finds the cause faster than you can — but the call, under pressure and in public, is still yours.",
};

const dataPipeline: RebuildVariant = {
  slug: "data-pipeline", title: "Build a data pipeline", field: "Data & analytics",
  short: "Ingest, transform, validate and serve data reliably.",
  thesis: "The plumbing behind every dashboard and model — done today, then rebuilt AI-native.",
  steps: [
    { label: "Understand the need", today: "Work out what data, for whom, and why.", own: "the requirement", ai: "drafts the spec from the request", you: "judge what's really needed vs asked for." },
    { label: "Model the data", today: "Design the schema and the transforms.", own: "the model", ai: "proposes a schema and transforms", you: "own the data model and its trade-offs." },
    { label: "Build it", today: "Write the ingestion and transform code.", own: "the review", ai: "generates the pipeline code", you: "review it for correctness and cost." },
    { label: "Validate", today: "Write checks, hunt for bad data.", own: "the trust", ai: "generates data-quality tests", you: "decide what “trustworthy” means here." },
    { label: "Deploy & schedule", today: "Wire up orchestration and alerts.", own: "the reliability", ai: "configures scheduling and monitoring", you: "own the reliability the business depends on." },
    { label: "Maintain", today: "Fix breakages, adapt to source changes.", own: "the judgement", ai: "flags breakages and proposes fixes", you: "own the call on what to fix and how." },
  ],
  delta: [{ v: "Weeks → days", l: "Idea to live pipeline" }, { v: "Spot-checks → full validation", l: "Data-quality coverage" }, { v: "Building → owning", l: "Where your value sits" }],
  pull: "The code is the fast part now — the value is the model, the trust in the data, and the reliability you stand behind.",
};

const dataQuestion: RebuildVariant = {
  slug: "data-question", title: "Answer a business question with data", field: "Data & analytics",
  short: "Turn a fuzzy question into an analysis and a recommendation.",
  thesis: "The analyst's core loop — turning a question into a decision — done today, then rebuilt AI-native.",
  steps: [
    { label: "Frame the question", today: "Interrogate the ask until it's answerable.", own: "the real question", ai: "proposes sharper versions of the ask", you: "own what's actually being decided." },
    { label: "Get the data", today: "Find and pull the right tables, join them.", own: "the sources", ai: "locates and assembles the data", you: "judge whether it's the right data." },
    { label: "Analyse", today: "Slice it, test hypotheses, iterate.", own: "the hypotheses", ai: "runs the analysis and tests hypotheses", you: "decide which cuts actually matter." },
    { label: "Check it", today: "Sanity-check the numbers, catch the errors.", own: "the rigour", ai: "flags anomalies and likely mistakes", you: "own whether the result is real." },
    { label: "Tell the story", today: "Build the charts and the narrative.", own: "the message", ai: "drafts the visuals and the write-up", you: "own the message and what to leave out." },
    { label: "Recommend", today: "Turn the finding into a decision.", own: "the recommendation", ai: "proposes actions from the finding", you: "own the recommendation to the business." },
  ],
  delta: [{ v: "Days → hours", l: "Question to answer" }, { v: "One cut → many", l: "Hypotheses tested" }, { v: "Analysis → judgement", l: "Where you add value" }],
  pull: "Anyone can generate an analysis now — the value is framing the right question and standing behind the recommendation.",
};

export const REBUILDS: CareerRebuild[] = [
  {
    slug: "accounting", career: "Audit & Accounting", blurb: "Assurance and tax — the core finance workflows.",
    lanes: [
      { slug: "audit", name: "Audit & Assurance", variants: [closeMonth, planAudit] },
      { slug: "tax", name: "Tax", variants: [taxReturn, taxAdvisory] },
    ],
  },
  {
    slug: "marketing", career: "Marketing", blurb: "Paid performance and content — how growth gets made.",
    lanes: [
      { slug: "paid", name: "Performance & Paid", variants: [paidCampaign, paidReport] },
      { slug: "content", name: "Content & SEO", variants: [contentPiece, seoStrategy] },
    ],
  },
  {
    slug: "software", career: "Software Engineering", blurb: "Building products and working with data.",
    lanes: [
      { slug: "product", name: "Product Engineering", variants: [shipFeature, fixIncident] },
      { slug: "data", name: "Data & Analytics", variants: [dataPipeline, dataQuestion] },
    ],
  },
];

export const CAREER_BY_SLUG: Record<string, CareerRebuild> = Object.fromEntries(REBUILDS.map((c) => [c.slug, c]));

export type VariantHit = { career: CareerRebuild; lane: RebuildLane; variant: RebuildVariant };
export function findVariant(careerSlug: string, variantSlug: string): VariantHit | null {
  const career = CAREER_BY_SLUG[careerSlug];
  if (!career) return null;
  for (const lane of career.lanes) {
    const variant = lane.variants.find((v) => v.slug === variantSlug);
    if (variant) return { career, lane, variant };
  }
  return null;
}

export function careerVariantCount(c: CareerRebuild): number {
  return c.lanes.reduce((n, l) => n + l.variants.length, 0);
}

/* ── Shared framework content — the same alongside every rebuild ─────────── */

export type Rung = { who: string; risk: string; tone: "new" | "hi" | "md" | "lo"; what: string; move: string };
export const LADDER: Rung[] = [
  { who: "Studying / very early", risk: "◆ Enter AI-native", tone: "new",
    what: "You're not on the ladder yet — and the entry rungs you'd have started on are the first to vanish. But you hold the one advantage no one above you has: no habits to unlearn.",
    move: "Go AI-native from day one — make it the thing that sets you apart, and learn how these workflows really run." },
  { who: "Junior", risk: "▾ Highest exposure", tone: "hi",
    what: "Your job was the production — and that's exactly what automates first. The rung you'd normally climb is the rung that's disappearing.",
    move: "Don't wait your turn up a shortening ladder. Direct the tools from day one and skip straight to the judgment work." },
  { who: "Mid-level", risk: "▾ Squeezed", tone: "md",
    what: "Execution was half your value — and now it collapses to minutes. You're caught between automated production below and senior judgment above.",
    move: "Move up, fast. Own the strategy and the calls, not the button-pushing — become the one who directs the machine." },
  { who: "Senior", risk: "▴ Biggest opportunity", tone: "lo",
    what: "Least exposed and most amplified — your value is taste, the strategic call, the relationship. And now one of you plus AI does the work of a whole team. Two catches: someone below you will go AI-native first if you don't, and the judgment is now yours alone — no one left to blame.",
    move: "Become the AI-native operator before someone below you does. Own the judgment and the relationships, and lead how your team adopts." },
];

export type RebuildMove = { n: string; title: string; edge: "master" | "deepen" | "both"; do: string; sit: string; week: string; keystone?: boolean };
export const MOVES: RebuildMove[] = [
  { n: "01", title: "Investigate the transformation", edge: "master",
    do: "Study how AI is actually remaking your field — not the hype, the real use cases. Tour the AI-native tools running the work today and ask what each genuinely takes and amplifies.",
    sit: "Which of these could run a piece of my job tomorrow?", week: "Deep-dive week · The AI-native stack in your field" },
  { n: "02", title: "Analyse your own patch", edge: "master",
    do: "Translate the generic picture to your reality. Map how the work actually runs in your org and where you sit — which steps are yours, and how exposed your specific role really is.",
    sit: "If this rebuild landed at my company next quarter, where would I be?", week: "Deep-dive week · Audit your own workflow" },
  { n: "03", title: "Build the fluency for real", edge: "master",
    do: "Don't learn about the tools — run them. Pick one step you own and rebuild it AI-native yourself, on live work, until you're the person who can genuinely do it.",
    sit: "What's one workflow I could bring to a Build Clinic this month?", week: "Deep-dive week · Build Clinic — bring a live workflow" },
  { n: "04", title: "Plan your climb into judgment", edge: "deepen",
    do: "From where you landed on the ladder, make the deliberate plan: protect what's uniquely yours and move up into the judgment work — junior, skip rungs into the decisions; senior, deepen the relationships and the calls.",
    sit: "What judgment work do I want to own in 18 months — and what's the first step?", week: "Deep-dive week · Your protection & climb plan" },
  { n: "05", title: "Become the champion of the change", edge: "both", keystone: true,
    do: "Position yourself as the person who leads the AI transformation in your team. You understand both the work and the tools — so you're the natural one to shape how it's adopted. And whoever shapes the adoption controls who does what.",
    sit: "Who's driving the AI conversation in my team right now — and why isn't it me?", week: "Deep-dive week · Leading the change — becoming the AI SME" },
];
