import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getMemberProfile, humanizeCareer } from "@/lib/members";
import { getEarnedBadges } from "@/lib/badges";
import { exposureBand } from "@/lib/trajectory";
import { timeAgo } from "@/lib/community";
import { Avatar } from "@/components/hub/community/Avatar";
import { ProfileEditor } from "@/components/hub/members/ProfileEditor";
import { startDM } from "@/app/hub/messages/actions";

const strip = (s: string | undefined) => (s ?? "").replace(/<[^>]+>/g, "").trim();
const ROLE_LABEL: Record<string, string> = { founder: "Founder", moderator: "Moderator" };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const m = await getMemberProfile(id, userId);
  return { title: m ? `${m.name} — Members` : "Member — Pivotum" };
}

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const m = await getMemberProfile(id, userId);
  if (!m) notFound();

  const [badges] = await Promise.all([getEarnedBadges(m.clerkUserId)]);
  const band = exposureBand(m.overall);
  const career = humanizeCareer(m.career);
  const move = m.computed?.move;

  return (
    <>
      <div className="hub-toolbar">
        <Link href="/hub/members" className="back">‹ Members</Link>
        <span className="tt">{m.name}</span>
      </div>
      <div className="hub-body">
        <header className="prof-head">
          <Avatar name={m.name} url={m.avatarUrl} size={72} />
          <div className="prof-id">
            <h1>{m.name}{ROLE_LABEL[m.role] && <span className="prof-role">{ROLE_LABEL[m.role]}</span>}</h1>
            {m.handle && <span className="prof-handle">@{m.handle}</span>}
            <p className="prof-where">{[career, m.stage, m.lane].filter(Boolean).join(" · ") || "Mapping in progress"}</p>
          </div>
          <div className="prof-head-actions">
            {m.isMe ? (
              <ProfileEditor initial={{ displayName: m.name, handle: m.handle, bio: m.bio, stage: m.stage }} />
            ) : (
              <form action={startDM.bind(null, m.clerkUserId)}>
                <button type="submit" className="prof-msg-btn">✉ Message</button>
              </form>
            )}
          </div>
        </header>

        {m.bio && <p className="prof-bio">{m.bio}</p>}

        <div className="mem-cols">
          <div className="mem-col-main">
            {/* Career Map summary */}
            <div className="hub-sectlabel">AI Career Map</div>
            {m.overall != null ? (
              <div className="card prof-map">
                <div className="prof-map-row">
                  <div className="stand-num">
                    <div className={`big ${band.cls}`}>{m.overall}</div>
                    <span className="stand-unit">exposure{band.word ? ` · ${band.word}` : ""}</span>
                  </div>
                  {move?.stance && (
                    <div className="prof-move">
                      <p className="ck">Winning move</p>
                      <h3>{move.stance}</h3>
                      {move.e2short && <p>{strip(move.e2short)}</p>}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="feed-empty">{m.isMe ? "You haven't built your Map yet." : "No Map shared yet."}</p>
            )}

            {/* Recent activity */}
            {m.recentPosts.length > 0 && (
              <>
                <div className="hub-sectlabel">Recent activity</div>
                <div className="prof-activity">
                  {m.recentPosts.map((p) => (
                    <div key={p.id} className="prof-post">
                      <p>{p.body.length > 200 ? p.body.slice(0, 200) + "…" : p.body}</p>
                      <span className="post-meta">{timeAgo(p.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="mem-col-side">
            <div className="hub-sectlabel">Credentials</div>
            {badges.length > 0 ? (
              <div className="creds">
                {badges.map((b) => <span key={b.key} className="cred" title={b.note}><i>{b.icon}</i> {b.name}</span>)}
              </div>
            ) : <p className="creds-empty">None yet.</p>}

            <div className="hub-sectlabel">Pods</div>
            {m.pods.length > 0 ? (
              <div className="prof-pods">
                {m.pods.map((p) => <Link key={p.slug} href={`/hub/pods/${p.slug}`} className="prof-pod">👥 {p.name}</Link>)}
              </div>
            ) : <p className="creds-empty">Not in a pod yet.</p>}
          </aside>
        </div>
      </div>
    </>
  );
}
