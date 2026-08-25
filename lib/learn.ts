import { and, eq, like } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";

// A section can carry one paragraph, several paragraphs (string[]), and/or a
// bullet list — enough to hold the full depth of the source lessons without any
// HTML/markdown (stays plain-text, auto-escaped, no sanitizer needed).
export type Section = { h: string; p?: string | string[]; bullets?: string[] };
export type Lesson = { key: string; title: string; minutes: number; summary: string; sections: Section[] };
export type Module = { slug: string; title: string; blurb: string; lessons: Lesson[] };

/* The Learn curriculum — the ideas behind the Map, written to be read in a sitting.
   Completing a lesson counts as effort (learn:*) and buys down exposure over time. */
export const CURRICULUM: Module[] = [
  {
    slug: "foundations", title: "Foundations", blurb: "The stance everything else stands on.",
    lessons: [
      {
        key: "embrace", title: "Embrace — run toward the change", minutes: 3,
        summary: "Resisting AI is the losing move. Making it your instrument is the winning one.",
        sections: [
          { h: "The instinct to resist is the trap", p: "Every big shift punishes the people who freeze and rewards the people who move first. AI is no different. The urge to wait it out, or to hope your corner stays untouched, feels safe — but it hands the advantage to whoever leans in while you hesitate." },
          { h: "Make it your instrument", p: "Embrace means bringing AI into your actual work: doing the reps, finding where it makes you faster, and learning its limits by using it, not reading about it. The goal isn't to compete with the machine — it's to become the person who wields it better than anyone else in your lane." },
          { h: "Build is how you Embrace", p: "Embrace isn't a mindset you affirm, it's reps you log. That's why the Loop has a Build space — a place to master the machine on the tasks it's taking, and to deepen the human edges it can't reach." },
        ],
      },
      {
        key: "together", title: "Together — nobody wins alone", minutes: 3,
        summary: "A shift this big isn't navigated solo. Being seen and held to your word is what turns intent into motion.",
        sections: [
          { h: "Isolation is where plans die", p: "You can build a perfect plan and never touch it. What moves people isn't willpower — it's being watched, in the good sense: a small group who expect to hear what you shipped this week." },
          { h: "Your pod is the engine", p: "A Together pod is a handful of people in your lane, on the same climb. You share your Map, your moves, your wins and your stuck points. The accountability is the product — it's the difference between knowing what to do and actually doing it." },
          { h: "Be generous, be steady", p: "The room works when people show up honestly: post the messy middle, not just the wins; answer someone's question when you know the answer; keep coming back. That's Together — and it's how the whole community compounds." },
        ],
      },
    ],
  },
  {
    slug: "loop", title: "The Winning Loop", blurb: "How the whole system fits together.",
    lessons: [
      {
        key: "loop", title: "Learn → Map → Build → Evolve", minutes: 3,
        summary: "One loop turns a vague worry into a plan you run every week.",
        sections: [
          { h: "Four moves, one cycle", p: "Learn the rules of the game. Map where you stand. Build the edges that matter for your lane. Evolve — re-score, adjust, and keep moving. It's a loop, not a checklist: you come back around as the field shifts and as you put in the work." },
          { h: "Everything hangs off your Map", p: "Your Map is the spine. It scores your exposure, names your winning strategy, and points to the moves that lower it. Learn feeds it, Build acts on it, Evolve tracks it. When you're not sure what to do next, the Map has an answer." },
        ],
      },
      {
        key: "exposure", title: "What exposure really measures", minutes: 4,
        summary: "Your score is an honest read of forces mostly outside your control — not a verdict on you.",
        sections: [
          { h: "It measures the work, not your worth", p: "Exposure is how much of your lane's work AI can already do, plus how fast that's moving. It's a market read. A high score isn't a judgment of your talent — it's a warning about the ground you're standing on." },
          { h: "Forces you don't control, and levers you do", p: "The market baseline (what your lane scores) is largely out of your hands — that's why we're honest about it. But your personal protections — judgment, trust, the licence you hold, the hands-on work you do — are levers you can pull, and they move your score within bounds." },
          { h: "Honest beats flattering", p: "We'd rather show you a number that stings and is true than one that comforts and isn't. A real read is the only thing you can actually act on." },
        ],
      },
    ],
  },
  {
    slug: "levers", title: "Your Six Levers", blurb: "Two expose you. Four protect you.",
    lessons: [
      {
        key: "exposing", title: "The two that expose you", minutes: 3,
        summary: "Automatability and entry-erosion — the forces that raise your score as AI improves.",
        sections: [
          { h: "Automatability — what AI can already do", p: "The screen-and-language work models handle well today: drafting, summarizing, routine analysis, pattern-following. The more of your day is this, the more exposed you are — and the faster it moves, because these capabilities improve monthly, not yearly." },
          { h: "Entry-erosion — the ladder compresses", p: "AI takes the junior rungs first. When one person plus AI does the work of a small team, the entry-level tasks that used to train the next generation thin out. If your value was built on those rungs, the climb gets steeper. Naming this early lets you build value that doesn't depend on them." },
        ],
      },
      {
        key: "protecting", title: "The four that protect you", minutes: 4,
        summary: "Trust, judgment, physical, and licensing — the ground AI can't easily reach.",
        sections: [
          { h: "Trust — relied on by name", p: "Work where the relationship is the product. AI can draft the email, but it can't be the person a client trusts with the decision, or the one who's held responsible when it matters. Deepen this and you're hard to replace." },
          { h: "Judgment — the high-stakes, ambiguous call", p: "Decisions where being right really matters and the answer isn't in the data. Owning the call under uncertainty — and being accountable for it — is the job AI can assist but not hold." },
          { h: "Physical — hands-on, in the room", p: "Work that happens in person, with your hands. The further your value sits from a screen, the harder it is for a model to reach it." },
          { h: "Licensing — the credential gate", p: "Where the law requires a credentialed human. It's the slowest moat to erode and the hardest to cross — a legal monopoly no software can hold." },
        ],
      },
    ],
  },
  {
    slug: "strategy", title: "Renovate or Relocate", blurb: "The two edges, and the play you choose.",
    lessons: [
      {
        key: "edges", title: "The two edges", minutes: 3,
        summary: "Master the machine on what it's taking; deepen what it can't take.",
        sections: [
          { h: "Edge 1 — master the machine (Renovate)", p: "On the exposing levers, don't run — get faster than everyone else. Become the person in your lane who does the AI-assisted work best. This is Renovate: rebuild how you work around the tools so you set the pace instead of being outpaced." },
          { h: "Edge 2 — deepen what AI can't take", p: "On the protecting levers, invest. Move your value toward judgment, trust, the credential, the hands-on. This is where durable advantage lives — the parts of the work that get more valuable, not less, as the routine parts get automated." },
        ],
      },
      {
        key: "play", title: "Guard, Shift, or Relocate", minutes: 3,
        summary: "Your Map names one of three plays for Edge 2. Here's what each means.",
        sections: [
          { h: "Guard the moat", p: "You already sit on strong protection — a licence, deep trust, real judgment. The play is to guard and deepen it: make the protected part more of your work, and don't let the routine parts define you." },
          { h: "Shift lanes", p: "You're exposed where you are, but a nearby lane rewards the same skills with far more protection. The play is a lateral move toward that ground — same you, safer footing." },
          { h: "Relocate", p: "The exposure is high and the protection is thin. The honest play is a deliberate move to different ground — planned, not panicked. Relocate is the hardest play and sometimes the only right one." },
        ],
      },
    ],
  },
  {
    slug: "shifts", title: "Reading the Shifts", blurb: "How to stay ahead once you've started.",
    lessons: [
      {
        key: "signals", title: "Reading the field signals", minutes: 3,
        summary: "Staying ahead is a habit of noticing — not a one-time plan.",
        sections: [
          { h: "Watch the capability, not the hype", p: "Ignore the noise about what AI might do someday. Track what it can actually do in your lane this quarter, and what your peers are already handing to it. The gap between those two is where your next move lives." },
          { h: "Small signals, early", p: "A new tool your team quietly adopts, a task that used to take a day now taking an hour, a job posting that lists AI skills you don't have — these are the early tremors. Reading them before they're obvious is the whole edge of showing up regularly." },
        ],
      },
      {
        key: "rescore", title: "Why we re-score", minutes: 2,
        summary: "The field moves, so your Map has to move with it — on a cadence.",
        sections: [
          { h: "Two clocks", p: "Your personal factors change as you put in the work — so you re-score those every two months. The market baseline changes as AI improves — so Pivotum re-scores your lane every six. Between them, your Map stays honest instead of drifting out of date." },
          { h: "Effort shows up here", p: "Re-scoring is also where your work pays off visibly: the reps you logged, the moves you shipped, the protection you deepened all show up as your exposure comes down. That's the loop closing — and the reason to keep going." },
        ],
      },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = CURRICULUM.flatMap((m) => m.lessons);
export const LESSON_BY_KEY: Record<string, Lesson> = Object.fromEntries(ALL_LESSONS.map((l) => [l.key, l]));

export function findLesson(key: string): { lesson: Lesson; module: Module; prev: Lesson | null; next: Lesson | null } | null {
  const lesson = LESSON_BY_KEY[key];
  if (!lesson) return null;
  const module = CURRICULUM.find((m) => m.lessons.some((l) => l.key === key))!;
  const idx = ALL_LESSONS.findIndex((l) => l.key === key);
  return { lesson, module, prev: ALL_LESSONS[idx - 1] ?? null, next: ALL_LESSONS[idx + 1] ?? null };
}

/** Set of completed lesson keys (without the `learn:` prefix). */
export async function getLearnProgress(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await db.select({ key: lessonProgress.lessonKey, status: lessonProgress.status })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.memberId, userId), like(lessonProgress.lessonKey, "learn:%")));
  const done = new Set<string>();
  for (const r of rows) if (r.status === "complete") done.add(r.key.replace(/^learn:/, ""));
  return done;
}

export function learnTotals(done: Set<string>) {
  const total = ALL_LESSONS.length;
  const complete = ALL_LESSONS.filter((l) => done.has(l.key)).length;
  return { total, complete, pct: total ? Math.round((complete / total) * 100) : 0 };
}
