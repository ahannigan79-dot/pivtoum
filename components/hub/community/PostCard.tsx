import { timeAgo, type FeedPost } from "@/lib/community";
import { topicLabel } from "@/lib/feed-topics";
import { linkify } from "@/lib/linkify";
import { Avatar } from "./Avatar";
import { ReactButton } from "./ReactButton";
import { CommentBox } from "./CommentBox";
import { PinButton } from "./PinButton";

const ROLE_BADGE: Record<string, string> = { founder: "Founder", moderator: "Guide" };

export function PostCard({ post, canPin = false }: { post: FeedPost; canPin?: boolean }) {
  const badge = ROLE_BADGE[post.author.role];
  const topic = topicLabel(post.topic);
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
          <span className="post-meta">
            {timeAgo(post.createdAt)}
            {topic && <> · <span className="topic-chip">{topic}</span></>}
          </span>
        </div>
        {canPin && <PinButton postId={post.id} pinned={post.pinned} />}
      </div>

      {post.title && <h3 className="post-title">{post.title}</h3>}
      <p className="post-body">{linkify(post.body)}</p>

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
                <b>{c.author.name}</b> <span className="post-meta">{timeAgo(c.createdAt)}</span>
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
