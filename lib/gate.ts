import { cookies } from "next/headers";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { profiles, pods, podMembers, events } from "@/db/schema";
import { isFounder } from "@/lib/member";
import { getMembership } from "@/lib/billing";
import { getCurrentPrompt, type WeeklyPrompt } from "@/lib/ritual";

/** Founder-only preview override — lets a founder walk each flow while testing. */
export const VIEW_COOKIE = "pv_view";
export type ViewMode = "founder" | "member" | "guest";

export async function getViewMode(): Promise<ViewMode> {
  const v = (await cookies()).get(VIEW_COOKIE)?.value;
  return v === "member" || v === "guest" ? v : "founder";
}

/** Routes a signed-in non-member may still reach (to subscribe / manage settings). */
const PREVIEW_OK = ["/hub/membership", "/hub/settings"];

export function isPreviewAllowed(path: string | null): boolean {
  if (!path) return false;
  return PREVIEW_OK.some((p) => path === p || path.startsWith(p + "/"));
}

export type Access = { member: boolean; founder: boolean };

/** A member (active/trialing subscription) OR a founder gets the full hub.
 *  A real founder can preview the member or guest flow via the view-mode cookie. */
export async function getAccess(userId: string | null, profile: { role?: string | null; email?: string | null } | null): Promise<Access> {
  const founder = isFounder(profile);
  if (founder) {
    const mode = await getViewMode();
    if (mode === "guest") return { member: false, founder: false };  // preview the looking glass
    if (mode === "member") return { member: true, founder: false };  // preview a plain member
    return { member: true, founder: true };
  }
  if (!userId) return { member: false, founder: false };
  const m = await getMembership(userId);
  return { member: m.active, founder: false };
}

export type GlassData = {
  memberCount: number;
  pods: { name: string; members: number }[];
  events: { title: string; startsAt: Date }[];
  prompt: WeeklyPrompt | null;
};

/** Safe, structural proof-of-life for the looking glass — counts and headlines,
 *  never raw member posts. */
export async function getGlassData(): Promise<GlassData> {
  const now = new Date();
  const [memberRows, podRows, podCounts, eventRows, prompt] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(profiles),
    db.select({ id: pods.id, name: pods.name }).from(pods),
    db.select({ podId: podMembers.podId, n: sql<number>`count(*)::int` }).from(podMembers).groupBy(podMembers.podId),
    db.select({ title: events.title, startsAt: events.startsAt }).from(events)
      .where(gte(events.startsAt, now)).orderBy(events.startsAt).limit(3),
    getCurrentPrompt(),
  ]);
  const countByPod = new Map(podCounts.map((r) => [r.podId, r.n]));
  const podList = podRows
    .map((p) => ({ name: p.name, members: countByPod.get(p.id) ?? 0 }))
    .sort((a, b) => b.members - a.members)
    .slice(0, 6);
  return {
    memberCount: memberRows[0]?.n ?? 0,
    pods: podList,
    events: eventRows,
    prompt,
  };
}
