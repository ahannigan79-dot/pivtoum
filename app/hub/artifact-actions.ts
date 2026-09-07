"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { verifyArtifact, returnArtifact } from "@/lib/artifacts";
import { notifyEva } from "@/lib/notifications";
import { db } from "@/db";
import { moveArtifacts } from "@/db/schema";
import { eq } from "drizzle-orm";

async function notifyOwner(artifactId: string, title: string, preview: string) {
  const rows = await db.select({ memberId: moveArtifacts.memberId, playTitle: moveArtifacts.playTitle })
    .from(moveArtifacts).where(eq(moveArtifacts.id, artifactId)).limit(1);
  const r = rows[0];
  if (r) await notifyEva(r.memberId, { title, preview: `${r.playTitle} — ${preview}`, href: "/hub/library", entityId: artifactId });
}

/** Domain leader: verify a submitted move artifact. */
export async function verifyMove(artifactId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;
  const ok = await verifyArtifact(userId, artifactId);
  if (ok) await notifyOwner(artifactId, "✨ Your move was verified", "verified by your domain leader");
  revalidatePath("/hub/domain");
}

/** Domain leader: send a submitted artifact back with a note. */
export async function returnMove(artifactId: string, note: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;
  const ok = await returnArtifact(userId, artifactId, note ?? "");
  if (ok) await notifyOwner(artifactId, "✨ Your move needs another look", "sent back by your domain leader");
  revalidatePath("/hub/domain");
}
