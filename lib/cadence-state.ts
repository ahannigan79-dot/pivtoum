/**
 * Founder cadence state — the one stored dial. Reads/writes the singleton
 * `cadence_state` row, then hands the pin to lib/cadence.ts to resolve the
 * active month. Table-missing errors degrade to "follow the calendar" so the
 * app keeps working before the migration runs.
 */
import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cadenceState } from "@/db/schema";
import { activeMonth, type CadenceMonth } from "@/lib/cadence";

const ROW = "singleton";

export type CadenceState = { pinnedKey: string | null; scheduledKey: string | null };

/** The stored pin (null both = untouched / follow the calendar). */
export async function getCadenceState(): Promise<CadenceState> {
  try {
    const row = (await db.select().from(cadenceState).where(eq(cadenceState.id, ROW)).limit(1))[0];
    return { pinnedKey: row?.pinnedKey ?? null, scheduledKey: row?.scheduledKey ?? null };
  } catch {
    return { pinnedKey: null, scheduledKey: null };
  }
}

/** The active month, honoring the founder pin. Safe before migration. */
export async function activeCadenceMonth(): Promise<CadenceMonth> {
  const { pinnedKey } = await getCadenceState();
  return activeMonth(pinnedKey);
}

async function upsert(patch: Partial<{ pinnedKey: string | null; scheduledKey: string | null; updatedBy: string }>) {
  await db.insert(cadenceState)
    .values({ id: ROW, ...patch })
    .onConflictDoUpdate({ target: cadenceState.id, set: { ...patch, updatedAt: new Date() } });
}

/** Pin the active month to a curriculum key, or null to follow the calendar. */
export async function setPin(key: string | null, by?: string) {
  await upsert({ pinnedKey: key, updatedBy: by });
}

/** Record that this month's events have been scheduled (guards double-booking). */
export async function markScheduled(key: string, by?: string) {
  await upsert({ scheduledKey: key, updatedBy: by });
}
