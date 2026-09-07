import { NextResponse } from "next/server";
import { runWeeklyDigest } from "@/lib/digest";
import { requireBearer } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Weekly digest / re-engagement send. Wired to a Vercel Cron (see vercel.json).
 * Vercel Cron authenticates with `Authorization: Bearer ${CRON_SECRET}`. If no
 * secret is configured the endpoint is closed, so it can never fire publicly.
 */
async function handle(req: Request): Promise<NextResponse> {
  const denied = requireBearer(req, "CRON_SECRET");
  if (denied) return denied;

  const result = await runWeeklyDigest();
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
