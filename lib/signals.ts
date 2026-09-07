import "server-only";
import { getLatestScoutReport, SCOUT_LANES, type ScoutPick } from "@/lib/article-scout";
import { getOrCreateProfile } from "@/lib/member";

/* Dashboard "Signals" — this week in AI, tuned to the member's field. Reuses the
 * article-scout report the founder already generates weekly (Claude + web
 * search), so there's no per-member AI cost: we just pick the pieces in their
 * lane, then the broad "General" AI news, and show them the member-safe fields
 * (title, source, summary) — never the internal thesis angle or the counterpoint. */

export type Signal = {
  id: string; title: string; url: string; source: string; date: string | null;
  summary: string; lane: string; impact: number; field: boolean;
};
export type MemberSignals = { weekOf: string; fieldLabel: string | null; items: Signal[] } | null;

/** Map the member's career/lane text to one of the scout's broad lanes. */
function matchScoutLane(text: string): (typeof SCOUT_LANES)[number] | null {
  const s = text.toLowerCase();
  const rules: [RegExp, (typeof SCOUT_LANES)[number]][] = [
    [/account|audit|\bcpa\b|finance|\btax\b|bookkeep|controller|fp&a|treasur/, "Finance & Accounting"],
    [/market|brand|content|social|comms|\bpr\b|growth|seo/, "Marketing & Brand"],
    [/software|engineer|developer|devops|programmer|backend|frontend|full-?stack/, "Software & Engineering"],
    [/legal|complian|counsel|paralegal|attorney|lawyer|contract/, "Legal & Compliance"],
    [/design|creative|\bux\b|\bui\b|illustrat|copywriter/, "Design & Creative"],
    [/\bdata\b|analyt|analyst|scien|\bbi\b|statistic/, "Data & Analytics"],
    [/sales|account manage|customer|revenue|\bcs\b|success/, "Sales & Customer"],
    [/\bhr\b|people|recruit|talent|human resources/, "People & HR"],
    [/health|nurse|clinical|\bcare\b|medical|patient/, "Healthcare & Nursing"],
    [/operation|\badmin\b|project manage|program manage|coordinator|logistics/, "Operations & Admin"],
    [/educat|teacher|train|instruct|professor|tutor/, "Education & Training"],
    [/student|graduate|entry|early career|intern/, "Students & Early Career"],
  ];
  for (const [re, lane] of rules) if (re.test(s)) return lane;
  return null;
}

const byImpact = (a: ScoutPick, b: ScoutPick) => (b.impact ?? 0) - (a.impact ?? 0);
const toSignal = (p: ScoutPick, field: boolean): Signal =>
  ({ id: p.id, title: p.title, url: p.url, source: p.source, date: p.date, summary: p.summary, lane: p.lane, impact: p.impact, field });

/** The member's weekly signals: their field's picks first, then broad AI news. */
export async function memberSignals(userId: string | null, max = 5): Promise<MemberSignals> {
  if (!userId) return null;
  const [report, profile] = await Promise.all([getLatestScoutReport(), getOrCreateProfile()]);
  if (!report || !report.picks.length) return null;

  const laneKey = matchScoutLane(`${profile?.careerSlug ?? ""} ${profile?.currentLane ?? ""}`);
  const picks = report.picks;
  const field = laneKey ? picks.filter((p) => p.lane === laneKey).sort(byImpact) : [];
  const fieldIds = new Set(field.map((p) => p.id));
  const general = picks.filter((p) => p.lane === "General" && !fieldIds.has(p.id)).sort(byImpact);
  const rest = picks.filter((p) => !fieldIds.has(p.id) && p.lane !== "General").sort(byImpact);

  const items = [
    ...field.map((p) => toSignal(p, true)),
    ...general.map((p) => toSignal(p, false)),
    ...rest.map((p) => toSignal(p, false)),
  ].slice(0, max);
  if (!items.length) return null;
  return { weekOf: report.weekOf, fieldLabel: laneKey, items };
}
