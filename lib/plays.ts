import { LEVER_BY_SLUG, leverWeight } from "@/lib/moves";
import type { MapComputed } from "@/lib/trajectory";

/* The Playbook — a curated library of recommended plays for the Evolve loop.
   Moves used to be a blank box; this gives members a real menu of what to do,
   each with a how-to guide and a concrete first move they can commit in one tap.
   Content-as-data: adding a play is just another entry here. */

/** A how-to step. `phase` groups steps into a campaign timeline; `artifact` is the
 *  concrete thing the step produces (so a play is deliverables, not vibes). */
export type PlayStep = { title: string; detail: string; phase?: string; artifact?: string };

/** Which winning aim a play serves — mirrors the Map's edge-2 move (+ "master" = edge 1). */
export type Aim = "master" | "guard" | "shift" | "relocate";

/** How much lift a play asks of you. Sets expectations before you commit. */
export type Difficulty = "Light" | "Moderate" | "Demanding";

/** A phase of a play — an honest horizon with a goal and a checkpoint. */
export type PlayPhase = { label: string; goal: string; milestone: string };

/** A short, field-specific vignette; the detail page shows the one closest to the
 *  member's own field, so a generic play reads like it was written for them. */
export type PlayExample = { match: string[]; field: string; story: string };

export type Play = {
  slug: string;
  title: string;
  lever: string;        // a LEVERS slug (moves.ts) — what it commits against
  aim: Aim;
  tagline: string;      // one line: what it is and why it works
  fit: string;          // who it's for / when it makes sense
  difficulty: Difficulty;
  duration: string;     // realistic full arc, e.g. "A quarter, then ongoing"
  steps: PlayStep[];    // the how-to guide (also the tracked checklist)
  firstMove: string;    // the concrete commitment seeded into their moves
  // ── optional depth (v2 plays; absent ones render the classic layout) ──
  thesis?: string;      // why this move wins right now — the shift it exploits
  firstMoveWindow?: string; // honest time for the FIRST move only, e.g. "~3 weeks"
  phases?: PlayPhase[]; // the campaign arc; steps carry a matching `phase`
  artifacts?: string[]; // what you'll have built by the end (proof pieces)
  traps?: string[];     // the common ways people blow it
  signals?: string[];   // "you'll know it's working when…"
  payoff?: string;      // the reputation / seat / outcome you earn
  examples?: PlayExample[]; // field-specific vignettes (first match wins)
};

/** Pick the example closest to a member's field/lane; falls back to the first. */
export function playExample(p: Play, career?: string | null, lane?: string | null): PlayExample | null {
  if (!p.examples?.length) return null;
  const hay = `${career ?? ""} ${lane ?? ""}`.toLowerCase();
  return p.examples.find((e) => e.match.some((m) => hay.includes(m.toLowerCase()))) ?? p.examples[0];
}

// Each completed step of a committed play buys down half a point of exposure
// (see lib/focus.ts). We surface that here so a member sees the payoff up front.
const PT_PER_STEP = 0.5;

/** The exposure a play buys down as you complete its steps — grounded in the real
 *  focus-dividend scoring (half a point per step, scaled by the play's lever), so
 *  the number on the card is the number the dashboard will actually move. */
export function playBenefitPoints(p: Play): number {
  return Math.round(p.steps.length * PT_PER_STEP * leverWeight(p.lever) * 10) / 10;
}

/** A short, honest reading of what a play does to your exposure. "Master/guard"
 *  plays buy the score down through the work; "shift/relocate" plays also move
 *  your lane baseline when you re-score after repositioning. */
export function playBenefitReading(p: Play): string {
  const pts = playBenefitPoints(p);
  const base = `Buys down up to ${pts} pt${pts === 1 ? "" : "s"} of exposure as you complete it`;
  return p.aim === "shift" || p.aim === "relocate"
    ? `${base} — and re-scoring after you reposition can move your baseline further.`
    : `${base}.`;
}

export const AIMS: { key: Aim; label: string; blurb: string }[] = [
  { key: "master", label: "Master the machine", blurb: "Become AI-native at your own work — the move everyone makes first." },
  { key: "guard", label: "Guard your moat", blurb: "Deepen what the machine can't take, and grow where you already stand." },
  { key: "shift", label: "Shift lanes", blurb: "Reposition into more AI-resilient work in your field." },
  { key: "relocate", label: "Relocate to protected ground", blurb: "Move toward work that stays human while you have runway." },
];

