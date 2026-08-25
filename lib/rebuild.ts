/* Workflow Rebuild — data-driven. Watch a core workflow done today vs rebuilt
   AI-native, see where the human moves up, then the five moves that turn the
   rebuild into your own climb. Each career is just workflow data; the ladder and
   the five moves are shared framework content. */

export type RebuildStep = { label: string; today: string; own: string; ai: string; you: string };
export type Rebuild = {
  slug: string; career: string; workflow: string; field: string; short: string; thesis: string;
  steps: RebuildStep[];
  delta: { v: string; l: string }[];
  pull: string;
};

export const REBUILDS: Record<string, Rebuild> = {
  marketing: {
    slug: "marketing", career: "Marketing", workflow: "Run a paid campaign", field: "Performance & paid",
    short: "A paid campaign, done today vs rebuilt AI-native — and where your value moves.",
    thesis: "The most common workflow in performance marketing — done the way it's done today, then rebuilt AI-native. Watch what the machine takes, and where the human moves up.",
    steps: [
      { label: "Brief & research", today: "Read the goal, dig through audience data, size up competitors — a day of desk research.", own: "the angle", ai: "synthesises the research in minutes", you: "set the strategic angle and the “why now.”" },
      { label: "Creative", today: "Write 5–10 ad variants, brief a designer, wait, iterate over days.", own: "brand taste", ai: "generates 50 on-brief variants instantly", you: "curate for brand truth and kill the off-brand." },
      { label: "Build & target", today: "Set targeting, budgets and placements by hand in Ads Manager.", own: "the guardrails", ai: "configures it from the brief", you: "approve the spend logic and set the guardrails." },
      { label: "Launch & monitor", today: "Watch the dashboards daily, pause the losers, react manually.", own: "the exceptions", ai: "monitors in real time and reallocates budget", you: "handle the exceptions and escalations." },
      { label: "Optimise", today: "Shift budget and tweak creative on a weekly cadence.", own: "the bets", ai: "runs continuous multivariate testing", you: "own the creative bets and which way to push." },
      { label: "Report", today: "Pull the numbers, build the deck, format the slides, present.", own: "the story", ai: "writes the narrative from the data", you: "own the story to the client and the next-quarter call." },
    ],
    delta: [
      { v: "Days → hours", l: "Full campaign cycle time" },
      { v: "Team of 3 → 1+AI", l: "People to run it end-to-end" },
      { v: "~10×", l: "Creative volume, ~80% less production time" },
    ],
    pull: "The bottleneck moves from making to judging — and judgment is the part AI can't do for you.",
  },

  "audit-accounting": {
    slug: "audit-accounting", career: "Audit & Accounting", workflow: "Close and audit the month", field: "Assurance & reporting",
    short: "Month-end close and audit prep, done today vs rebuilt AI-native — and where your value moves.",
    thesis: "The backbone workflow of the finance function — done the way it's done today, then rebuilt AI-native. Watch what the machine takes, and where the human moves up.",
    steps: [
      { label: "Gather & reconcile", today: "Chase spreadsheets, tie out ledgers, reconcile accounts by hand — days of tie-outs.", own: "the exceptions", ai: "ingests the ledgers and reconciles automatically", you: "investigate the breaks the machine flags." },
      { label: "Journals & accruals", today: "Book accruals and adjustments manually, line by line.", own: "the estimates", ai: "proposes standard entries from the patterns", you: "own the judgemental estimates and provisions." },
      { label: "Analytical review", today: "Build variance analyses in Excel, hunt for what moved.", own: "the “why”", ai: "surfaces every material variance instantly", you: "decide which movements need real explanation." },
      { label: "Sampling & testing", today: "Pull samples, vouch to support, document the workpapers.", own: "the scope", ai: "tests the full population and drafts the papers", you: "set the risk-based scope and sign the conclusions." },
      { label: "Disclosures", today: "Draft the notes, cross-check against the standards by hand.", own: "the technical call", ai: "drafts the notes and flags likely disclosures", you: "own the technical judgement and completeness." },
      { label: "Opinion & report", today: "Compile the file, write the memo, format the report.", own: "the opinion", ai: "assembles the file and drafts the narrative", you: "own the opinion and the accountability for it." },
    ],
    delta: [
      { v: "Days → hours", l: "Close and tie-out cycle" },
      { v: "Sample → 100%", l: "Population tested, not sampled" },
      { v: "Team of 4 → 1+AI", l: "People to run the close" },
    ],
    pull: "The work moves from preparing the numbers to standing behind them — and the opinion is still yours alone.",
  },

  "software-review": {
    slug: "software-review", career: "Software Engineering", workflow: "Ship a feature", field: "Product engineering",
    short: "Building and shipping a feature, done today vs rebuilt AI-native — and where your value moves.",
    thesis: "The core loop of building software — done the way it's done today, then rebuilt AI-native. Watch what the machine takes, and where the human moves up.",
    steps: [
      { label: "Scope & design", today: "Read the ticket, sketch the approach, weigh trade-offs.", own: "the architecture", ai: "drafts an approach and the trade-offs", you: "own the architecture and the constraints that matter." },
      { label: "Write the code", today: "Implement it by hand, function by function, over days.", own: "the review", ai: "writes most of the implementation from the spec", you: "review it hard for the bug under the working feature." },
      { label: "Tests", today: "Write unit and integration tests by hand.", own: "the edge cases", ai: "generates the test suite", you: "define the edge cases and what “correct” means." },
      { label: "Review", today: "Open a PR, wait, address comments across days.", own: "the standards", ai: "self-reviews and explains the diff", you: "hold the bar on security, correctness and design." },
      { label: "Debug & fix", today: "Reproduce, bisect, patch — the slow part.", own: "the diagnosis", ai: "proposes fixes from the stack trace", you: "own the root-cause call, not the symptom patch." },
      { label: "Ship & operate", today: "Deploy, watch metrics, roll back if it breaks.", own: "the risk call", ai: "gates the rollout and watches the signals", you: "own the risk decision and the incident call." },
    ],
    delta: [
      { v: "Days → hours", l: "Ticket to merged PR" },
      { v: "Writing → reviewing", l: "Where the time now goes" },
      { v: "~10×", l: "Code volume — judgment is the bottleneck" },
    ],
    pull: "The value moves from writing the code to judging it — the review is where your edge now lives.",
  },
};

export const REBUILD_LIST = Object.values(REBUILDS);

/* ── Shared framework content — the same for every career ───────────────── */

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
