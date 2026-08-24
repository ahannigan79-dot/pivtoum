import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getCommunityFeed } from "@/lib/community";
import { ensureCommunityWelcome } from "@/lib/seed-content";
import { getCurrentPrompt } from "@/lib/ritual";
import { getTrajectory } from "@/lib/trajectory";
import { mapShareText } from "@/lib/moves";
import { getOrCreateProfile, isFounder } from "@/lib/member";
import { TOPICS, TOPIC_BY_SLUG, postableTopics } from "@/lib/feed-topics";
import { Composer } from "@/components/hub/community/Composer";
import { PostCard } from "@/components/hub/community/PostCard";
import { ValuesBanner } from "@/components/hub/community/ValuesBanner";

export const metadata = { title: "Community — Pivotum" };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { userId } = await auth();
  const { topic: rawTopic } = await searchParams;
  const activeTopic = rawTopic && TOPIC_BY_SLUG[rawTopic] ? rawTopic : null;

  const profile = await getOrCreateProfile();
  const founder = isFounder(profile);
  await ensureCommunityWelcome();
  const [feed, traj, prompt] = await Promise.all([getCommunityFeed(userId, activeTopic), getTrajectory(userId), getCurrentPrompt()]);
  const shareText = mapShareText(traj.computed, traj.overall);

  return (
    <>
      <div className="hub-top"><h1>Community</h1><span className="sp" /></div>
      <div className="hub-body hub-feed">
        <ValuesBanner />
        {prompt && (
          <div className="week-prompt">
            <span className="wp-tag">This week</span>
            <div className="wp-main">
              <h3>{prompt.title}</h3>
              <p>{prompt.body}</p>
              <span className="wp-cta">Share your answer below ↓</span>
            </div>
          </div>
        )}
        <Composer topics={postableTopics(founder)} shareText={shareText} />

        <nav className="feed-tabs">
          <Link href="/hub/community" className={!activeTopic ? "on" : ""}>All</Link>
          {TOPICS.map((t) => (
            <Link key={t.slug} href={`/hub/community?topic=${t.slug}`} className={activeTopic === t.slug ? "on" : ""}>
              {t.label}
            </Link>
          ))}
        </nav>

        {feed.length === 0 ? (
          <p className="feed-empty">
            {activeTopic
              ? "Nothing in this topic yet — start the conversation."
              : "Nothing here yet — be the first. Share a win, a question, or what you're working on this week."}
          </p>
        ) : (
          feed.map((p) => <PostCard key={p.id} post={p} canPin={founder} meId={userId} canModerate={founder} />)
        )}
      </div>
    </>
  );
}
