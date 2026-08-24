import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPodFeed } from "@/lib/community";
import { getPodBySlug, getPodMembers, isPodMember } from "@/lib/pods";
import { PostCard } from "@/components/hub/community/PostCard";
import { Avatar } from "@/components/hub/community/Avatar";
import { PodComposer } from "@/components/hub/pods/PodComposer";
import { JoinButton } from "@/components/hub/pods/JoinButton";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pod = await getPodBySlug(slug);
  return { title: pod ? `${pod.name} — Pods` : "Pod — Pivotum" };
}

export default async function PodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { userId } = await auth();
  const pod = await getPodBySlug(slug);
  if (!pod) notFound();

  const [members, iAmIn, feed] = await Promise.all([
    getPodMembers(pod.id),
    isPodMember(pod.id, userId),
    getPodFeed(pod.id, userId),
  ]);

  return (
    <>
      <div className="hub-toolbar">
        <Link href="/hub/pods" className="back">‹ Pods</Link>
        <span className="tt">{pod.name}</span>
      </div>
      <div className="hub-body pod-space">
        <header className="pod-header">
          <div>
            <h1>{pod.name}</h1>
            {pod.description && <p>{pod.description}</p>}
          </div>
          <JoinButton slug={pod.slug} joined={iAmIn} />
        </header>

        <div className="pod-layout">
          <div className="pod-main hub-feed">
            {iAmIn ? (
              <PodComposer slug={pod.slug} />
            ) : (
              <div className="pod-locked">
                <p>Join this pod to post and take part in the accountability threads.</p>
                <JoinButton slug={pod.slug} joined={false} />
              </div>
            )}

            {feed.length === 0 ? (
              <p className="feed-empty">No posts in this pod yet.{iAmIn ? " Kick it off — share what you're committing to." : ""}</p>
            ) : (
              feed.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>

          <aside className="pod-side">
            <div className="card">
              <p className="ck">{members.length} {members.length === 1 ? "member" : "members"}</p>
              <div className="pod-members">
                {members.map((m) => (
                  <div key={m.id} className="pod-member">
                    <Avatar name={m.name} url={m.avatarUrl} size={30} />
                    <span>{m.name}</span>
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
