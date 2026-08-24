import { auth } from "@clerk/nextjs/server";
import { getCommunityFeed } from "@/lib/community";
import { Composer } from "@/components/hub/community/Composer";
import { PostCard } from "@/components/hub/community/PostCard";

export const metadata = { title: "Community — Pivotum" };

export default async function CommunityPage() {
  const { userId } = await auth();
  const feed = await getCommunityFeed(userId);
  return (
    <>
      <div className="hub-top"><h1>Community</h1><span className="sp" /></div>
      <div className="hub-body hub-feed">
        <Composer />
        {feed.length === 0 ? (
          <p className="feed-empty">Nothing here yet — be the first. Share a win, a question, or what you&apos;re working on this week.</p>
        ) : (
          feed.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </>
  );
}
