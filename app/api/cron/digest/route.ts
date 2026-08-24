import { NextResponse } from "next/server";
import { runWeeklyDigest } from "@/lib/digest";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Weekly digest / re-engagement send. Wired to a Vercel Cron (see vercel.json).
 * Vercel Cron authenticates with `Authorization: Bearer ${CRON_SECRET}`; we also
 * accept `?key=` for manual runs. If no secret is configured the endpoint is
 * closed, so it can never fire publicly.
 */
async function handle(req: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });

  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (auth !== `Bearer ${secret}` && key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await runWeeklyDigest();
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
