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
    steps: [
      { title: "Pick one signature output", detail: "Choose a deliverable you produce regularly that AI makes dramatically faster or better. This becomes your proof piece." },
      { title: "Document the before/after", detail: "Capture what it took before and what it takes now — time, quality, what you now do with the freed hours." },
      { title: "Share the method, not just the result", detail: "Write a short internal note or run a lunch-and-learn showing how you did it. Teaching it is what marks you as the expert." },
      { title: "Make it repeatable for others", detail: "Turn your approach into a template or checklist your team can use. Now you're the person who leveled up the function." },
    ],
    firstMove: "Turn my best AI-native workflow into a proof piece and share the method",
  },
  {
    slug: "build-fluency", title: "Build real AI fluency, not demo fluency", lever: "renovate", aim: "master",
    tagline: "The gap isn't knowing AI exists — it's using it on real, messy work until it's second nature.",
    fit: "You've dabbled but it hasn't changed how you actually work. Time to close the gap for real.",
    steps: [
      { title: "Choose your daily driver", detail: "Pick the one approved AI tool closest to your core work and commit to using it every day for a month — not for toys, for the real thing." },
      { title: "Push it past the easy wins", detail: "Each week, hand it a task you'd normally do yourself. Learn where it's strong, where it lies, and how to check it." },
      { title: "Build your prompt library", detail: "Save the prompts and patterns that work for your actual job. This is the compounding asset most people never build." },
      { title: "Learn to verify fast", detail: "Get sharp at judging AI output at speed — the Judgment Gym trains exactly this. Fluency is trust plus skepticism." },
    ],
    firstMove: "Use my core AI tool daily on real work for the next month",
  },
  {
    slug: "become-promotion", title: "Make yourself the obvious promotion", lever: "trust", aim: "master",
    tagline: "As AI absorbs the task work, the people who rise are the ones trusted with judgment and outcomes.",
    fit: "You want to climb, not just survive. Position yourself where AI pushes value — up the ladder.",
    steps: [
      { title: "Identify the rung above you", detail: "Name the role you're aiming for and the two or three things its holder owns that you don't yet." },
      { title: "Take the judgment work nobody wants", detail: "Volunteer for the calls, the ambiguity, the stakeholder-facing decisions — the parts AI can't own and juniors avoid." },
      { title: "Let AI cover your current load", detail: "Use your AI fluency to clear your task work faster, buying the time to operate a level up." },
      { title: "Make your judgment visible", detail: "Get your name on the decisions and outcomes, not just the outputs. Reputation for judgment is what earns the seat." },
    ],
    firstMove: "Take on one piece of judgment or ownership work from the role above me",
  },

  // ---------------- Guard your moat (edge 2) ----------------
  {
    slug: "deepen-judgment", title: "Deepen the judgment the machine can't give", lever: "judgment", aim: "guard",
    tagline: "AI produces options; humans own the call. Move your hours toward the judgment that carries accountability.",
    fit: "Your role has real decisions inside it — risk, trade-offs, taste, ethics. Lean into them hard.",
    steps: [
      { title: "Name your judgment core", detail: "Write down the three calls in your work where being wrong is expensive and there's no clean formula. That's your moat." },
      { title: "Shift hours toward it", detail: "Use your org's approved AI tools to clear the mechanical work, so you spend more time on the hard calls, not less." },
      { title: "Build a track record", detail: "Start logging the tough calls you make and how they played out. Evidence of good judgment is rare and valuable." },
      { title: "Get closer to the decision", detail: "Position yourself where the real decisions are made — in the room, on the account, at the table." },
    ],
    firstMove: "Move my hours toward the highest-stakes judgment calls in my role",
  },
  {
    slug: "own-relationships", title: "Become the trusted relationship, not the task", lever: "trust", aim: "guard",
    tagline: "Automation takes tasks; it doesn't take the person a client or team actually trusts.",
    fit: "Your work touches clients, patients, stakeholders, or a team. The relationship is a moat AI can't cross.",
    steps: [
      { title: "Map your key relationships", detail: "List the people whose trust makes you hard to replace — clients, senior stakeholders, your team. Rank them by importance." },
      { title: "Invest deliberately", detail: "Put real time into the top few — the calls, the context, the being-there that no tool provides." },
      { title: "Be the human in the loop", detail: "Where AI does the work, be the trusted face who stands behind it and translates it for the people who matter." },
      { title: "Become the go-to for the hard conversations", detail: "The difficult, high-trust conversations are the ones that stay human. Make yourself the person who handles them." },
    ],
    firstMove: "Deepen my three most important professional relationships this month",
  },

  // ---------------- Shift lanes (edge 2) ----------------
  {
    slug: "shift-resilient-lane", title: "Reposition into a more AI-resilient lane", lever: "shift", aim: "shift",
    tagline: "Same field, safer ground — move toward the work in your profession that AI can't easily do.",
    fit: "Your current lane is highly exposed, but your field has more protected corners you can move into.",
    steps: [
      { title: "Find the resilient lanes in your field", detail: "Look across your profession for the roles with lower exposure — usually more judgment, licensing, relationships, or physical presence." },
      { title: "Name the gap", detail: "Pick one target lane and list what it needs that you don't have yet — a skill, a credential, an experience." },
      { title: "Close it deliberately", detail: "Build a 90-day plan to close that gap while you're still secure. Learning on runway beats learning in a crisis." },
      { title: "Get a foot in early", detail: "Volunteer for projects, shadow someone, take the stretch assignment that moves you toward the safer lane." },
    ],
    firstMove: "Pick a more AI-resilient lane in my field and start closing the gap",
  },
  {
    slug: "move-into-oversight", title: "Move up into oversight and accountability", lever: "shift", aim: "shift",
    tagline: "When AI does the work, someone has to own, check, and answer for it. Be that someone.",
    fit: "Your task work is highly automatable, but you understand the domain well enough to supervise it.",
    steps: [
      { title: "Reframe your role as the reviewer", detail: "Shift from producing the work to setting the standard, checking the output, and owning the result." },
      { title: "Sharpen your review judgment", detail: "The skill is catching what AI gets subtly wrong. Train it deliberately — the Judgment Gym is built for this." },
      { title: "Take responsibility explicitly", detail: "Volunteer to be accountable for AI-assisted output in your area. Accountability is the thing that doesn't automate." },
      { title: "Propose the guardrails", detail: "Draft the checks and quality bars for AI-assisted work in your area, and offer to own them. Owning the standard beats just owning the output." },
    ],
    firstMove: "Take ownership of reviewing and standing behind AI-assisted work in my area",
  },
  {
    slug: "prepare-new-job", title: "Prepare for a new job opportunity", lever: "shift", aim: "shift",
    tagline: "If a move is coming — by choice or not — go into the market as visibly AI-native, aimed at resilient roles.",
    fit: "You're considering a move, feel your role narrowing, or just want to be ready. Job-hunt from strength.",
    steps: [
      { title: "Target resilient roles", detail: "Aim your search at roles heavier on judgment, trust, and ownership — the ones with real runway, not the ones AI is hollowing out." },
      { title: "Rewrite your story around AI", detail: "Rebuild your resume and profile around what you now do AI-native and the outcomes you own — not the tasks you used to run." },
      { title: "Build one portfolio proof", detail: "Create one concrete example of AI-native work you can show — the thing that makes an interviewer lean in." },
      { title: "Prepare the AI conversation", detail: "Every serious employer now asks how you use AI. Have a sharp, specific answer with a real example ready." },
    ],
    firstMove: "Rewrite my resume and profile around my AI-native work and outcomes",
  },

  // ---------------- Relocate to protected ground (edge 2) ----------------
  {
    slug: "relocate-protected", title: "Relocate to more protected ground while you have runway", lever: "relocate", aim: "relocate",
    tagline: "When a whole lane is deeply exposed, the honest move is out — deliberately, early, on your terms.",
    fit: "Your work is highly exposed and there's no resilient corner nearby. Better to move by choice than by force.",
    steps: [
      { title: "Face it clearly", detail: "Be honest that the ground is moving under this role. That clarity is what buys you time to move well instead of late." },
      { title: "Find adjacent protected work", detail: "Look for fields that use your existing strengths but sit on more human ground — more hands-on, licensed, or relationship-led." },
      { title: "Build a bridge, don't leap", detail: "Pick a target and start building toward it while you're still earning — a course, a side project, a network." },
      { title: "Set a timeline", detail: "Give yourself a real horizon (say 12–18 months) and concrete milestones. Runway used well beats runway wasted." },
    ],
    firstMove: "Choose a protected field to move toward and set my 12-month bridge plan",
  },
  {
    slug: "double-down-physical", title: "Double down on your physical-presence skills", lever: "physical", aim: "relocate",
    tagline: "Work done with your hands, body, and presence in the real world is the hardest for AI to touch.",
    fit: "Your role has a hands-on or in-person core — care, craft, trades, field work. That's a genuine moat: deepen it.",
    steps: [
      { title: "Name your physical core", detail: "Identify the parts of your work that require being physically present and skilled — the parts a screen can't do." },
      { title: "Deepen the craft", detail: "Invest in mastery of the hands-on skill itself. Depth here is durable in a way screen work no longer is." },
      { title: "Let AI handle your admin", detail: "Use your approved AI tools to clear the paperwork and scheduling around your real work, so more of your time is the irreplaceable part." },
      { title: "Signal the human premium", detail: "As AI floods digital work, in-person skill becomes more valuable, not less. Position yourself as the trusted human option." },
    ],
    firstMove: "Invest in deepening the hands-on core of my work this quarter",
  },
  {
    slug: "earn-credential", title: "Earn the credential that gates the work", lever: "licensing", aim: "relocate",
    tagline: "Some work stays human because the law or a license says a qualified person must do it. Get on that side of the line.",
    fit: "Your field (or an adjacent one) has licensed, regulated, or accredited roles AI can assist but never legally own.",
    steps: [
      { title: "Find the licensed roles near you", detail: "Identify the credentials in or adjacent to your field that legally gate the work — where a human must sign, certify, or be accountable." },
      { title: "Pick the reachable one", detail: "Choose the credential with the best ratio of protection to effort from where you stand today." },
      { title: "Make a study plan on runway", detail: "Map the path — exams, hours, cost — and start while you're secure. Credentials take time; begin before you need it." },
      { title: "Use AI to get there faster", detail: "Let AI tutor you, drill you, and compress the study. The credential is the moat; AI is how you reach it sooner." },
    ],
    firstMove: "Identify the credential that best protects my work and start the path",
  },
];

