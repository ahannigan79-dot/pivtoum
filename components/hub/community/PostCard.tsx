import { timeAgo, type FeedPost } from "@/lib/community";
import { Avatar } from "./Avatar";
import { ReactButton } from "./ReactButton";
import { CommentBox } from "./CommentBox";

export function PostCard({ post }: { post: FeedPost }) {
  return (
    <article className="post">
      <div className="post-head">
        <Avatar name={post.author.name} url={post.author.avatarUrl} />
        <div className="post-who">
          <b>{post.author.name}</b>
          <span className="post-meta">{timeAgo(post.createdAt)}</span>
        </div>
      </div>
      <p className="post-body">{post.body}</p>
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
                <p>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <CommentBox postId={post.id} />
    </article>
  );
}
