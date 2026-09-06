import { redirect } from "next/navigation";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { listOpenInterest } from "@/lib/leadership";
import { InterestReview } from "@/components/hub/leadership/InterestReview";

export const metadata = { title: "Leadership — Pivotum" };

// Founder review: members who raised their hand to lead.
export default async function LeadershipReviewPage() {
  const profile = await getOrCreateProfile();
  if (!isFounder(profile)) redirect("/hub");
  const items = await listOpenInterest();

  return (
    <>
      <div className="hub-top"><h1>Leadership</h1><span className="sp" /></div>
      <div className="hub-body" style={{ maxWidth: 720 }}>
        <p className="hub-lead">
          Members who&rsquo;ve raised their hand to lead. Approving a <b>domain leader</b> gives them the role and
          their console; approving a <b>captain</b> is your cue to slot them into a pod.
        </p>
        {items.length === 0
          ? <p className="muted">No open interest right now.</p>
          : <InterestReview items={items.map((i) => ({ id: i.id, name: i.name, handle: i.handle, role: i.role, domain: i.domain, note: i.note }))} />}
      </div>
    </>
  );
}
