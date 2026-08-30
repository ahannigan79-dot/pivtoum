import { NextResponse } from "next/server";
import { runPlacementSweep } from "@/lib/pod-sweep";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Daily placement safety net (see vercel.json). Nudges day-1 solo members and
 * auto-places day-2 ones. Authenticates like the other crons: Vercel sends
 * `Authorization: Bearer ${CRON_SECRET}`; `?key=` is accepted for manual runs.
 * With no secret configured the endpoint is closed.
 */
async function handle(req: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });

  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (auth !== `Bearer ${secret}` && key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await runPlacementSweep();
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