const PLAYS_RAW: Omit<Play, "difficulty" | "duration">[] = [
  // ---------------- Master the machine (edge 1) ----------------
  {
    slug: "take-control", title: "Take control of your function's AI transformation", lever: "renovate", aim: "master",
    tagline: "Don't wait for AI to be done to you — be the person driving how it lands in your team.",
    fit: "Anyone who'd rather shape the change than be reorganized by it. You don't need authority to start — you need a sharp recommendation that makes you the person who saw it first.",
    thesis: "Every function is about to be redesigned around AI. That redesign is happening with or without you — the only question is whether you're the person holding the pen. The one who maps the work, runs the first credible pilot, and writes the plan becomes the owner of the new operating model. That role almost never goes to the most senior person; it goes to the first person who did the work.",
    firstMoveWindow: "~3 weeks",
    phases: [
      { label: "Weeks 1–3 · See the board", goal: "Get an honest, evidence-based picture of where the work actually sits and what AI can already touch.", milestone: "An exposure map of your function nobody else has." },
      { label: "Month 2 · Build the proof", goal: "Turn the analysis into one working pilot and a recommendation a decision-maker can act on.", milestone: "A live before/after on one workflow + a one-page plan." },
      { label: "Month 3+ · Own the standard", goal: "Get the plan adopted and make yourself the person accountable for how it rolls out.", milestone: "A sanctioned pilot with your name on it." },
    ],
    steps: [
      { phase: "Weeks 1–3 · See the board", title: "Map your function's real workflows", detail: "List the 5–8 workflows your function actually runs each month. For each, note the hours, who does them, and what a good vs. bad output looks like. Don't idealise it — map what really happens.", artifact: "A workflow inventory with hours attached" },
      { phase: "Weeks 1–3 · See the board", title: "Score each for exposure — and for value", detail: "Mark which steps AI can already do well, which it can't, and — just as important — which are high-value vs. busywork. The gold is high-volume, low-judgment work: that's where automation frees the most hours with the least risk.", artifact: "An exposure × value grid" },
      { phase: "Month 2 · Build the proof", title: "Design the AI-native version on paper", detail: "Take the highest-volume, most-exposed workflow and map it again — step by step: what AI does, what a human still owns, where the freed hours go. The Workflow Rebuild tool lays this out for you.", artifact: "A redesigned workflow diagram" },
      { phase: "Month 2 · Build the proof", title: "Run a small, real pilot on your own work", detail: "Before you pitch anyone, actually run the redesigned workflow on your own real work for a week or two. Capture the time saved, where it broke, and how you caught the errors. Evidence beats a slide.", artifact: "A logged before/after with real numbers" },
      { phase: "Month 2 · Build the proof", title: "Build the transformation recommendation", detail: "Turn the pilot into a sharp one-pager: the before/after, projected time saved across the team, the quality and risk trade-offs, what stays human, and what a proper trial would need. This is the artifact that puts you in the driver's seat.", artifact: "A one-page transformation recommendation" },
      { phase: "Month 3+ · Own the standard", title: "Take it to your lead (or IT) — and offer to own it", detail: "Bring it as an opportunity, not a threat: here's what we could automate, here's where our people move up. Then do the thing most people don't — offer to own the pilot and write the guardrails. Owning the standard is what makes it your transformation, not just your idea.", artifact: "A scoped, sponsored pilot you lead" },
    ],
    traps: [
      "Leading with the tech (\"we should use AI\") instead of the outcome (\"here's 200 hours a quarter and where they go\").",
      "Pitching before you've run it yourself — a real before/after outranks any deck.",
      "Automating the judgment work. Automate the volume; move your people up to the calls, don't hollow them out.",
    ],
    signals: [
      "People start forwarding you the \"can AI do this?\" questions.",
      "Your one-pager gets shared upward without your name being taken off it.",
      "You're in the room when the pilot is scoped — not hearing about it after.",
    ],
    payoff: "You stop being a role that AI happens to and become the person who owns how it lands — the most durable seat in any function being redesigned.",
    examples: [
      { match: ["consult"], field: "Management consulting", story: "A consultant mapped their firm's proposal-and-deliverable pipeline, piloted an AI-native research-to-draft flow on one live engagement, and took the before/after to the partner. They now own the firm's AI delivery playbook — the seat, not the deck." },
      { match: ["finance", "accounting", "audit", "cpa"], field: "Finance & accounting", story: "A finance lead mapped the monthly close, piloted AI on reconciliations and the first-draft commentary, and showed a 40% time cut with the judgment calls untouched. They now own the close redesign — and moved their own hours to advisory." },
      { match: ["product", "project", "program", "delivery", "marketing"], field: "Product & delivery", story: "A PM mapped status-reporting, risk logs and stakeholder updates, piloted an AI-native version, and freed a day a week across the team. They pitched it as capacity for the decisions AI can't make — and got named owner of the rollout." },
      { match: ["operations", "ops", "coordinat", "administ"], field: "Operations", story: "An ops lead mapped the team's request-handling and reporting, piloted an AI triage-and-draft flow, and took the numbers to their director. They now set the standard for how the function runs AI-native." },
    ],
    firstMove: "Map my function's workflows and build one AI-native transformation recommendation",
  },
  {
    slug: "prove-mastery", title: "Demonstrate your AI-native mastery — visibly", lever: "renovate", aim: "master",
    tagline: "Being good with AI quietly counts for little. Make your mastery legible to the people who decide.",
    fit: "You already use AI well but nobody around you knows it. Turn private skill into visible reputation.",
    thesis: "Reputation, not ability, is what gets rewarded. In a shift this fast, the people who rise aren't the quietly-competent — they're the ones the room already associates with \"figured out AI.\" That association is built on purpose: one visible proof piece, taught out loud, beats a year of private skill.",
    firstMoveWindow: "~1 week",
    phases: [
      { label: "Week 1 · Pick your proof", goal: "Turn one thing you already do well into undeniable, shareable evidence.", milestone: "A documented before/after on a real deliverable." },
      { label: "Weeks 2–4 · Make it legible", goal: "Get the method in front of the people who decide, and make it something others can use.", milestone: "You've taught it once and left a reusable template behind." },
    ],
    steps: [
      { phase: "Week 1 · Pick your proof", title: "Pick one signature output", detail: "Choose a deliverable you produce regularly that AI makes dramatically faster or better. This becomes your proof piece — pick something people already recognise as hard.", artifact: "A chosen proof piece" },
      { phase: "Week 1 · Pick your proof", title: "Document the before/after", detail: "Capture what it took before and what it takes now — time, quality, and what you now do with the freed hours. Numbers make it undeniable.", artifact: "A before/after with real figures" },
      { phase: "Weeks 2–4 · Make it legible", title: "Share the method, not just the result", detail: "Write a short internal note or run a lunch-and-learn showing how you did it. Teaching it is what marks you as the expert — the result alone reads as luck.", artifact: "An internal note or a short talk" },
      { phase: "Weeks 2–4 · Make it legible", title: "Make it repeatable for others", detail: "Turn your approach into a template or checklist your team can use. Now you're not just good at AI — you're the person who levelled up the function.", artifact: "A reusable team template" },
    ],
    traps: [
      "Showing the flashy output but hiding the method — people copy who they can learn from.",
      "Waiting for a perfect example. A real, slightly-messy one you can explain beats a polished one you can't.",
      "Making it about the tool, not the judgment you applied. The judgment is the part they can't hire a subscription for.",
    ],
    signals: [
      "Colleagues start asking you \"how did you do that?\"",
      "Your template shows up in someone else's work.",
      "You get invited to weigh in on how the team should use AI.",
    ],
    payoff: "You become the name attached to \"AI-native\" in your org — the reputation that earns the stretch work and the promotion.",
    examples: [
      { match: ["consult"], field: "Management consulting", story: "A consultant rebuilt their research-and-synthesis step AI-native, cut a two-day task to two hours, and ran a 20-minute internal session on exactly how. They became the person the practice routes AI questions to." },
      { match: ["finance", "accounting", "audit"], field: "Finance", story: "A finance analyst turned the monthly variance commentary into an AI-native first-draft-plus-review flow, documented the time saved, and templated it. It's now how the whole team writes commentary." },
      { match: ["product", "project", "marketing", "delivery"], field: "Product & marketing", story: "A PM rebuilt launch briefs AI-native, showed the before/after to the team, and left a prompt template behind. Their name is now on the standard everyone uses." },
    ],
    firstMove: "Turn my best AI-native workflow into a proof piece and share the method",
  },
  {
    slug: "build-fluency", title: "Build real AI fluency, not demo fluency", lever: "renovate", aim: "master",
    tagline: "The gap isn't knowing AI exists — it's using it on real, messy work until it's second nature.",
    fit: "You've dabbled but it hasn't changed how you actually work. Time to close the gap for real.",
    thesis: "Demo fluency — you've seen it work once — is worthless in a room where everyone's seen the demo. Real fluency is knowing, in your own work, exactly where the tool is brilliant, where it quietly lies, and how to check it in seconds. That's a month of reps, and it's the base every other play stands on.",
    firstMoveWindow: "starts today",
    phases: [
      { label: "Weeks 1–2 · Make it a habit", goal: "Move from occasional to daily, on real work — not toy prompts.", milestone: "Ten straight working days using it on the real thing." },
      { label: "Weeks 3–4 · Compound it", goal: "Turn scattered use into a reusable asset and a fast eye for errors.", milestone: "A prompt library you reach for and a sharper verify instinct." },
    ],
    steps: [
      { phase: "Weeks 1–2 · Make it a habit", title: "Choose your daily driver", detail: "Pick the one approved AI tool closest to your core work and commit to using it every day for a month — not for toys, for the real thing.", artifact: "A daily-use commitment" },
      { phase: "Weeks 1–2 · Make it a habit", title: "Push it past the easy wins", detail: "Each week, hand it a task you'd normally do yourself. Learn where it's strong, where it lies, and how to check it. The failures teach more than the wins.", artifact: "A running note of where it breaks" },
      { phase: "Weeks 3–4 · Compound it", title: "Build your prompt library", detail: "Save the prompts and patterns that work for your actual job. This is the compounding asset almost no one builds — and it's what makes you fast next month.", artifact: "A personal prompt library" },
      { phase: "Weeks 3–4 · Compound it", title: "Learn to verify fast", detail: "Get sharp at judging AI output at speed — the Judgment Gym trains exactly this. Fluency is trust plus scepticism; the value is catching the wrong answer in seconds.", artifact: "A faster, sharper review eye" },
    ],
    traps: [
      "Using it only for easy things — you never learn its edges, so you can't trust it when it matters.",
      "Never saving what works, so every session starts from zero.",
      "Trusting confident-sounding output. The dangerous errors are the fluent ones.",
    ],
    signals: [
      "You reach for it without thinking, on hard tasks, not just easy ones.",
      "You catch its mistakes fast instead of shipping them.",
      "Your first draft of anything is now minutes, not hours.",
    ],
    payoff: "AI stops being a party trick and becomes how you work — the fluency that makes every other move on this board possible.",
    examples: [
      { match: ["consult", "analyst", "research"], field: "Analysis & consulting", story: "An analyst spent a month running every research and modelling task through their tool first, logged where it fabricated sources, and built a verify checklist. They now produce in a morning what took two days — and catch the errors juniors miss." },
      { match: ["marketing", "content", "design"], field: "Marketing", story: "A marketer made AI their daily driver for briefs, copy and analysis, saved the prompts that worked, and got fast at spotting the off-brand or made-up lines. Output tripled without quality slipping." },
    ],
    firstMove: "Use my core AI tool daily on real work for the next month",
  },
  {
    slug: "become-promotion", title: "Make yourself the obvious promotion", lever: "trust", aim: "master",
    tagline: "As AI absorbs the task work, the people who rise are the ones trusted with judgment and outcomes.",
    fit: "You want to climb, not just survive. Position yourself where AI pushes value — up the ladder.",
    thesis: "AI is collapsing the bottom of every ladder and thickening the top. As task work automates, the scarce thing is someone trusted to own outcomes and make the calls. Promotion has always gone to the person already doing the next job; AI just makes the gap between task-doers and judgment-owners the whole game.",
    firstMoveWindow: "~1 month",
    phases: [
      { label: "Month 1 · Buy yourself capacity", goal: "Free the hours to operate a level up by clearing your current load with AI.", milestone: "You've handed your routine work to AI and named the role you're aiming at." },
      { label: "Months 2–6 · Operate a level up", goal: "Take and visibly own the judgment work the role above you does.", milestone: "Your name is on decisions and outcomes, not just outputs." },
    ],
    steps: [
      { phase: "Month 1 · Buy yourself capacity", title: "Identify the rung above you", detail: "Name the role you're aiming for and the two or three things its holder owns that you don't yet — the calls, the accountability, the relationships.", artifact: "A one-line gap list for the next role" },
      { phase: "Month 1 · Buy yourself capacity", title: "Let AI cover your current load", detail: "Use your AI fluency to clear your task work faster, buying the time to operate a level up. You can't take on judgment work while you're buried.", artifact: "Reclaimed hours in your week" },
      { phase: "Months 2–6 · Operate a level up", title: "Take the judgment work nobody wants", detail: "Volunteer for the calls, the ambiguity, the stakeholder-facing decisions — the parts AI can't own and juniors avoid. This is where you prove you can hold the next seat.", artifact: "One owned decision or account" },
      { phase: "Months 2–6 · Operate a level up", title: "Make your judgment visible", detail: "Get your name on the decisions and outcomes, not just the outputs. Tell your manager what you're taking on and why. Reputation for judgment is what earns the seat.", artifact: "A visible track record of calls made" },
    ],
    traps: [
      "Trying to climb by doing more task work faster — that's exactly the work disappearing.",
      "Owning the decision privately. If your manager can't name what you decided, it didn't count.",
      "Waiting to be given the judgment work. It's volunteered for, not assigned.",
    ],
    signals: [
      "You're looped into decisions before they're made, not after.",
      "Your manager starts describing you as \"ready for more.\"",
      "Peers route the hard, ambiguous calls to you.",
    ],
    payoff: "You're seen as already operating a level up — so the promotion is a formality, not a request.",
    examples: [
      { match: ["consult"], field: "Consulting", story: "A consultant used AI to clear their deck-and-analysis load, then volunteered to own the client relationship on a tricky account. Six months on they made manager — because they were already doing it." },
      { match: ["finance", "accounting"], field: "Finance", story: "A finance lead automated their reporting and took over the judgment calls on forecasting assumptions. They became the person the CFO asks — and the next controller." },
    ],
    firstMove: "Take on one piece of judgment or ownership work from the role above me",
  },

  // ---------------- Guard your moat (edge 2) ----------------
  {
    slug: "deepen-judgment", title: "Deepen the judgment the machine can't give", lever: "judgment", aim: "guard",
    tagline: "AI produces options; humans own the call. Move your hours toward the judgment that carries accountability.",
    fit: "Your role has real decisions inside it — risk, trade-offs, taste, ethics. Lean into them hard.",
    thesis: "AI is extraordinary at producing options and terrible at being accountable for choosing one. Judgment under real consequence — where being wrong is expensive and there's no clean formula — is the work that stays human longest. The move is to spend less of your time generating and more of it deciding, and to make that judgment legible and trusted.",
    firstMoveWindow: "~2 weeks",
    phases: [
      { label: "Weeks 1–2 · Name and protect it", goal: "Identify the judgment at the core of your role and free the time to do more of it.", milestone: "Your three highest-stakes calls named, and mechanical work handed to AI." },
      { label: "Ongoing · Compound the authority", goal: "Build a visible track record and get physically closer to where decisions are made.", milestone: "You're in the room for the calls that matter." },
    ],
    steps: [
      { phase: "Weeks 1–2 · Name and protect it", title: "Name your judgment core", detail: "Write down the three calls in your work where being wrong is expensive and there's no clean formula. That's your moat — everything else is potentially automatable.", artifact: "Your three-call judgment map" },
      { phase: "Weeks 1–2 · Name and protect it", title: "Shift hours toward it", detail: "Use your org's approved AI tools to clear the mechanical work, so you spend more time on the hard calls, not less. Protect that time deliberately.", artifact: "More hours on the decisions, fewer on the mechanics" },
      { phase: "Ongoing · Compound the authority", title: "Build a track record", detail: "Log the tough calls you make and how they played out — the reasoning, not just the result. Documented, sound judgment is rare and quietly compounds into trust.", artifact: "A decision log" },
      { phase: "Ongoing · Compound the authority", title: "Get closer to the decision", detail: "Position yourself where the real decisions are made — in the room, on the account, at the table. Proximity to consequence is what makes your judgment matter.", artifact: "A seat where the calls happen" },
    ],
    traps: [
      "Confusing being busy with being decisive — volume of output isn't judgment.",
      "Keeping your reasoning in your head. Judgment nobody sees can't build trust.",
      "Letting AI make the call and rubber-stamping it. The accountability is the whole value.",
    ],
    signals: [
      "People bring you the ambiguous, high-stakes questions.",
      "Your read gets asked for before a decision, not after.",
      "You're spending your best hours on calls, not keystrokes.",
    ],
    payoff: "You become the trusted decision-maker in your area — the role AI assists but can never be accountable for.",
    examples: [
      { match: ["finance", "accounting", "audit"], field: "Finance & audit", story: "An auditor moved routine testing to AI and put their hours into the judgment calls — going-concern, estimates, fraud risk. They became the one the partner trusts on the calls that carry the signature." },
      { match: ["law", "legal"], field: "Legal", story: "A lawyer handed first-draft review to AI and concentrated on risk judgment and client counsel. Their advice — the part no model can be accountable for — became what clients pay for." },
      { match: ["consult", "product", "strategy"], field: "Strategy", story: "A strategist let AI generate the options and spent their time on which bet to make and why, logging the reasoning. They're now in every decision room that matters." },
    ],
    firstMove: "Move my hours toward the highest-stakes judgment calls in my role",
  },
  {
    slug: "own-relationships", title: "Become the trusted relationship, not the task", lever: "trust", aim: "guard",
    tagline: "Automation takes tasks; it doesn't take the person a client or team actually trusts.",
    fit: "Your work touches clients, patients, stakeholders, or a team. The relationship is a moat AI can't cross.",
    thesis: "A task can be automated; a trusted relationship can't be transferred. When the work behind you becomes a commodity, the person the client, patient or team actually trusts is the thing that isn't. That trust isn't a soft skill — it's your most defensible asset, and it's built by deliberate investment, not left to chance.",
    firstMoveWindow: "this week",
    phases: [
      { label: "Week 1 · Map the trust", goal: "See clearly whose trust makes you hard to replace, and start investing in it.", milestone: "Your top relationships named and the first deliberate touch made." },
      { label: "This month+ · Be the human", goal: "Become the trusted face over the AI-assisted work and the one who handles the hard conversations.", milestone: "You're the person the important calls go through." },
    ],
    steps: [
      { phase: "Week 1 · Map the trust", title: "Map your key relationships", detail: "List the people whose trust makes you hard to replace — clients, senior stakeholders, your team. Rank them by how much your value depends on them.", artifact: "A ranked relationship map" },
      { phase: "Week 1 · Map the trust", title: "Invest deliberately", detail: "Put real time into the top few — the calls, the context, the being-there that no tool provides. Small, consistent investment beats grand gestures.", artifact: "A regular cadence with your top three" },
      { phase: "This month+ · Be the human", title: "Be the human in the loop", detail: "Where AI does the work, be the trusted face who stands behind it and translates it for the people who matter. Own the output publicly.", artifact: "Your name on the trusted delivery" },
      { phase: "This month+ · Be the human", title: "Become the go-to for the hard conversations", detail: "The difficult, high-trust conversations — bad news, tough calls, sensitive negotiations — are the ones that stay human. Make yourself the person who handles them.", artifact: "A reputation for the hard talks" },
    ],
    traps: [
      "Treating relationships as networking. It's earned trust over time, not contacts collected.",
      "Hiding behind the AI-generated deliverable instead of standing in front of it.",
      "Investing in everyone equally. Depth with the few beats shallow with the many.",
    ],
    signals: [
      "Clients or stakeholders ask for you by name.",
      "The sensitive conversations get routed to you.",
      "People trust the work more because you're the one behind it.",
    ],
    payoff: "You become irreplaceable not for what you produce but for who trusts you — the moat no tool can cross.",
    examples: [
      { match: ["consult", "account", "sales", "client"], field: "Client-facing work", story: "A consultant let AI carry the analysis and put their hours into the client relationship — the context, the hard calls, the trust. When the engagement was up for renewal, the client renewed for them, not the deck." },
      { match: ["health", "nurse", "care", "psycholog", "social"], field: "Care & health", story: "A clinician used AI to cut documentation time and reinvested it in patient presence and the difficult conversations. That relationship is the part of the role that stays entirely human." },
    ],
    firstMove: "Deepen my three most important professional relationships this month",
  },

  // ---------------- Shift lanes (edge 2) ----------------
  {
    slug: "shift-resilient-lane", title: "Reposition into a more AI-resilient lane", lever: "shift", aim: "shift",
    tagline: "Same field, safer ground — move toward the work in your profession that AI can't easily do.",
    fit: "Your current lane is highly exposed, but your field has more protected corners you can move into.",
    thesis: "You don't have to leave your field to get to safer ground — most professions have exposed lanes and protected ones sitting right next to each other. The resilient corners lean on judgment, licensing, relationships or physical presence. Moving one lane over, while you still have runway, is a far smaller leap than a career change and buys durable protection.",
    firstMoveWindow: "~2 weeks",
    phases: [
      { label: "Weeks 1–3 · Find your target", goal: "Identify the resilient lane in your field and the exact gap between you and it.", milestone: "A target lane chosen and the gap named." },
      { label: "Months 2–6 · Close the gap", goal: "Build the missing capability on runway and get real exposure to the new lane.", milestone: "A foot in the door — a project or role in the target lane." },
    ],
    steps: [
      { phase: "Weeks 1–3 · Find your target", title: "Find the resilient lanes in your field", detail: "Look across your profession for the roles with lower exposure — usually more judgment, licensing, relationships, or physical presence. Your Map's openings point here.", artifact: "A shortlist of resilient lanes" },
      { phase: "Weeks 1–3 · Find your target", title: "Name the gap", detail: "Pick one target lane and list what it needs that you don't have yet — a skill, a credential, an experience, a relationship. Be specific; a vague gap never closes.", artifact: "A concrete gap list" },
      { phase: "Months 2–6 · Close the gap", title: "Close it deliberately", detail: "Build a 90-day plan to close that gap while you're still secure. Learning on runway beats learning in a crisis — and AI can compress the study.", artifact: "A 90-day gap-closing plan" },
      { phase: "Months 2–6 · Close the gap", title: "Get a foot in early", detail: "Volunteer for projects, shadow someone, take the stretch assignment that moves you toward the safer lane. Proof of doing beats a line on a CV.", artifact: "Real work in the target lane" },
    ],
    traps: [
      "Picking a lane that's protected today but exposed next — check the trend, not just the level.",
      "Trying to leap instead of bridge. One deliberate lane over beats a blind jump.",
      "Waiting until your current lane is in crisis. The move is far easier with runway.",
    ],
    signals: [
      "You're getting pulled into work in the target lane.",
      "The gap list is shrinking, item by item.",
      "People start associating you with the new lane, not just the old one.",
    ],
    payoff: "You move to durable ground inside a field you already know — protection without starting over.",
    examples: [
      { match: ["marketing", "content"], field: "Marketing", story: "A content marketer, in a highly exposed lane, moved deliberately toward brand strategy and positioning — the judgment-heavy corner AI can't own. Same field, far drier ground." },
      { match: ["data", "analyst"], field: "Data & analytics", story: "A reporting analyst repositioned toward the decision-support and stakeholder-facing side — framing the questions, not running the queries — the part of analytics that stays human." },
      { match: ["computer", "software", "developer", "engineer"], field: "Software", story: "A developer whose entry-level output was most exposed moved toward architecture and security — owning the systems, not competing with AI on code." },
    ],
    firstMove: "Pick a more AI-resilient lane in my field and start closing the gap",
  },
  {
    slug: "move-into-oversight", title: "Move up into oversight and accountability", lever: "shift", aim: "shift",
    tagline: "When AI does the work, someone has to own, check, and answer for it. Be that someone.",
    fit: "Your task work is highly automatable, but you understand the domain well enough to supervise it.",
    thesis: "As AI takes the producing, every function still needs someone to check it, set the bar, and answer for the result — and that someone has to know the domain cold. If your task work is the most automatable part of your job, the escape isn't to do it faster; it's to move up into the oversight layer that AI creates demand for, not destroys.",
    firstMoveWindow: "~3 weeks",
    phases: [
      { label: "Weeks 1–4 · Become the reviewer", goal: "Shift your identity from producing the work to judging it — and get sharp at catching what AI gets subtly wrong.", milestone: "You're the trusted check on AI-assisted output in your patch." },
      { label: "Months 2–3 · Own the standard", goal: "Take explicit accountability and write the guardrails, so the standard has your name on it.", milestone: "You own the quality bar, not just the review." },
    ],
    steps: [
      { phase: "Weeks 1–4 · Become the reviewer", title: "Reframe your role as the reviewer", detail: "Shift from producing the work to setting the standard, checking the output, and owning the result. Start narrating this change to your manager.", artifact: "A reframed remit — reviewer, not producer" },
      { phase: "Weeks 1–4 · Become the reviewer", title: "Sharpen your review judgment", detail: "The skill is catching what AI gets subtly wrong — the fluent-sounding error. Train it deliberately; the Judgment Gym is built for exactly this.", artifact: "A faster, sharper error-catching eye" },
      { phase: "Months 2–3 · Own the standard", title: "Take responsibility explicitly", detail: "Volunteer to be accountable for AI-assisted output in your area. Accountability is the thing that doesn't automate — and taking it is how you move up.", artifact: "Named accountability for AI output" },
      { phase: "Months 2–3 · Own the standard", title: "Propose the guardrails", detail: "Draft the checks and quality bars for AI-assisted work in your area, and offer to own them. Owning the standard beats just owning the output.", artifact: "A written quality-and-checks standard" },
    ],
    traps: [
      "Reviewing without authority — get the accountability made explicit, or it's just extra work.",
      "Rubber-stamping to keep up. If you're not catching errors, you're not adding oversight.",
      "Setting a standard nobody adopts. Get it sanctioned by whoever owns the area.",
    ],
    signals: [
      "AI-assisted work in your area routes through you before it ships.",
      "Your quality bar becomes \"how we do it here.\"",
      "You're accountable for outcomes, not tasks.",
    ],
    payoff: "You move from the automatable layer into the oversight layer AI makes more valuable, not less — with your name on the standard.",
    examples: [
      { match: ["finance", "accounting", "audit"], field: "Finance & audit", story: "An accountant whose reconciliations were fully automatable took ownership of reviewing and signing off the AI-assisted close, and wrote the checks. They moved from preparer to controller of the standard." },
      { match: ["legal", "law", "compliance"], field: "Legal & compliance", story: "A paralegal became the accountable reviewer of AI-drafted work and authored the firm's review protocol. The producing automated; the oversight became their role." },
      { match: ["content", "marketing", "translation"], field: "Content", story: "A writer moved from producing copy to owning quality and brand-safety review of AI-generated content, and set the guardrails everyone now follows." },
    ],
    firstMove: "Take ownership of reviewing and standing behind AI-assisted work in my area",
  },
  {
    slug: "prepare-new-job", title: "Prepare for a new job opportunity", lever: "shift", aim: "shift",
    tagline: "If a move is coming — by choice or not — go into the market as visibly AI-native, aimed at resilient roles.",
    fit: "You're considering a move, feel your role narrowing, or just want to be ready. Job-hunt from strength.",
    thesis: "The job market is re-sorting fast: exposed roles are thinning while judgment-and-ownership roles compete for people who are visibly AI-native. Going in with a task-based CV aimed at hollowing-out roles is fighting the tide. Aim at resilient roles, lead with what you now do AI-native, and carry proof — that's job-hunting from strength, whether the move is your choice or not.",
    firstMoveWindow: "~1 week",
    phases: [
      { label: "Week 1 · Aim and reframe", goal: "Point the search at durable roles and rebuild your story around AI-native outcomes.", milestone: "A repositioned CV and profile aimed at resilient roles." },
      { label: "Weeks 2–6 · Build proof & go", goal: "Create one showable proof of AI-native work and be ready for the question every employer now asks.", milestone: "A portfolio piece and a sharp AI answer ready to go." },
    ],
    steps: [
      { phase: "Week 1 · Aim and reframe", title: "Target resilient roles", detail: "Aim your search at roles heavier on judgment, trust, and ownership — the ones with real runway, not the ones AI is hollowing out. Your Map's lanes point the way.", artifact: "A target-role shortlist" },
      { phase: "Week 1 · Aim and reframe", title: "Rewrite your story around AI", detail: "Rebuild your resume and profile around what you now do AI-native and the outcomes you own — not the tasks you used to run. Lead with results, not responsibilities.", artifact: "A repositioned CV + profile" },
      { phase: "Weeks 2–6 · Build proof & go", title: "Build one portfolio proof", detail: "Create one concrete example of AI-native work you can show — the thing that makes an interviewer lean in. One real artifact beats a page of claims.", artifact: "A showable proof piece" },
      { phase: "Weeks 2–6 · Build proof & go", title: "Prepare the AI conversation", detail: "Every serious employer now asks how you use AI. Have a sharp, specific answer with a real example — how you use it, where you don't trust it, and the judgment you add.", artifact: "A rehearsed, specific AI story" },
    ],
    traps: [
      "Applying to the roles you know are shrinking because they're familiar.",
      "A CV that lists tasks AI now does. Lead with outcomes and judgment instead.",
      "A vague \"I use AI a lot\" answer. Interviewers can tell real use from buzzwords instantly.",
    ],
    signals: [
      "Interviewers lean in when you show your proof piece.",
      "You're getting looked at for judgment-heavy roles, not just lateral moves.",
      "The AI question becomes your strongest moment, not your weakest.",
    ],
    payoff: "You enter the market as the visibly AI-native candidate for durable roles — hunting from strength, not scrambling.",
    examples: [
      { match: ["marketing", "content", "design"], field: "Marketing", story: "A marketer facing a narrowing role rebuilt their profile around AI-native campaign work and outcomes, built one showcase piece, and landed a brand-strategy role — drier ground, on their terms." },
      { match: ["data", "analyst", "computer", "software"], field: "Data & tech", story: "An analyst repositioned toward decision-support roles, showed an AI-native project end-to-end in interviews, and had a crisp answer on where they don't trust the model. They moved up, not sideways." },
    ],
    firstMove: "Rewrite my resume and profile around my AI-native work and outcomes",
  },

  // ---------------- Relocate to protected ground (edge 2) ----------------
  {
    slug: "relocate-protected", title: "Relocate to more protected ground while you have runway", lever: "relocate", aim: "relocate",
    tagline: "When a whole lane is deeply exposed, the honest move is out — deliberately, early, on your terms.",
    fit: "Your work is highly exposed and there's no resilient corner nearby. Better to move by choice than by force.",
    thesis: "Some lanes don't have a safer corner — the whole field is deeply exposed. Pretending otherwise wastes the one asset you still have: runway. The people who come through a shift like this best are the ones who saw it early and moved by choice, building a bridge while still earning, rather than being forced out with no plan. This is the honest, hardest, and highest-leverage move on the board.",
    firstMoveWindow: "~1 month",
    phases: [
      { label: "Month 1 · Face it and choose", goal: "Accept the ground is moving and pick the protected field your strengths transfer to.", milestone: "A target field chosen with clear eyes." },
      { label: "Months 2–18 · Build the bridge", goal: "Build toward the new ground while still earning, against a real timeline.", milestone: "A funded, time-boxed bridge plan in motion." },
    ],
    steps: [
      { phase: "Month 1 · Face it and choose", title: "Face it clearly", detail: "Be honest that the ground is moving under this role. That clarity is uncomfortable — and it's exactly what buys you time to move well instead of late.", artifact: "An honest read of your runway" },
      { phase: "Month 1 · Face it and choose", title: "Find adjacent protected work", detail: "Look for fields that use your existing strengths but sit on more human ground — more hands-on, licensed, or relationship-led. Adjacent beats a total reinvention.", artifact: "A shortlist of protected targets" },
      { phase: "Months 2–18 · Build the bridge", title: "Build a bridge, don't leap", detail: "Pick a target and start building toward it while you're still earning — a course, a side project, a network, a credential. Momentum while secure beats a cold jump.", artifact: "A bridge underway (course / project / network)" },
      { phase: "Months 2–18 · Build the bridge", title: "Set a timeline", detail: "Give yourself a real horizon (say 12–18 months) and concrete milestones. Runway used well beats runway wasted — a deadline turns intention into a move.", artifact: "A dated milestone plan" },
    ],
    traps: [
      "Denial. The most expensive move is pretending the ground isn't shifting until it's too late.",
      "Leaping without a bridge — quitting before the new ground can hold you.",
      "No deadline. Runway quietly disappears when there's no milestone forcing progress.",
    ],
    signals: [
      "You feel in control of the move instead of braced for it.",
      "Each month you're measurably closer to the new field.",
      "Your income holds while the bridge gets built.",
    ],
    payoff: "You reach durable ground on your own terms, with income intact — the difference between a chosen move and a forced one.",
    examples: [
      { match: ["content", "copywrit", "translation", "journalis"], field: "Writing & translation", story: "A copywriter in a deeply exposed lane spent a year bridging into UX and product content — more judgment, more stakeholder trust — while still freelancing. They landed the new role before the old work dried up." },
      { match: ["data", "admin", "coordinat", "transport"], field: "High-exposure operations", story: "A data-entry lead used their runway to train into a licensed, hands-on adjacent field, built the credential on evenings, and moved before the role was cut." },
    ],
    firstMove: "Choose a protected field to move toward and set my 12-month bridge plan",
  },
  {
    slug: "double-down-physical", title: "Double down on your physical-presence skills", lever: "physical", aim: "relocate",
    tagline: "Work done with your hands, body, and presence in the real world is the hardest for AI to touch.",
    fit: "Your role has a hands-on or in-person core — care, craft, trades, field work. That's a genuine moat: deepen it.",
    thesis: "As AI floods every screen-based task, the work that happens in the physical world — with your hands, your body, your presence — gets scarcer and more valuable, not less. The mistake is letting admin and paperwork eat the hours that should go to the irreplaceable part. Clear the digital drag with AI, pour the reclaimed time into the craft, and make the human premium visible.",
    firstMoveWindow: "this month",
    phases: [
      { label: "This month · Protect the core", goal: "Name the irreplaceable hands-on core and use AI to clear the admin around it.", milestone: "More of your week on the craft, less on paperwork." },
      { label: "This quarter · Deepen & signal", goal: "Invest in mastery of the physical skill and position yourself as the trusted human option.", milestone: "A visibly deeper craft and a premium reputation." },
    ],
    steps: [
      { phase: "This month · Protect the core", title: "Name your physical core", detail: "Identify the parts of your work that require being physically present and skilled — the parts a screen genuinely can't do. That's your moat.", artifact: "A clear map of your hands-on core" },
      { phase: "This month · Protect the core", title: "Let AI handle your admin", detail: "Use approved AI tools to clear the paperwork, scheduling and quoting around your real work, so more of your time is the irreplaceable part.", artifact: "Admin time cut, craft time reclaimed" },
      { phase: "This quarter · Deepen & signal", title: "Deepen the craft", detail: "Invest in mastery of the hands-on skill itself — the certification, the technique, the reps. Depth here is durable in a way screen work no longer is.", artifact: "A measurably sharper skill" },
      { phase: "This quarter · Deepen & signal", title: "Signal the human premium", detail: "As AI floods digital work, in-person skill becomes more valuable. Position yourself as the trusted human option — the one people choose precisely because it's not automated.", artifact: "A premium, human-first positioning" },
    ],
    traps: [
      "Letting admin creep back in and eat the hours the craft needs.",
      "Assuming physical means safe forever — deepen it, don't coast on it.",
      "Hiding the human premium. In a sea of automation, say plainly that a skilled person does this.",
    ],
    signals: [
      "More of your week is hands-on, less is paperwork.",
      "Clients choose you because you're the human option, and pay for it.",
      "Your craft is visibly deeper than a year ago.",
    ],
    payoff: "You own the ground AI can't reach — and turn the scarcity of real-world skill into a premium.",
    examples: [
      { match: ["trade", "construction", "hvac", "electric", "plumb", "mechanic"], field: "Trades & construction", story: "An electrician handed quoting, scheduling and invoicing to AI, put the reclaimed hours into advanced certifications, and marketed themselves as the master tradesperson. Higher rate, fuller book." },
      { match: ["nurse", "care", "health", "hospitality", "veterin"], field: "Care & in-person services", story: "A care professional cut documentation time with AI and reinvested it in patient presence and skill, positioning the human relationship as the premium it is." },
    ],
    firstMove: "Invest in deepening the hands-on core of my work this quarter",
  },
  {
    slug: "earn-credential", title: "Earn the credential that gates the work", lever: "licensing", aim: "relocate",
    tagline: "Some work stays human because the law or a license says a qualified person must do it. Get on that side of the line.",
    fit: "Your field (or an adjacent one) has licensed, regulated, or accredited roles AI can assist but never legally own.",
    thesis: "The most durable moat AI can't cross is a legal one. Where the law says a qualified, accountable human must sign, certify, or stand behind the work, AI can assist but never own it. If a licensed role sits in or beside your field, the credential is a wall between you and automation — and AI itself is now the fastest way to study for it.",
    firstMoveWindow: "~2 weeks",
    phases: [
      { label: "Weeks 1–2 · Find the gate", goal: "Identify the licensed roles near you and pick the one with the best protection-to-effort ratio.", milestone: "The right credential chosen, with its path mapped." },
      { label: "Months 1–12 · Earn it", goal: "Study on runway, using AI to compress the path, until the credential is yours.", milestone: "The credential earned — the wall is up." },
    ],
    steps: [
      { phase: "Weeks 1–2 · Find the gate", title: "Find the licensed roles near you", detail: "Identify the credentials in or adjacent to your field that legally gate the work — where a human must sign, certify, or be accountable. These are the AI-proof corners.", artifact: "A list of gating credentials" },
      { phase: "Weeks 1–2 · Find the gate", title: "Pick the reachable one", detail: "Choose the credential with the best ratio of protection to effort from where you stand today — one your existing experience shortens the path to.", artifact: "One chosen credential" },
      { phase: "Months 1–12 · Earn it", title: "Make a study plan on runway", detail: "Map the path — exams, hours, cost, supervised experience — and start while you're secure. Credentials take time; begin before you need it, not after.", artifact: "A dated study-and-exam plan" },
      { phase: "Months 1–12 · Earn it", title: "Use AI to get there faster", detail: "Let AI tutor you, drill you on past papers, and compress the study. The credential is the moat; AI is how you reach it sooner — the tool working for you, not against you.", artifact: "An AI-accelerated study routine" },
    ],
    traps: [
      "Chasing a prestigious credential that doesn't actually gate any work — protection comes from the legal wall, not the letters.",
      "Starting once you're already in crisis. These take months; begin on runway.",
      "Underusing AI to study. It can halve the path — treat it as your tutor.",
    ],
    signals: [
      "You're steadily clearing exam milestones.",
      "The credential opens roles that were closed to you.",
      "Your work moves onto the side of the line AI legally can't cross.",
    ],
    payoff: "You get on the protected side of a legal or regulatory wall — the most durable ground on the board.",
    examples: [
      { match: ["account", "finance", "bookkeep", "audit"], field: "Finance & accounting", story: "A bookkeeper — whose transactional work is among the most automatable there is — used their runway to study for the CPA, drilling with AI, and moved to the licensed advisory side that only a qualified human can sign." },
      { match: ["health", "care", "allied", "psycholog", "social"], field: "Health & care", story: "A care worker trained toward a licensed allied-health credential, using AI to compress the coursework, and moved into regulated, accountable work AI can assist but never hold." },
    ],
    firstMove: "Identify the credential that best protects my work and start the path",
  },

  // ---------------- Additional plays (variety of shape + role-family) ----------------
  {
    slug: "productize-expertise", title: "Productize your expertise into an AI-augmented offering", lever: "renovate", aim: "master",
    tagline: "Stop selling your hours. Turn what you know into a repeatable, AI-powered thing that scales past you.",
    fit: "Knowledge workers — consultants, advisors, analysts, marketers — whose value is expertise delivered one engagement at a time.",
    thesis: "If you're paid by the hour for expertise, AI is coming for your pricing model: clients can now get a passable version of the generic 80% for free. The winning response isn't to compete on that 80% — it's to package your judgment and method into a repeatable, AI-augmented offering, so your expertise scales past the hours in your day and the commodity part becomes your engine, not your competition.",
    firstMoveWindow: "~3 weeks",
    phases: [
      { label: "Weeks 1–3 · Find the repeatable core", goal: "Identify the expertise you deliver over and over, and the judgment inside it that's actually yours.", milestone: "One offering named, with its human-judgment core defined." },
      { label: "Months 2–4 · Build and sell it", goal: "Wrap your method in an AI-augmented delivery model and take it to market as a product, not hours.", milestone: "A repeatable offering delivered at least once." },
    ],
    steps: [
      { phase: "Weeks 1–3 · Find the repeatable core", title: "Spot your repeatable expertise", detail: "List the things you do again and again for different clients or teams. The most repeated, highest-value one is your candidate to productize.", artifact: "A shortlist of repeatable offerings" },
      { phase: "Weeks 1–3 · Find the repeatable core", title: "Separate the commodity from the judgment", detail: "For that offering, mark what AI can now do (the research, the first draft, the analysis) and what only your judgment provides (the call, the taste, the accountability). Your product sells the second, powered by the first.", artifact: "A commodity-vs-judgment breakdown" },
      { phase: "Months 2–4 · Build and sell it", title: "Build the AI-augmented delivery model", detail: "Design how you'll deliver it: AI does the heavy lifting, you own the judgment and the client relationship. Standardise it into a method others could follow.", artifact: "A documented, AI-augmented method" },
      { phase: "Months 2–4 · Build and sell it", title: "Take it to market as a product", detail: "Price and pitch the outcome, not the hours — a fixed offering with a clear result. Run it once, capture the proof, and refine.", artifact: "A productized offering, sold once" },
    ],
    traps: [
      "Productizing the commodity part — that's exactly what AI gives away free. Package the judgment.",
      "Still pricing by the hour. If the model is time-for-money, you haven't productized anything.",
      "Over-engineering before selling. Sell it once rough, then refine on real demand.",
    ],
    signals: [
      "You're delivering more with the same or fewer hours.",
      "Clients buy the outcome without asking how long it takes.",
      "The offering has a name people refer to.",
    ],
    payoff: "Your income stops being capped by your hours — your expertise scales, with AI as the engine and your judgment as the product.",
    examples: [
      { match: ["consult", "advisor", "strategy"], field: "Consulting", story: "A consultant packaged their recurring \"market-entry assessment\" into a fixed AI-augmented offering — AI runs the research, they own the recommendation — and sold it at a flat fee, delivering in days what used to take weeks of billable hours." },
      { match: ["marketing", "design", "content"], field: "Marketing & creative", story: "A freelance marketer turned their positioning process into a productized sprint: AI drafts, their judgment shapes. They sell the outcome, not the hours, and take on triple the clients." },
    ],
    firstMove: "Package one repeatable piece of my expertise into an AI-augmented offering",
  },
  {
    slug: "adoption-lead", title: "Become the person who makes AI land for your team", lever: "trust", aim: "master",
    tagline: "Tools don't transform teams — people do. Be the one who turns access into adoption, and own that reputation.",
    fit: "Anyone on a team where AI access exists but real change hasn't. You don't need to be the manager — you need to be the catalyst.",
    thesis: "Most teams now have AI tools and almost no real change to show for it — access isn't adoption. The gap is human: someone has to make it safe, show the plays, and set the norms. Whoever fills that gap becomes the most visible, trusted person in the transition, without needing a title. It's reputation and influence built by being genuinely useful to everyone around you.",
    firstMoveWindow: "~2 weeks",
    phases: [
      { label: "Weeks 1–2 · Seed it", goal: "Find where AI would obviously help your team and prove it small.", milestone: "One shared win the team can see." },
      { label: "Ongoing · Make it stick", goal: "Turn one win into shared norms, a library, and a rhythm — and own it visibly.", milestone: "You're the person the team associates with getting AI to work." },
    ],
    steps: [
      { phase: "Weeks 1–2 · Seed it", title: "Find the team's obvious win", detail: "Spot the one workflow where AI would visibly help everyone — the shared pain that a quick rebuild would relieve. Start where the value is undeniable.", artifact: "One high-value team workflow chosen" },
      { phase: "Weeks 1–2 · Seed it", title: "Prove it small and share it", detail: "Rebuild that one thing AI-native, show the before/after to the team, and hand them the how. A visible shared win earns you the room's attention.", artifact: "A shared before/after + how-to" },
      { phase: "Ongoing · Make it stick", title: "Build the shared library and norms", detail: "Collect the prompts, patterns and guardrails that work into a shared resource, and help set the team's norms — what's fine to use AI for, what needs a human check.", artifact: "A team prompt library + norms" },
      { phase: "Ongoing · Make it stick", title: "Run a light rhythm", detail: "Keep it alive: a short weekly share, a channel, a monthly \"what worked\" round-up. Consistency is what turns a spark into how the team works.", artifact: "A recurring team AI rhythm" },
    ],
    traps: [
      "Evangelising the tool instead of solving a real shared pain — nobody adopts a lecture.",
      "Making it about you looking clever. Adoption is generosity; the reputation follows.",
      "One big launch, then silence. A light, consistent rhythm beats a splashy one-off.",
    ],
    signals: [
      "Teammates start sharing their own AI wins, unprompted.",
      "People ask you before they ask IT.",
      "\"Ask [you]\" becomes the team's default for anything AI.",
    ],
    payoff: "You become the trusted catalyst of your team's transition — high influence and reputation, no title required.",
    examples: [
      { match: ["product", "project", "operations", "ops", "delivery", "coordinat"], field: "Delivery & ops", story: "A PM rebuilt the team's status-reporting AI-native, shared the how, then ran a weekly five-minute \"what worked\" slot. Within a quarter they were the person leadership asked to shape the team's AI approach." },
      { match: ["marketing", "sales"], field: "Marketing & sales", story: "A marketer seeded one AI-native workflow, built a shared prompt library, and kept a light rhythm going. They became the de-facto AI lead — and it showed up at review time." },
    ],
    firstMove: "Rebuild one shared team workflow AI-native and share the how",
  },
  {
    slug: "build-optionality", title: "Build a protected side bet while you're secure", lever: "relocate", aim: "relocate",
    tagline: "Don't bet everything on one lane holding. Build a small, real option on safer ground — before you need it.",
    fit: "You're not ready to move, but your lane is exposed and you want a hedge. A low-commitment bridge you can grow if you have to.",
    thesis: "You don't have to choose between staying put and leaping. The smartest hedge in an uncertain shift is optionality — a small, real foothold on more protected ground that you build while secure and can grow into if your lane erodes. It costs a little time now and buys enormous freedom later: you move by choice, if at all, instead of by force.",
    firstMoveWindow: "~2 weeks",
    phases: [
      { label: "Weeks 1–2 · Place the bet", goal: "Choose one protected direction worth a small, real investment.", milestone: "A side bet chosen and started." },
      { label: "Ongoing · Grow the option", goal: "Keep the foothold alive with light, consistent investment so it's there if you need it.", milestone: "A living option you could step onto within months." },
    ],
    steps: [
      { phase: "Weeks 1–2 · Place the bet", title: "Pick one protected direction", detail: "From your Map's more resilient lanes or fields, choose one that genuinely interests you and uses your strengths. Interest matters — you'll only sustain a side bet you care about.", artifact: "One chosen direction" },
      { phase: "Weeks 1–2 · Place the bet", title: "Make it real and small", detail: "Take one concrete, low-commitment step: a course module, a small side project, a conversation with someone in the field. Real beats researched.", artifact: "A first real step taken" },
      { phase: "Ongoing · Grow the option", title: "Invest a little, consistently", detail: "Put a small, regular slice of time in — a few hours a week. The point isn't speed; it's keeping a live option warm on safer ground.", artifact: "A weekly rhythm on the side bet" },
      { phase: "Ongoing · Grow the option", title: "Know your trigger", detail: "Decide in advance what would make you grow this into a real move — a signal in your lane, a milestone in the bet. Optionality is only valuable if you'd actually exercise it.", artifact: "A written trigger to go bigger" },
    ],
    traps: [
      "Spreading across five side bets. Optionality is one real foothold, not a hobby list.",
      "Treating it as pure research. A live option needs a real step, however small.",
      "No trigger, so you never act even when the signal comes.",
    ],
    signals: [
      "You feel less trapped in your current lane.",
      "The side bet is real enough that you could lean on it if you had to.",
      "You'd recognise the moment to grow it.",
    ],
    payoff: "You trade a little time now for real freedom later — the power to move by choice, not by force.",
    examples: [
      { match: ["marketing", "content", "data", "analyst", "admin"], field: "Exposed knowledge work", story: "A marketer in an exposed lane spent a few hours a week building toward UX research — a course, one small project, two conversations. When their role narrowed a year later, the option was ready to step onto." },
    ],
    firstMove: "Choose one protected side bet and take the first real step",
  },
];

