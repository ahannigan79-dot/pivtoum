import { NextResponse } from "next/server";
import { runScout } from "@/lib/article-scout";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Weekly article scout. Wired to a Vercel Cron for Saturday (see vercel.json) so
 * the founder has a fresh briefing to write Sunday's newsletter from. Auth mirrors
 * the digest cron: `Authorization: Bearer ${CRON_SECRET}` or `?key=` for manual
 * runs. Closed entirely when no secret is configured.
 */
async function handle(req: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });

  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (auth !== `Bearer ${secret}` && key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const report = await runScout();
  if (!report) return NextResponse.json({ ok: false, reason: "no report (AI off or nothing found)" });
  return NextResponse.json({ ok: true, picks: report.picks.length, counterpoint: Boolean(report.counterpoint) });
}

export const GET = handle;
export const POST = handle;
