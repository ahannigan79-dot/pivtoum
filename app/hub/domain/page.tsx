import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ledDomains, podsForDomain } from "@/lib/leadership";
import { pendingForLeader } from "@/lib/artifacts";
import { ArtifactReview } from "@/components/hub/domain/ArtifactReview";

export const metadata = { title: "Your domain — Pivotum" };

// The domain leader console — every pod in the domains you steward, with health.
export default async function DomainPage() {
  const { userId } = await auth();
  const domains = await ledDomains(userId);
  if (!domains.length) redirect("/hub/leadership/about");
  const [groups, pending] = await Promise.all([
    Promise.all(domains.map(async (d) => ({ domain: d, pods: await podsForDomain(d) }))),
    pendingForLeader(userId),
  ]);

  return (
    <>
      <div className="hub-top"><h1>Your domain</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">You steward these pods — keep them healthy, back the captains, and start new pods as lanes fill.</p>

        <div className="hub-sectlabel">Moves to verify{pending.length > 0 ? ` · ${pending.length}` : ""}</div>
        <p className="dl-verify-note">Members submit the artifact a completed play produced. Verify the real ones — it confirms the move and earns them the ✓ verified stamp; send back anything thin with a note.</p>
        <ArtifactReview items={pending.map((a) => ({ id: a.id, memberId: a.memberId, memberName: a.memberName, handle: a.handle, playTitle: a.playTitle, kind: a.kind, url: a.url, body: a.body, domain: a.domain }))} />

        {groups.map((g) => (
          <section className="dl-domain" key={g.domain}>
            <div className="hub-sectlabel">{g.domain} · {g.pods.length} pod{g.pods.length === 1 ? "" : "s"}</div>
            <div className="dl-pods">
              {g.pods.map((p) => (
                <Link className="dl-pod" href={`/hub/pods/${p.slug}/manage`} key={p.slug}>
                  <div className="dl-pod-top"><span className="dl-crest">{p.crest ?? "👥"}</span><h3>{p.name}</h3></div>
                  <div className="dl-pod-stats">
                    <span><b>{p.memberCount}/{p.capacity}</b> members</span>
                    <span><b>{p.checkedIn}</b> checked in</span>
                    <span>{p.streakWeeks > 0 ? `🔥 ${p.streakWeeks}w streak` : "no streak yet"}</span>
                    {!p.listable && <span className="dl-warn">not listed</span>}
                  </div>
                </Link>
              ))}
              {g.pods.length === 0 && <p className="muted">No pods in this domain yet — <Link href="/hub/pods">start one</Link>.</p>}
            </div>
          </section>
        ))}
        <p className="place-foot">Need a new pod in your domain? <Link href="/hub/pods">Create one →</Link></p>
      </div>
    </>
  );
}
