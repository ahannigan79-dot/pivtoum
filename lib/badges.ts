import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { memberBadges } from "@/db/schema";
import type { MemberActivity } from "@/lib/effort";

/* Credentials, not points. Each badge marks a real milestone in the work —
 * something the member actually did, shown as an earned credential. */

export type BadgeDef = { key: string; name: string; icon: string; note: string };

export const BADGES: BadgeDef[] = [
  { key: "welcomed", name: "Welcomed", icon: "🤝", note: "Booked your 1:1 welcome with Adam" },
  { key: "mapped", name: "Mapped", icon: "🧭", note: "Built your first Winning Map" },
  { key: "cohort", name: "In a Pod", icon: "👥", note: "Joined your accountability pod" },
  { key: "committed", name: "In Motion", icon: "◆", note: "Committed your first move" },
  { key: "shipped", name: "First Ship", icon: "🚀", note: "Shipped your first move" },
  { key: "operator", name: "Operator", icon: "🎯", note: "Logged your first Build rep" },
  { key: "evolving", name: "Evolving", icon: "🔄", note: "Re-scored your Map for the first time" },
  { key: "steadfast", name: "Steadfast", icon: "🧭", note: "Re-scored 3 times — keeping pace with the field" },
  { key: "sharpened", name: "Sharpened", icon: "🥊", note: "Logged Build reps across 3 tools" },
  { key: "sharp-operator", name: "Sharp Operator", icon: "🎯", note: "Trained across every Build tool" },
  { key: "momentum", name: "Momentum", icon: "🚀", note: "Shipped 5 moves" },
  { key: "relentless", name: "Relentless", icon: "🔥", note: "Shipped 10 moves" },
  { key: "grounded", name: "Grounded", icon: "📚", note: "Studied your six levers in Learn" },
  { key: "in-the-room", name: "In the Room", icon: "💬", note: "Posted in the community" },
  { key: "engaged", name: "Engaged", icon: "🙌", note: "Reacted and replied — being part of it" },
  { key: "regular", name: "Regular", icon: "⭐", note: "Showed up 7 days" },
];

export const BADGE_BY_KEY: Record<string, BadgeDef> = Object.fromEntries(BADGES.map((b) => [b.key, b]));

/** Recompute threshold/milestone credentials from activity and award any newly
 *  earned (idempotent). Cheap enough to run on dashboard load. */
export async function evaluateBadges(userId: string, a: MemberActivity): Promise<void> {
  const earned: string[] = [];
  if (a.maps >= 2) earned.push("evolving");
  if (a.maps >= 4) earned.push("steadfast");
  if (a.buildReps >= 3) earned.push("sharpened");
  if (a.buildReps >= 5) earned.push("sharp-operator");
  if (a.shipped >= 5) earned.push("momentum");
  if (a.shipped >= 10) earned.push("relentless");
  if (a.learn >= 1) earned.push("grounded");
  if (a.posts >= 1) earned.push("in-the-room");
  if (a.reactions + a.comments >= 10) earned.push("engaged");
  if (a.streak >= 7 || a.visits >= 7) earned.push("regular");

  for (const key of earned) await awardBadge(userId, key);
}

export type EarnedBadge = BadgeDef & { earnedAt: Date };

/** Award a badge (idempotent). The catalog row is seeded via the migration patch. */
export async function awardBadge(userId: string, key: string): Promise<void> {
  if (!BADGE_BY_KEY[key]) return;
  await db.insert(memberBadges).values({ memberId: userId, badgeKey: key }).onConflictDoNothing();
}

export async function getEarnedBadges(userId: string | null): Promise<EarnedBadge[]> {
  if (!userId) return [];
  const rows = await db
    .select({ key: memberBadges.badgeKey, earnedAt: memberBadges.earnedAt })
    .from(memberBadges).where(eq(memberBadges.memberId, userId)).orderBy(asc(memberBadges.earnedAt));
  return rows
    .map((r) => (BADGE_BY_KEY[r.key] ? { ...BADGE_BY_KEY[r.key], earnedAt: r.earnedAt } : null))
    .filter((b): b is EarnedBadge => b !== null);
}
