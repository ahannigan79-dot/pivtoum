import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { memberBlocks, podMembers, profiles } from "@/db/schema";

/** User ids to hide from `meId` — anyone they blocked, and anyone who blocked them. */
export async function getHiddenIds(meId: string | null): Promise<string[]> {
  if (!meId) return [];
  const rows = await db.select({ a: memberBlocks.blockerId, b: memberBlocks.blockedId })
    .from(memberBlocks).where(or(eq(memberBlocks.blockerId, meId), eq(memberBlocks.blockedId, meId)));
  const ids = new Set<string>();
  for (const r of rows) ids.add(r.a === meId ? r.b : r.a);
  return [...ids];
}

/** Has `meId` blocked `otherId` (one-directional, for showing Block/Unblock state)? */
export async function iBlocked(meId: string, otherId: string): Promise<boolean> {
  const r = await db.select({ x: memberBlocks.blockerId }).from(memberBlocks)
    .where(and(eq(memberBlocks.blockerId, meId), eq(memberBlocks.blockedId, otherId))).limit(1);
  return r.length > 0;
}

export async function blockMember(meId: string, otherId: string): Promise<void> {
  if (!meId || !otherId || meId === otherId) return;
  await db.insert(memberBlocks).values({ blockerId: meId, blockedId: otherId }).onConflictDoNothing();
}

export async function unblockMember(meId: string, otherId: string): Promise<void> {
  await db.delete(memberBlocks)
    .where(and(eq(memberBlocks.blockerId, meId), eq(memberBlocks.blockedId, otherId)));
}

/** Whether `meId` is allowed to open/continue a DM with `otherId`. Honors blocks and
 *  the recipient's dm_privacy (all | pods | none). */
export async function canDM(meId: string, otherId: string): Promise<boolean> {
  if (!meId || !otherId || meId === otherId) return false;
  const hidden = await getHiddenIds(meId);
  if (hidden.includes(otherId)) return false;

  const r = await db.select({ dm: profiles.dmPrivacy }).from(profiles)
    .where(eq(profiles.clerkUserId, otherId)).limit(1);
  const policy = r[0]?.dm ?? "all";
  if (policy === "none") return false;
  if (policy === "pods") return sharePod(meId, otherId);
  return true;
}

async function sharePod(a: string, b: string): Promise<boolean> {
  const rows = await db.select({ pod: podMembers.podId, m: podMembers.memberId })
    .from(podMembers).where(and(inArray(podMembers.memberId, [a, b])));
  const aPods = new Set(rows.filter((r) => r.m === a).map((r) => r.pod));
  return rows.some((r) => r.m === b && aPods.has(r.pod));
}
