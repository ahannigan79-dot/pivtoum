import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { memberBadges } from "@/db/schema";

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
];

export const BADGE_BY_KEY: Record<string, BadgeDef> = Object.fromEntries(BADGES.map((b) => [b.key, b]));

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
