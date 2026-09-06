import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ledDomains, podsForDomain } from "@/lib/leadership";

export const metadata = { title: "Your domain — Pivotum" };

// The domain leader console — every pod in the domains you steward, with health.
export default async function DomainPage() {
  const { userId } = await auth();
  const domains = await ledDomains(userId);
  if (!domains.length) redirect("/hub/leadership/about");
  const groups = await Promise.all(domains.map(async (d) => ({ domain: d, pods: await podsForDomain(d) })));

  return (
    <>
      <div className="hub-top"><h1>Your domain</h1><span className="sp" /></div>
      <div className="hub-body">
        <p className="hub-lead">You steward these pods — keep them healthy, back the captains, and start new pods as lanes fill.</p>
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