// Effort + time expectations per play, kept beside the content so a card can set
// expectations before a member commits. Difficulty is the lift asked of you;
// duration is a realistic horizon to work the steps, not a deadline.
const PLAY_META: Record<string, { difficulty: Difficulty; duration: string }> = {
  "take-control":        { difficulty: "Demanding", duration: "A quarter, then ongoing" },
  "prove-mastery":       { difficulty: "Moderate",  duration: "A month to establish" },
  "build-fluency":       { difficulty: "Light",     duration: "A month of daily reps" },
  "become-promotion":    { difficulty: "Demanding", duration: "3–6 months" },
  "deepen-judgment":     { difficulty: "Moderate",  duration: "Ongoing" },
  "own-relationships":   { difficulty: "Light",     duration: "This month, then ongoing" },
  "shift-resilient-lane":{ difficulty: "Demanding", duration: "3–6 months" },
  "move-into-oversight": { difficulty: "Moderate",  duration: "1–3 months" },
  "prepare-new-job":     { difficulty: "Moderate",  duration: "2–6 weeks" },
  "relocate-protected":  { difficulty: "Demanding", duration: "12–18 months" },
  "double-down-physical":{ difficulty: "Moderate",  duration: "This quarter" },
  "earn-credential":     { difficulty: "Demanding", duration: "3–12 months" },
  "productize-expertise":{ difficulty: "Demanding", duration: "A quarter to launch" },
  "adoption-lead":       { difficulty: "Moderate",  duration: "Weeks to seed, then ongoing" },
  "build-optionality":   { difficulty: "Light",     duration: "Ongoing — a few hours a week" },
};

