import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { gymGenerated, rebuildGenerated } from "@/db/schema";
import { deepAmericanize } from "@/lib/americanize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Founder tool: rewrite the generated Gym + Rebuild pool from UK to US English,
 * in place, with no Claude API calls.
 *
 *   GET /api/admin/americanize         → dry run: how many rows would change
 *   GET /api/admin/americanize?run=1   → apply the changes
 *
 * Idempotent — running it again after it's clean changes nothing. */

const FALLBACK_FOUNDER = "ahannigan79@gmail.com";

async function requireFounder() {
  const user = await currentUser();
  if (!user) return { ok: false as const, status: 401, error: "Not signed in." };
  const allow = (process.env.FOUNDER_EMAILS ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  if (!allow.includes(FALLBACK_FOUNDER)) allow.push(FALLBACK_FOUNDER);
  const emails = (user.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase());
  if (!emails.some((e) => allow.includes(e))) return { ok: false as const, status: 403, error: "Not a founder account." };
  return { ok: true as const };
}

export async function GET(req: Request) {
  const gate = await requireFounder();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const write = new URL(req.url).searchParams.get("run") === "1";

  const [gym, rebuild] = await Promise.all([
    db.select({ id: gymGenerated.id, scenario: gymGenerated.scenario }).from(gymGenerated),
    db.select({ id: rebuildGenerated.id, variant: rebuildGenerated.variant }).from(rebuildGenerated),
  ]);

  let gymChanged = 0, rebuildChanged = 0;
  for (const row of gym) {
    const { value, changed } = deepAmericanize(row.scenario);
    if (!changed) continue;
    gymChanged++;
    if (write) await db.update(gymGenerated).set({ scenario: value }).where(eq(gymGenerated.id, row.id));
  }
  for (const row of rebuild) {
    const { value, changed } = deepAmericanize(row.variant);
    if (!changed) continue;
    rebuildChanged++;
    if (write) await db.update(rebuildGenerated).set({ variant: value }).where(eq(rebuildGenerated.id, row.id));
  }

  return NextResponse.json({
    ok: true,
    mode: write ? "applied" : "dry-run",
    gym: { total: gym.length, changed: gymChanged },
    rebuild: { total: rebuild.length, changed: rebuildChanged },
    hint: write ? "Pool americanized. Reload the browse pages." : "Add ?run=1 to apply.",
  });
}
