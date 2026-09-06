import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { podCheckins, profiles } from "@/db/schema";
import { getPodBySlug, getPodMembers, leadsPod } from "@/lib/pods";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { isoWeekKey } from "@/lib/gym-gate";
import { PodProfile } from "@/components/hub/pods/PodProfile";
import { PodManage } from "@/components/hub/pods/PodManage";

export const metadata = { title: "Manage pod — Pivotum" };

// The captain console — everything the captain runs for their pod, in one place.
// Captain (or founder) only; anyone else is bounced back to the pod.
export default async function ManagePodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { userId } = await auth();
  const pod = await getPodBySlug(slug);
  if (!pod) notFound();
  const profile = await getOrCreateProfile();
  const allowed = isFounder(profile) || (await leadsPod(userId, pod.id));
  if (!allowed) redirect(`/hub/pods/${slug}`);

  const members = await getPodMembers(pod.id);
  const ids = members.map((m) => m.id);
  const [extra, checked] = await Promise.all([
    ids.length
      ? db.select({ id: profiles.clerkUserId, intro: profiles.podIntro, sub: profiles.subStatus })
          .from(profiles).where(inArray(profiles.clerkUserId, ids))
      : Promise.resolve([] as { id: string; intro: string | null; sub: string | null }[]),
    db.select({ m: podCheckins.memberId }).from(podCheckins)
      .where(sql`${podCheckins.podId} = ${pod.id} and ${podCheckins.isoWeek} = ${isoWeekKey()}`),
  ]);
  const byId = new Map(extra.map((e) => [e.id, e]));
  const checkedSet = new Set(checked.map((c) => c.m));
  const roster = members.map((m) => ({
    id: m.id, name: m.name, handle: m.handle, leader: m.leader,
    intro: byId.get(m.id)?.intro ?? null,
    trial: byId.get(m.id)?.sub === "trialing",
    checkedIn: checkedSet.has(m.id),
  }));
  const checkinCount = roster.filter((r) => r.checkedIn).length;

  return (
    <>
      <div className="hub-toolbar">
        <Link href={`/hub/pods/${slug}`} className="back">‹ {pod.name}</Link>
        <span className="tt">Manage {pod.crest ?? ""} {pod.name}</span>
      </div>
      <div className="hub-body" style={{ maxWidth: 720 }}>
        <div className="hub-sectlabel">Pod identity</div>
        <PodProfile slug={slug} vibe={pod.vibe} crest={pod.crest} lane={pod.lane} region={pod.region} canEdit={true} />
        <PodManage slug={slug} goal={pod.goal} checkinCount={checkinCount} size={roster.length} roster={roster} />
      </div>
    </>
  );
}