// Effort + time expectations per play, kept beside the content so a card can set
// expectations before a member commits. Difficulty is the lift asked of you;
// duration is a realistic horizon to work the steps, not a deadline.
const PLAY_META: Record<string, { difficulty: Difficulty; duration: string }> = {
  "take-control":        { difficulty: "Demanding", duration: "A quarter, then ongoing" },
  "prove-mastery":       { difficulty: "Moderate",  duration: "1–2 weeks" },
  "build-fluency":       { difficulty: "Light",     duration: "A month of daily reps" },
  "become-promotion":    { difficulty: "Demanding", duration: "3–6 months" },
  "deepen-judgment":     { difficulty: "Moderate",  duration: "Ongoing" },
  "own-relationships":   { difficulty: "Light",     duration: "This month" },
  "shift-resilient-lane":{ difficulty: "Demanding", duration: "3–6 months" },
  "move-into-oversight": { difficulty: "Moderate",  duration: "1–3 months" },
  "prepare-new-job":     { difficulty: "Moderate",  duration: "2–6 weeks" },
  "relocate-protected":  { difficulty: "Demanding", duration: "12–18 months" },
  "double-down-physical":{ difficulty: "Moderate",  duration: "This quarter" },
  "earn-credential":     { difficulty: "Demanding", duration: "3–12 months" },
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
