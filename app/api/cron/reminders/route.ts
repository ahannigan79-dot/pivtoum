import { NextResponse } from "next/server";
import { runReminders } from "@/lib/reminders";
import { requireBearer } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Phone reminders: push an RSVP'd member when their event is starting soon, and
 * push a member when their Map re-score has come due. Authed like the other
 * crons; closed when CRON_SECRET is unset.
 */
async function handle(req: Request): Promise<NextResponse> {
  const denied = requireBearer(req, "CRON_SECRET");
  if (denied) return denied;

  const result = await runReminders(new Date());
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
