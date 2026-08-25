import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { scoutReports } from "@/db/schema";
import { completeWithSearch, parseJSON, aiConfigured } from "@/lib/ai";
import { VOICE } from "@/lib/voice";

/**
 * The weekly article scout — a Claude agent (with web search) that hunts the
 * week's most relevant real articles across the community's key Learn areas and
 * career lanes, tags and summarises them against our thesis, and finds one
 * counterpoint (hype / fearmongering / disagrees) worth engaging. It produces a
 * founder-facing report to seed the Sunday newsletter — it never publishes.
 */

/** The career lanes (mirror the community's pods). Broad pieces group as "General". */
export const SCOUT_LANES = [
  "Marketing & Brand", "Software & Engineering", "Healthcare & Nursing", "Finance & Accounting",
  "Legal & Compliance", "Design & Creative", "Data & Analytics", "Sales & Customer",
  "People & HR", "Operations & Admin", "Education & Training", "Students & Early Career",
] as const;

/** Learn areas → the real-world themes to search for each. */
const SCOUT_AREAS = [
  { learnArea: "Your Six Levers",
    theme: "which specific job tasks AI can now do (and which it still can't); new AI capabilities that widen or narrow task exposure" },
  { learnArea: "Renovate or Relocate",
    theme: "where human judgment, trust, accountability, licensed or hands-on work still hold value; professionals pulling ahead by going AI-native" },
  { learnArea: "Reading the Shifts",
    theme: "labor-market data on AI and jobs; major model or product releases; enterprise AI adoption; regulation shaping how work changes" },
  { learnArea: "Foundations",
    theme: "how individual workers are actually adapting to AI; reskilling that works; the mindset and habits that win" },
] as const;

export type ScoutKind = "hype" | "fearmongering" | "disagrees";

export type ScoutPick = {
  id: string;
  title: string;
  url: string;
  source: string;
  date: string | null;
  lane: string;        // one of SCOUT_LANES or "General"
  learnArea: string;   // one of SCOUT_AREAS.learnArea
  summary: string;     // 2–3 sentence overview
  thesisLink: string;  // how it supports/tests our thesis — the angle for the newsletter
  pullQuote: string | null;
  impact: number;      // 1–5
};

export type Counterpoint = {
  title: string;
  url: string;
  source: string;
  date: string | null;
  kind: ScoutKind;
  summary: string;
  why: string;      // the strongest version of their case (steelman)
  ourAngle: string; // how we'd answer it, grounded in the thesis
};

export type ScoutReport = {
  weekOf: string;
  overview: string;      // a short state-of-the-week Adam can adapt
  leadId: string | null; // the id of the lead story among picks
  picks: ScoutPick[];
  counterpoint: Counterpoint | null;
  generatedAt?: string;  // stamped on read from the DB row
};

const SYSTEM = `${VOICE}

## Your job: the weekly article scout
You are scouting the web for the week's most useful real articles for "Winning in the Age of AI", and producing a briefing the founder will use to write Sunday's member newsletter. You research and curate; you never publish.

Use web search to find articles published in roughly the LAST 10 DAYS. Search across the community's key areas and career lanes (provided below). Aim for genuinely useful, credible pieces — reporting, data, research, sharp analysis — not SEO filler or press releases.

For the main picks:
- Choose the 6–9 most impactful pieces of the week. Favour spread across different lanes and Learn areas over five takes on the same story.
- Tag each with the closest Learn area AND the career lane it speaks to. If a piece is broad or cross-cutting, set its lane to "General".
- Write a 2–3 sentence summary, and a one-line "thesis link": how it supports or tests our thesis (exposure to what AI can do; the six levers; renovate vs relocate; effort lowers exposure). This is the angle Adam can write from.
- Pull one short quotable line where there is a good one (else null). Score impact 1–5 (5 = everyone in the community should see this).
- Pick ONE lead story (its id in leadId).

Also find exactly ONE counterpoint: a piece that disagrees with our thesis, or is clearly AI hype, or is fearmongering. Steelman it ("why" = the strongest version of their case), then give "ourAngle": how we'd answer it, grounded in the thesis. This keeps us honest and gives the newsletter a debate.

Rules:
- Only real articles you actually found via search, with working URLs and the true publication/source name. Never invent a title, URL, quote, or date. If you're unsure a URL is real, drop the pick.
- Skip anything in the ALREADY-COVERED list.
- Voice for summaries/overview: Adam's — direct, grounded, no hype, no emoji.

## Output — STRICT
After searching, output ONLY a JSON object (no prose, no markdown fence) with exactly:
{
  "weekOf": "e.g. 'Week of 24 August 2026'",
  "overview": "2–4 sentences: the throughline of the week, in Adam's voice",
  "leadId": "the id of the lead pick",
  "picks": [
    { "id": "p1", "title": "", "url": "", "source": "", "date": "YYYY-MM-DD or null", "lane": "one of the lanes or General", "learnArea": "one of the Learn areas", "summary": "", "thesisLink": "", "pullQuote": "short quote or null", "impact": 1-5 }
  ],
  "counterpoint": { "title": "", "url": "", "source": "", "date": "YYYY-MM-DD or null", "kind": "hype|fearmongering|disagrees", "summary": "", "why": "", "ourAngle": "" }
}`;

