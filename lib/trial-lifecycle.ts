/* ============================================================================
   Trial lifecycle (Phase 1f). Two beats, both in the founder/system voice —
   the pod itself never sells:
     • End-of-trial continuity nudge — "keep your seat; your pod is your team."
     • Conversion celebration — a warm "you're staying" when a trial converts.
   No per-conversion bounty, ever (see the spec). Continuity framing only.
   ============================================================================ */
import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications, profiles } from "@/db/schema";
import { getMyPods } from "@/lib/pods";
import { notifyPod } from "@/lib/notifications";

const DAY = 86400000;

async function alreadyFired(memberId: string, entityId: string): Promise<boolean> {
  const r = await db.select({ id: notifications.id }).from(notifications)
    .where(sql`${notifications.memberId} = ${memberId} and ${notifications.type} = 'pod'
      and ${notifications.payload}->>'entityId' = ${entityId}`).limit(1);
  return r.length > 0;
}

/** Daily: nudge trialing members whose trial ends within ~2 days. Continuity,
 *  not a pitch — and it names their pod, because that's what they'd be leaving. */
export async function runTrialNudges(now = new Date()): Promise<{ nudged: number }> {
  const soon = new Date(now.getTime() + 2 * DAY);
  const rows = await db.select({ id: profiles.clerkUserId, renews: profiles.subRenewsAt }).from(profiles)
    .where(sql`${profiles.subStatus} = 'trialing' and ${profiles.subRenewsAt} is not null
      and ${profiles.subRenewsAt} > ${now} and ${profiles.subRenewsAt} <= ${soon}`);

  let nudged = 0;
  for (const r of rows) {
    if (await alreadyFired(r.id, "trial-end")) continue;
    const mine = await getMyPods(r.id);
    const pod = mine[0];
    await notifyPod(r.id, {
      title: "Your trial ends soon",
      preview: pod ? `Keep your seat — ${pod.name} is your team now.` : "Keep your seat — your community is here.",
      href: "/hub/membership", entityId: "trial-end",
    });
    nudged++;
  }
  return { nudged };
}

/** Fired on a trialing → active transition (from the Stripe sync). A warm,
 *  once-only "you're staying" — sends them back to their pod, not a receipt. */
export async function celebrateConversion(memberId: string): Promise<void> {
  if (await alreadyFired(memberId, "converted")) return;
  const mine = await getMyPods(memberId);
  const pod = mine[0];
  await notifyPod(memberId, {
    title: "You're a Founding member 🎉",
    preview: pod ? `Your seat's yours — see you in ${pod.name}.` : "Your seat's yours — welcome in for good.",
    href: pod ? `/hub/pods/${pod.slug}` : "/hub", entityId: "converted",
  });
}
