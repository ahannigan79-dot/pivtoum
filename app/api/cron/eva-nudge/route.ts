import { NextResponse } from "next/server";
import { runEvaNudges } from "@/lib/eva-nudge";
import { requireBearer } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Proactive Eva: nudge members whose committed focus goals have gone quiet,
 * pointing them at their next step. Authed like the other crons; closed when
 * CRON_SECRET is unset.
 */
async function handle(req: Request): Promise<NextResponse> {
  const denied = requireBearer(req, "CRON_SECRET");
  if (denied) return denied;

  const result = await runEvaNudges(new Date());
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
