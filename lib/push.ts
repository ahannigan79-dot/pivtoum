import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

let configured: boolean | null = null;

/** Configure VAPID once. Returns whether web push is usable in this environment. */
export function pushConfigured(): boolean {
  if (configured !== null) return configured;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@pivotum.ai";
  if (pub && priv) {
    try { webpush.setVapidDetails(subject, pub, priv); configured = true; }
    catch (err) { console.error("[push] vapid", String(err)); configured = false; }
  } else {
    configured = false;
  }
  return configured;
}

export type PushSub = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function saveSubscription(memberId: string, sub: PushSub): Promise<void> {
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return;
  await db.insert(pushSubscriptions)
    .values({ memberId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { memberId, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });
}

export async function deleteSubscription(endpoint: string): Promise<void> {
  if (!endpoint) return;
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

export type PushPayload = { title: string; body?: string; url?: string; tag?: string };

/** Best-effort lock-screen push to every device a member has registered.
 *  Prunes subscriptions the push service reports as gone (404/410). */
export async function sendPushToMember(memberId: string, payload: PushPayload): Promise<void> {
  if (!pushConfigured()) return;
  const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.memberId, memberId));
  if (!subs.length) return;
  const body = JSON.stringify(payload);
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body);
    } catch (err: unknown) {
      const code = (err as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) await deleteSubscription(s.endpoint); // gone
      else console.error("[push] send", code ?? String(err));
    }
  }));
}