/** URLs from recent reports, so the scout doesn't resurface the same pieces. */
export async function seenUrls(weeks = 8): Promise<string[]> {
  const rows = await db.select({ report: scoutReports.report }).from(scoutReports).orderBy(desc(scoutReports.createdAt)).limit(weeks);
  const urls = new Set<string>();
  for (const r of rows) {
    const rep = r.report as ScoutReport;
    for (const p of rep.picks ?? []) if (p.url) urls.add(p.url);
    if (rep.counterpoint?.url) urls.add(rep.counterpoint.url);
  }
  return [...urls];
}

const clampImpact = (n: unknown) => Math.max(1, Math.min(5, Math.round(Number(n) || 3)));
const laneOf = (s: unknown) => {
  const v = String(s ?? "").trim();
  return (SCOUT_LANES as readonly string[]).includes(v) ? v : "General";
};

function coerce(raw: Partial<ScoutReport> | null, skip: Set<string>): ScoutReport | null {
  if (!raw || !Array.isArray(raw.picks)) return null;
  const picks: ScoutPick[] = [];
  for (const p of raw.picks) {
    if (!p?.title || !p?.url || skip.has(p.url)) continue;
    picks.push({
      id: String(p.id ?? `p${picks.length + 1}`),
      title: String(p.title), url: String(p.url), source: String(p.source ?? "").trim() || "Source",
      date: p.date ? String(p.date) : null,
      lane: laneOf(p.lane), learnArea: String(p.learnArea ?? "").trim() || "General",
      summary: String(p.summary ?? "").trim(),
      thesisLink: String(p.thesisLink ?? "").trim(),
      pullQuote: p.pullQuote ? String(p.pullQuote) : null,
      impact: clampImpact(p.impact),
    });
  }
  if (!picks.length) return null;
  picks.sort((a, b) => b.impact - a.impact);

  const c = raw.counterpoint;
  const counterpoint: Counterpoint | null = c && c.title && c.url && !skip.has(c.url)
    ? {
        title: String(c.title), url: String(c.url), source: String(c.source ?? "").trim() || "Source",
        date: c.date ? String(c.date) : null,
        kind: (["hype", "fearmongering", "disagrees"] as ScoutKind[]).includes(c.kind as ScoutKind) ? (c.kind as ScoutKind) : "disagrees",
        summary: String(c.summary ?? "").trim(), why: String(c.why ?? "").trim(), ourAngle: String(c.ourAngle ?? "").trim(),
      }
    : null;

  const leadId = picks.some((p) => p.id === raw.leadId) ? raw.leadId! : picks[0].id;
  return { weekOf: String(raw.weekOf ?? "").trim() || "This week", overview: String(raw.overview ?? "").trim(), leadId, picks, counterpoint };
}

/** Run the scout: search, curate, validate, dedup. Returns null if AI is off or output is unusable. */
export async function generateScoutReport(): Promise<ScoutReport | null> {
  if (!aiConfigured()) return null;
  const skip = new Set(await seenUrls());

  const areas = SCOUT_AREAS.map((a) => `- ${a.learnArea}: ${a.theme}`).join("\n");
  const lanes = SCOUT_LANES.join(", ");
  const skipList = skip.size ? [...skip].slice(0, 60).map((u) => `- ${u}`).join("\n") : "(none yet)";

  const raw = await completeWithSearch({
    system: SYSTEM,
    maxTokens: 8000,
    maxSearches: 12,
    messages: [
      {
        role: "user",
        content:
          `Scout this week's articles.\n\nKEY AREAS TO SEARCH (Learn area: themes):\n${areas}\n\n` +
          `CAREER LANES to tag against (else "General"):\n${lanes}\n\n` +
          `ALREADY COVERED — skip these URLs:\n${skipList}\n\n` +
          `Search now, then return only the JSON report.`,
      },
    ],
  });
  return coerce(parseJSON<Partial<ScoutReport>>(raw ?? ""), skip);
}

export async function saveScoutReport(report: ScoutReport): Promise<void> {
  await db.insert(scoutReports).values({ report });
}

export async function getLatestScoutReport(): Promise<ScoutReport | null> {
  const rows = await db.select().from(scoutReports).orderBy(desc(scoutReports.createdAt)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return { ...(row.report as ScoutReport), generatedAt: row.createdAt.toISOString() };
}

/** Find a pick (by id) in the latest report — used to hand a scouted piece to the brief. */
export async function findScoutPick(id: string): Promise<ScoutPick | null> {
  const report = await getLatestScoutReport();
  return report?.picks.find((p) => p.id === id) ?? null;
}

/** Generate + persist in one step (used by the cron and the founder "run now"). */
export async function runScout(): Promise<ScoutReport | null> {
  const report = await generateScoutReport();
  if (report) await saveScoutReport(report);
  return report;
}
