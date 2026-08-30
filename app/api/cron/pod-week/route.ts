import { NextResponse } from "next/server";
import { runPodWeek } from "@/lib/pod-ritual";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * The weekly pod ritual, one daily cron that dispatches by weekday (UTC):
 *   Mon → post the team move · Thu → nudge non-checkins · Sun → close + wrap.
 * `?do=move|nudge|close` forces a specific step (manual runs / testing).
 * Authed like the other crons; closed when CRON_SECRET is unset.
 */
async function handle(req: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });

  const url = new URL(req.url);
  const auth = req.headers.get("authorization");
  const key = url.searchParams.get("key");
  if (auth !== `Bearer ${secret}` && key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const raw = url.searchParams.get("do");
  const force = raw === "move" || raw === "nudge" || raw === "close" ? raw : undefined;
  const result = await runPodWeek(new Date(), force);
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
