import { NextResponse } from "next/server";
import { runEvaNudges } from "@/lib/eva-nudge";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Proactive Eva: nudge members whose committed focus goals have gone quiet,
 * pointing them at their next step. Authed like the other crons; closed when
 * CRON_SECRET is unset.
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

  const result = await runEvaNudges(new Date());
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
