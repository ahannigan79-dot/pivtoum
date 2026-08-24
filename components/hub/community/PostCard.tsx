import { timeAgo, type FeedPost } from "@/lib/community";
import { topicLabel } from "@/lib/feed-topics";
import { linkify } from "@/lib/linkify";
import { Avatar } from "./Avatar";
import { ReactButton } from "./ReactButton";
import { CommentBox } from "./CommentBox";
import { PinButton } from "./PinButton";
import { PostMenu } from "./PostMenu";

const ROLE_BADGE: Record<string, string> = { founder: "Founder", moderator: "Guide" };

function fullDate(d: Date) {
  return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function PostCard({ post, canPin = false, meId = null, canModerate = false }: {
  post: FeedPost; canPin?: boolean; meId?: string | null; canModerate?: boolean;
}) {
  const badge = ROLE_BADGE[post.author.role];
  const topic = topicLabel(post.topic);
  const isOwn = meId != null && post.author.id === meId;
  return (
    <article className={"post" + (post.pinned ? " pinned" : "")}>
      {post.pinned && <div className="post-pinmark">📌 Pinned</div>}
      <div className="post-head">
        <Avatar name={post.author.name} url={post.author.avatarUrl} />
        <div className="post-who">
          <span className="post-name">
            <b>{post.author.name}</b>
            {badge && <span className={"role-badge r-" + post.author.role}>{badge}</span>}
          </span>
          <span className="post-meta" title={fullDate(post.createdAt)}>
            {timeAgo(post.createdAt)}
            {topic && <> · <span className="topic-chip">{topic}</span></>}
          </span>
        </div>
        <div className="post-head-right">
          {canModerate && post.reportCount > 0 && <span className="pm-flag">⚑ {post.reportCount}</span>}
          {canPin && <PinButton postId={post.id} pinned={post.pinned} />}
          <PostMenu postId={post.id} canDelete={isOwn || canModerate} canReport={!isOwn} />
        </div>
      </div>

      {post.title && <h3 className="post-title">{post.title}</h3>}
      <p className="post-body">{linkify(post.body)}</p>

      {post.attachments.length > 0 && (
        <div className="post-attach">
          {post.attachments.map((a, i) => a.kind === "image" ? (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="att-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url} alt={a.name ?? ""} loading="lazy" />
            </a>
          ) : (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="att-file">📎 {a.name ?? "Attachment"}</a>
          ))}
        </div>
      )}

      <div className="post-actions">
        <ReactButton postId={post.id} count={post.reactionCount} mine={post.iReacted} />
        <span className="react-static">💬 {post.comments.length}</span>
      </div>

      {post.comments.length > 0 && (
        <div className="comments">
          {post.comments.map((c) => (
            <div key={c.id} className="comment">
              <Avatar name={c.author.name} url={c.author.avatarUrl} size={26} />
              <div className="comment-body">
                <b>{c.author.name}</b> <span className="post-meta" title={fullDate(c.createdAt)}>{timeAgo(c.createdAt)}</span>
                <p>{linkify(c.body)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <CommentBox postId={post.id} />
    </article>
  );
}
