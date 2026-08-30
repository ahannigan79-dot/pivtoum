import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getMyPods } from "@/lib/pods";
import { suggestPods } from "@/lib/pod-match";
import { getOrCreateProfile } from "@/lib/member";
import { PlaceFlow } from "@/components/hub/pods/PlaceFlow";

export const metadata = { title: "Find your pod — Pivotum" };

// Guided placement: a member without a pod picks from a short, matched list —
// or taps "just place me". Nobody finishes onboarding solo.
export default async function PlacePage() {
  const { userId } = await auth();
  const mine = await getMyPods(userId);
  if (mine.length > 0) redirect(`/hub/pods/${mine[0].slug}`); // already placed

  const [suggested, profile] = await Promise.all([
    userId ? suggestPods(userId, 3) : Promise.resolve([]),
    getOrCreateProfile(),
  ]);

  return (
    <>
      <div className="hub-toolbar">
        <span className="tt">Find your pod</span>
      </div>
      <div className="hub-body">
        <header className="place-head">
          <h1>Meet your pod</h1>
          <p>Your pod is your team inside the community — a handful of people in your lane, facing the
            same shift. Pick the one that fits, or let us place you. You can switch later.</p>
        </header>

        <PlaceFlow
          suggested={suggested.map((p) => ({
            slug: p.slug, name: p.name, crest: p.crest, vibe: p.vibe, lane: p.lane,
            region: p.region, memberCount: p.memberCount, capacity: p.capacity,
          }))}
          initialIntro={profile?.podIntro ?? ""}
          initialRegion={profile?.region ?? ""}
        />

        <p className="place-foot">
          Rather look around first? <Link href="/hub/pods/browse">Browse all pods</Link>.
        </p>
      </div>
    </>
  );
}
