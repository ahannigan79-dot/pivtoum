import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getThreadFeed } from "@/lib/community";
import { getPodBySlug, getPodMembers, isPodMember } from "@/lib/pods";
import { getPodThreads } from "@/lib/threads";
import { ensurePodWelcome } from "@/lib/seed-content";
import { getTrajectory } from "@/lib/trajectory";
import { mapShareText } from "@/lib/moves";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { PostCard } from "@/components/hub/community/PostCard";
import { Avatar } from "@/components/hub/community/Avatar";
import { PodLeaderToggle } from "@/components/hub/pods/PodLeaderToggle";
import { ValuesBanner } from "@/components/hub/community/ValuesBanner";
import { PodComposer } from "@/components/hub/pods/PodComposer";
import { ThreadNav } from "@/components/hub/pods/ThreadNav";
import { PodGoal } from "@/components/hub/pods/PodGoal";
import { PodProfile } from "@/components/hub/pods/PodProfile";
import { JoinButton } from "@/components/hub/pods/JoinButton";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pod = await getPodBySlug(slug);
  return { title: pod ? `${pod.name} — Pods` : "Pod — Pivotum" };
}

export default async function PodPage({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { slug } = await params;
  const { t: threadSlug } = await searchParams;
  const { userId } = await auth();
  const pod = await getPodBySlug(slug);
  if (!pod) notFound();

  const [members, iAmIn, profile, threads, traj] = await Promise.all([
    getPodMembers(pod.id),
    isPodMember(pod.id, userId),
    getOrCreateProfile(),
    getPodThreads(pod.id),
    getTrajectory(userId),
  ]);
  const canModerate = isFounder(profile);
  const amCaptain = members.some((m) => m.id === userId && m.leader);
  const canEditProfile = amCaptain || canModerate;
  const shareText = mapShareText(traj.computed, traj.overall);
  // Never an empty room: seed a pinned welcome in Announcements on first visit.
  const announcements = threads.find((t) => t.slug === "announcements") ?? threads[0];
  await ensurePodWelcome(pod.id, pod.name, pod.goal, announcements?.id ?? null);
  const active = threads.find((t) => t.slug === threadSlug) ?? threads[0];
  const feed = active ? await getThreadFeed(active.id, userId) : [];

  return (
    <>
      <div className="hub-toolbar">
        <Link href="/hub/pods/browse" className="back">‹ Browse pods</Link>
        <span className="tt">{pod.name}</span>
      </div>
      <div className="hub-body pod-space">
        <header className="pod-header">
          <div>
            <h1>{pod.crest ? `${pod.crest} ` : ""}{pod.name}</h1>
            {pod.description && <p>{pod.description}</p>}
          </div>
          <JoinButton slug={pod.slug} joined={iAmIn} />
        </header>

        <PodProfile slug={pod.slug} vibe={pod.vibe} crest={pod.crest} lane={pod.lane}
          region={pod.region} canEdit={canEditProfile} />

        {(pod.goal || iAmIn || canModerate) && (
          <PodGoal slug={pod.slug} goal={pod.goal} canEdit={iAmIn || canModerate} />
        )}

        <ThreadNav threads={threads} activeSlug={active?.slug ?? ""} podSlug={pod.slug} />

        <div className="pod-layout">
          <div className="pod-main hub-feed">
            <ValuesBanner variant="pod" />
            {iAmIn ? (
              <PodComposer slug={pod.slug} threadId={active?.id ?? null} shareText={shareText}
                placeholder={active ? `Post in ${active.emoji ?? ""} ${active.name}… 🎉` : undefined} />
            ) : (
              <div className="pod-locked">
                <p>Join this pod to post and take part in the accountability threads.</p>
                <JoinButton slug={pod.slug} joined={false} />
              </div>
            )}

            {feed.length === 0 ? (
              <p className="feed-empty">
                {active ? `Nothing in ${active.name} yet.` : "No threads yet."}
                {iAmIn && active ? " Start the conversation." : ""}
              </p>
            ) : (
              feed.map((p) => <PostCard key={p.id} post={p} meId={userId} canModerate={canModerate} />)
            )}
          </div>

          <aside className="pod-side">
            <div className="card">
              <p className="ck">{members.length} {members.length === 1 ? "member" : "members"}</p>
              <div className="pod-members">
                {members.map((m) => (
                  <div key={m.id} className="pod-member">
                    <Link href={`/hub/members/${m.handle ?? m.id}`} className="pod-member-who">
                      <Avatar name={m.name} url={m.avatarUrl} size={30} />
                      <span>{m.name}</span>
                    </Link>
                    {m.leader && <span className="pod-lead-tag">Leader</span>}
                    {canModerate && <PodLeaderToggle slug={pod.slug} memberId={m.id} leader={m.leader} />}
                  </div>
                ))}
                {members.length === 0 && <p className="muted">No members yet.</p>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
