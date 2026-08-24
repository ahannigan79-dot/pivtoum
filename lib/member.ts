import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

/** Founders/moderators can run the community (create events, etc.).
 *  Either the profile role is set, or the email is in FOUNDER_EMAILS. */
export function isFounder(p: { role?: string | null; email?: string | null } | null): boolean {
  if (!p) return false;
  if (p.role === "founder" || p.role === "moderator") return true;
  const allow = (process.env.FOUNDER_EMAILS ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  return !!p.email && allow.includes(p.email.toLowerCase());
}

/** Fetch the signed-in member's profile row, creating it from Clerk on first visit. */
export async function getOrCreateProfile() {
  const user = await currentUser();
  if (!user) return null;

  const existing = await db.select().from(profiles).where(eq(profiles.clerkUserId, user.id)).limit(1);
  if (existing[0]) return existing[0];

  const email =
    user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || email.split("@")[0];

  await db
    .insert(profiles)
    .values({
      clerkUserId: user.id,
      email,
      displayName,
      avatarUrl: user.imageUrl,
      handle: user.username ?? null,
    })
    .onConflictDoNothing();

  const created = await db.select().from(profiles).where(eq(profiles.clerkUserId, user.id)).limit(1);
  return created[0] ?? null;
}
