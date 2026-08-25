"use server";
import { revalidatePath } from "next/cache";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { runScout } from "@/lib/article-scout";

/** Founder: run the article scout now (also runs weekly via cron). */
export async function runScoutNow(): Promise<{ ok: boolean; picks?: number }> {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) return { ok: false };
  const report = await runScout();
  revalidatePath("/hub/scout");
  return report ? { ok: true, picks: report.picks.length } : { ok: false };
}
