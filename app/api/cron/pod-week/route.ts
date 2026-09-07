import { NextResponse } from "next/server";
import { runPodWeek } from "@/lib/pod-ritual";
import { requireBearer } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * The weekly pod ritual, one daily cron that dispatches by weekday (UTC):
 *   Mon → post the team move · Thu → nudge non-checkins · Sun → close + wrap.
 * `?do=move|nudge|close` forces a specific step (manual runs / testing).
 * Authed like the other crons; closed when CRON_SECRET is unset.
 */
async function handle(req: Request): Promise<NextResponse> {
  const denied = requireBearer(req, "CRON_SECRET");
  if (denied) return denied;

  const raw = new URL(req.url).searchParams.get("do");
  const force = raw === "move" || raw === "nudge" || raw === "close" ? raw : undefined;
  const result = await runPodWeek(new Date(), force);
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
