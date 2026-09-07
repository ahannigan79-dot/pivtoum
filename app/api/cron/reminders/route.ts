import { NextResponse } from "next/server";
import { runReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Phone reminders: push an RSVP'd member when their event is starting soon, and
 * push a member when their Map re-score has come due. Authed like the other
 * crons; closed when CRON_SECRET is unset.
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

  const result = await runReminders(new Date());
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