export const PLAYS: Play[] = PLAYS_RAW.map((p) => ({
  ...p,
  ...(PLAY_META[p.slug] ?? { difficulty: "Moderate" as Difficulty, duration: "This month" }),
}));

export const PLAY_BY_SLUG: Record<string, Play> = Object.fromEntries(PLAYS.map((p) => [p.slug, p]));

export function getPlay(slug: string): Play | undefined {
  return PLAY_BY_SLUG[slug];
}

export function playLeverLabel(p: Play): string {
  return LEVER_BY_SLUG[p.lever]?.label ?? p.lever;
}

/** Plays grouped by aim, in AIMS order. */
export function playsByAim(): { aim: Aim; label: string; blurb: string; plays: Play[] }[] {
  return AIMS.map((a) => ({ aim: a.key, label: a.label, blurb: a.blurb, plays: PLAYS.filter((p) => p.aim === a.key) }));
}

/** The winning aim the member's Map points to (edge-2 move; everyone also masters). */
export function recommendedAim(c: MapComputed | null): Aim | null {
  const e2 = c?.move?.edge2;
  return e2 === "guard" || e2 === "shift" || e2 === "relocate" ? e2 : null;
}

/**
 * The plays that fit the member's Map: their edge-2 aim's plays first, plus a
 * couple of "master the machine" plays (which everyone does). Empty if no Map.
 */
export function recommendedPlays(c: MapComputed | null): Play[] {
  if (!c) return [];
  const aim = recommendedAim(c);
  const primary = aim ? PLAYS.filter((p) => p.aim === aim) : [];
  const master = PLAYS.filter((p) => p.aim === "master").slice(0, 2);
  // Primary aim first, then master — deduped, capped.
  const seen = new Set<string>();
  return [...primary, ...master].filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true))).slice(0, 5);
}
