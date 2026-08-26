/**
 * The Winning Year, as data. The founder cadence tool reads this to drive the
 * community each month — the active subject, its weekly prompts, the events to
 * schedule, the reps muscle, and the pod session. Anchored to an October launch;
 * the active month follows the calendar by default, with a founder pin to override.
 * (See the Year One plan for the source content.)
 */

export type EventTemplate = { type: string; title: string; when: 1 | 2 | 3 | 4; desc?: string };

export type CadenceMonth = {
  key: string;          // stable slug
  order: number;        // 1–12, October first
  calMonth: number;     // 0–11 calendar month it anchors to (Oct = 9)
  subject: string;
  tag: string;          // "Launch" | "Lever 3" | "Re-score" | "Member-led" | "The edges" | "The moves"
  reScore?: boolean;
  lesson: string;       // Learn anchor
  prompts: [string, string, string, string]; // weeks 1–4 (Learn / Build / Apply / Evolve)
  qa: string;           // founder Q&A theme
  sme: { topic: string; profile: string };
  pod: string;          // in-pod session
  repsMuscle: string;
  events: EventTemplate[];
};

export const CURRICULUM: CadenceMonth[] = [
  {
    key: "state-of-play", order: 1, calMonth: 9, subject: "State of Play", tag: "Launch",
    lesson: "The Winning Loop + What exposure really measures",
    prompts: [
      "One sentence: where do you stand with AI at work right now — and where do you want to be a year from today?",
      "Name the one skill you'll build this year that AI can't take.",
      "Post your first move — the smallest concrete step you'll take this month.",
      "Set your target: what exposure number are you aiming for by next September, and why that number?",
    ],
    qa: "Setting your year — goals, fears, and where to start when it all feels like a lot.",
    sme: { topic: "The year ahead in AI & work — what's actually coming.", profile: "Expert — a labor economist or futurist who studies AI's impact on jobs." },
    pod: "Goal-setting circle — each member shares their one-year target and one move; the pod holds them to it.",
    repsMuscle: "A first light round across every muscle.",
    events: [{ type: "clinic", title: "Launch kickoff — State of the Field", when: 1, desc: "Open the community; the goals wall goes up." }],
  },
  {
    key: "automatability", order: 2, calMonth: 10, subject: "Automatability", tag: "Lever 1",
    lesson: "Automatability (Your Six Levers)",
    prompts: [
      "Which 20% of your weekly work could a capable AI already do? Be honest — list three tasks.",
      "In the Gym this week, where did AI's work look right but wasn't? What tipped you off?",
      "Share one task you handed to AI this week — and what you did with the time it freed.",
      "Has your automatability picture changed since you first mapped it? Re-read your Map.",
    ],
    qa: "What's actually automatable in your work — and what it frees you for.",
    sme: { topic: "What I automated, what I couldn't, and where my people went.", profile: "Expert — an ops leader or automation consultant." },
    pod: "Automatability audit — each member names their most-automatable task; the pod brainstorms higher-value work to move toward.",
    repsMuscle: "Catching the machine's mistakes on the tasks it can already do.",
    events: [{ type: "clinic", title: "Clinic — reading your automatability honestly", when: 2 }],
  },
  {
    key: "trust", order: 3, calMonth: 11, subject: "Trust & Relationships", tag: "Lever 2",
    lesson: "Trust and accountability (Your Six Levers)",
    prompts: [
      "Who trusts you personally — a client, patient, colleague — and what earned it?",
      "Where in your work is the relationship the moat AI can't cross? Name it.",
      "Share one thing you did this week to deepen a real relationship at work.",
      "AI can do your tasks but not your relationships — so where should you invest?",
    ],
    qa: "The trust moat — becoming the person, not the output.",
    sme: { topic: "Why people still choose the person.", profile: "Career — a relationship-first pro: a top advisor, clinician, or key-account lead." },
    pod: "Trust map — each member names their three strongest professional relationships and one to build.",
    repsMuscle: "Where the relationship is the moat.",
    events: [{ type: "clinic", title: "Clinic — building the trust moat", when: 2 }],
  },
  {
    key: "judgment", order: 4, calMonth: 0, subject: "Judgment", tag: "Lever 3",
    lesson: "The Ladder + Judgment (Your Six Levers)",
    prompts: [
      "What's a call in your work that only a human should make — and why can't the machine make it?",
      "In the Gym, what was the buried flaw you almost shipped? What would it have cost?",
      "Share a moment this week your judgment beat the AI's confident answer.",
      "Where on the ladder are you spending your time — and where should you be?",
    ],
    qa: "The judgment premium — moving up the ladder from what AI takes to what it can't.",
    sme: { topic: "The calls I make that can't be handed off.", profile: "Career — a senior practitioner whose job is the call: a physician, a firm partner, a lead investigator." },
    pod: "Judgment swap — each member brings a hard call; the pod pressure-tests how they'd decide.",
    repsMuscle: "The core ship-or-flag reps on the AI's polished output — the Gym's heart.",
    events: [{ type: "clinic", title: "Clinic — the judgment premium", when: 2 }],
  },
  {
    key: "physical", order: 5, calMonth: 1, subject: "Physical & Presence", tag: "Lever 4",
    lesson: "Physical presence (Your Six Levers)",
    prompts: [
      "How much of your value is embodied or in-person — the part that only happens when you're there?",
      "Where does judgment in your work live in the room, not on the screen?",
      "Share a moment this week where being physically present made the difference.",
      "How could you lean more into the presence premium in your role?",
    ],
    qa: "The presence premium — the value AI can't touch.",
    sme: { topic: "The value of being in the room.", profile: "Career — a master of embodied work: a surgeon, a trades master, a performer." },
    pod: "Presence audit — where does your work require you, in person, and where could it more?",
    repsMuscle: "The embodied edge — judgment that lives in the room.",
    events: [{ type: "deep_dive", title: "Deep-dive — the presence premium", when: 2 }],
  },
  {
    key: "the-shifts", order: 6, calMonth: 2, subject: "The Shifts", tag: "Re-score", reScore: true,
    lesson: "The Shifts module — Machine, Value Shift, Reshaping, Openings, Forces",
    prompts: [
      "Name one shift in your field right now that most people are missing.",
      "The new baselines dropped. Did your market number move — and does it match what you see on the ground?",
      "Where's the new opening in your field — the work that's growing because of AI, not shrinking?",
      "After the re-score: what's one thing you'll do differently now the ground has moved?",
    ],
    qa: "The re-score explained — what moved, why, and what it means for your number.",
    sme: { topic: "What actually moved this half-year — the data behind the new baselines.", profile: "Expert — a labor economist or AI-and-work researcher." },
    pod: "Shift-spotting — each member brings one real shift in their field; the pod sorts signal from hype.",
    repsMuscle: "Telling a real shift from hype.",
    events: [{ type: "rescore", title: "State of the Shifts — spring re-score", when: 4, desc: "The half-year flagship. The community re-scores together." }],
  },
  {
    key: "licensing", order: 7, calMonth: 3, subject: "Licensing & Accountability", tag: "Lever 5",
    lesson: "Licensing (Your Six Levers)",
    prompts: [
      "What are you accountable for that a machine can't be — where does the buck stop with you?",
      "In the Gym, what did you approve that would've become your liability? What did you catch?",
      "Share where your sign-off, license, or accountability is a moat in your work.",
      "How could you make your accountability more central — more clearly yours to own?",
    ],
    qa: "Owning the sign-off — accountability as the thing that can't be automated.",
    sme: { topic: "Accountability as the moat AI can't hold.", profile: "Career — a regulated professional: a lawyer, a CPA, an auditor." },
    pod: "Sign-off review — where does responsibility rest with each member, and how to lean into it?",
    repsMuscle: "The sign-off — spotting what quietly becomes your liability.",
    events: [{ type: "clinic", title: "Clinic — owning the sign-off", when: 2 }],
  },
  {
    key: "ai-fluency", order: 8, calMonth: 4, subject: "AI-Fluency", tag: "Lever 6",
    lesson: "The Workflow Rebuild is the lesson (learn-by-doing)",
    prompts: [
      "Where are you still competing with AI instead of wielding it? Name one workflow you could rebuild.",
      "You rebuilt a workflow — what surprised you about where AI fit and where it didn't?",
      "Share your transformation doc (or the gist) — what changes, and where your people move up.",
      "What's one workflow you'll rebuild next? Fluency compounds.",
    ],
    qa: "Becoming AI-native — wielding the tool better than everyone around you.",
    sme: { topic: "How I rebuilt my work around AI — and out-shipped everyone.", profile: "Expert — an AI-native operator who rebuilt their own workflow." },
    pod: "Rebuild clinic — each member shares a workflow; the pod suggests where AI fits and where judgment stays.",
    repsMuscle: "Reps + the Workflow Rebuild is the centerpiece.",
    events: [{ type: "deep_dive", title: "Deep-dive — becoming AI-native", when: 2 }],
  },
  {
    key: "renovate", order: 9, calMonth: 5, subject: "Renovate Your Role", tag: "The edges",
    lesson: "The two edges + Guard, Shift, or Relocate",
    prompts: [
      "What's the strongest edge in your current role — the thing you'd double down on to stay?",
      "In the Gym, where did sharpening your existing judgment pay off?",
      "Share a renovation play you're running — how you're making your current role AI-native.",
      "Is renovating enough for you — or is this the start of a bigger move?",
    ],
    qa: "Renovating your role — winning without leaving.",
    sme: { topic: "How I made my job AI-native without leaving it.", profile: "Career — someone who reinvented their role in place." },
    pod: "Edge-sharpening — each member names their strongest edge and one way to renovate it.",
    repsMuscle: "Sharpening your existing edge.",
    events: [{ type: "clinic", title: "Clinic — renovating your role", when: 2 }],
  },
  {
    key: "showcase", order: 10, calMonth: 6, subject: "Showcase", tag: "Member-led",
    lesson: "No new lesson — the members are the curriculum",
    prompts: [
      "Pitch to present: what have you built, rebuilt, or moved this year that others could learn from?",
      "Watching a member showcase — what's one thing you're stealing for your own work?",
      "Share your own showcase, big or small — a win, a workflow, a lesson.",
      "Three-quarter check: what's moved on your Map since October?",
    ],
    qa: "Open floor — member wins, questions, and what's working.",
    sme: { topic: "The members are the guests — several Open Stage showcase slots.", profile: "Member-hosted, sourced by pod leaders. No outside headline this month." },
    pod: "Pod showcase — each member presents their biggest move of the year; the pod nominates one for the community stage.",
    repsMuscle: "A lighter mixed round.",
    events: [{ type: "wins", title: "Mid-year Celebrate the Wins", when: 4, desc: "Hosted by the pod leaders." }],
  },
  {
    key: "relocate", order: 11, calMonth: 7, subject: "Relocate", tag: "The moves",
    lesson: "Guard, Shift, or Relocate — the relocate side",
    prompts: [
      "If you had to move up or across, where would you go — and why there?",
      "In the Gym, what did you learn about judging when to move, not just how?",
      "Share a relocation play — a concrete step toward safer or higher ground.",
      "Renovate or relocate — which is your play for the year ahead?",
    ],
    qa: "Making the move — when to relocate, and how to do it deliberately.",
    sme: { topic: "How I made the move — and how you'd know it's time.", profile: "Career — a career-changer who moved up or across on purpose, or a career strategist." },
    pod: "Move-or-stay — each member argues their renovate-vs-relocate call; the pod stress-tests it.",
    repsMuscle: "Judging when to move.",
    events: [{ type: "deep_dive", title: "Deep-dive — making the move", when: 2 }],
  },
  {
    key: "reading-the-shifts", order: 12, calMonth: 8, subject: "Reading the Shifts", tag: "Re-score", reScore: true,
    lesson: "Reading the Shifts — signal from noise + Why we re-score",
    prompts: [
      "What's changed in your field since the March re-score — signal, or noise?",
      "The second re-score dropped. How's your market number moved across the whole year?",
      "Re-score your Map, then post your journey — where you started in October, where you are now.",
      "Did you hit the target you set in October? Set next year's — the loop comes round again.",
    ],
    qa: "The year in review — reading the autumn re-score, and what you learned across twelve months.",
    sme: { topic: "Where work is heading into next year — reading the signals.", profile: "Expert — a futurist or economist, framing year two." },
    pod: "Year-end reflection — each member shares their journey and next-year target; the pod celebrates the distance travelled.",
    repsMuscle: "Re-judging as the field moves.",
    events: [
      { type: "rescore", title: "State of the Shifts — autumn re-score", when: 4, desc: "The community re-scores together." },
      { type: "wins", title: "Year-end Celebrate the Wins", when: 4, desc: "Hosted by the pod leaders — the finale." },
    ],
  },
];

export const MONTH_BY_KEY: Record<string, CadenceMonth> = Object.fromEntries(CURRICULUM.map((m) => [m.key, m]));

/** The curriculum month for a given calendar month (0–11). */
export function monthForCalendar(calMonth: number): CadenceMonth {
  return CURRICULUM.find((m) => m.calMonth === calMonth) ?? CURRICULUM[0];
}

/** Which week of the calendar month we're in, 1–4 (capped). */
export function weekOfMonth(d = new Date()): 1 | 2 | 3 | 4 {
  return Math.min(4, Math.ceil(d.getDate() / 7)) as 1 | 2 | 3 | 4;
}

/** The active month: a founder pin if set, else the current calendar month. */
export function activeMonth(pinnedKey?: string | null, d = new Date()): CadenceMonth {
  if (pinnedKey && MONTH_BY_KEY[pinnedKey]) return MONTH_BY_KEY[pinnedKey];
  return monthForCalendar(d.getMonth());
}

/** This week's prompt for a month. */
export function promptForWeek(m: CadenceMonth, week = weekOfMonth()): string {
  return m.prompts[Math.min(3, Math.max(0, week - 1))];
}
