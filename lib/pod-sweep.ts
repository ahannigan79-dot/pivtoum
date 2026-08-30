/* ============================================================================
   Placement safety net (Phase 1c). A member is prompted to pick a pod on
   arrival (day 0). This daily sweep sends one follow-up nudge on day 1, and on
   day 2 auto-places anyone still solo — so nobody is ever left without a team.
   ============================================================================ */
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications, podMembers, profiles } from "@/db/schema";
import { getFounderIds } from "@/lib/pods";
import { autoPlaceMember } from "@/lib/pod-match";
import { notifyPod } from "@/lib/notifications";

export type SweepResult = { scanned: number; nudged: number; placed: number };

const DAY = 86400000;

export async function runPlacementSweep(now = new Date()): Promise<SweepResult> {
  // Active/trialing members who are in no pod at all.
  const rows = await db
    .select({ id: profiles.clerkUserId, createdAt: profiles.createdAt })
    .from(profiles)
    .where(sql`${profiles.subStatus} in ('active','trialing')
      and ${profiles.clerkUserId} not in (select ${podMembers.memberId} from ${podMembers})`);

  const founders = new Set(await getFounderIds());
  let nudged = 0, placed = 0, scanned = 0;

  for (const r of rows) {
    if (founders.has(r.id)) continue; // founders float as helpers, not placed
    scanned++;
    const ageDays = Math.floor((now.getTime() - new Date(r.createdAt).getTime()) / DAY);

    if (ageDays >= 2) {
      const slug = await autoPlaceMember(r.id);
      if (slug) {
        placed++;
        await notifyPod(r.id, {
          title: "You're in a pod",
          preview: "We placed you with the closest fit — go say hi to your team.",
          href: `/hub/pods/${slug}`, entityId: "placed",
        });
      }
    } else if (ageDays >= 1) {
      // One follow-up nudge only.
      const already = await db.select({ id: notifications.id }).from(notifications)
        .where(sql`${notifications.memberId} = ${r.id} and ${notifications.type} = 'pod'
          and ${notifications.payload}->>'entityId' = 'pick-your-pod'`).limit(1);
      if (!already.length) {
        nudged++;
        await notifyPod(r.id, {
          title: "Pick your pod",
          preview: "Your team is waiting — choose one, or we'll place you tomorrow.",
          href: "/hub/pods/place", entityId: "pick-your-pod",
        });
      }
    }
  }

  return { scanned, nudged, placed };
}
