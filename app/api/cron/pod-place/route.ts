import { NextResponse } from "next/server";
import { runPlacementSweep } from "@/lib/pod-sweep";
import { runTrialNudges } from "@/lib/trial-lifecycle";
import { requireBearer } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Daily membership-lifecycle sweep (see vercel.json): nudges day-1 solo members,
 * auto-places day-2 ones, and sends the end-of-trial continuity nudge to trials
 * ending within ~2 days. Authenticates like the other crons: Vercel sends
 * `Authorization: Bearer ${CRON_SECRET}`. With no secret configured the endpoint
 * is closed.
 */
async function handle(req: Request): Promise<NextResponse> {
  const denied = requireBearer(req, "CRON_SECRET");
  if (denied) return denied;

  const [placement, trials] = await Promise.all([runPlacementSweep(), runTrialNudges()]);
  return NextResponse.json({ ok: true, ...placement, trialNudged: trials.nudged });
}

export const GET = handle;
export const POST = handle;
