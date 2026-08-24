import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getInbox } from "@/lib/dms";
import { timeAgo } from "@/lib/community";
import { Avatar } from "@/components/hub/community/Avatar";

export const metadata = { title: "Messages — Winning in the Age of AI" };

export default async function MessagesPage() {
  const { userId } = await auth();
  const inbox = userId ? await getInbox(userId) : [];

  return (
    <>
      <div className="hub-top"><h1>Messages</h1><span className="sp" /></div>
      <div className="hub-body hub-feed">
        {inbox.length === 0 ? (
          <p className="feed-empty">No messages yet. Open a member&apos;s profile and hit <b>Message</b> to start a conversation.</p>
        ) : (
          <div className="dm-list">
            {inbox.map((c) => (
              <Link key={c.threadId} href={`/hub/messages/${c.threadId}`} className={"dm-row" + (c.unread > 0 ? " unread" : "")}>
                <Avatar name={c.other.name} url={c.other.avatarUrl} size={42} />
                <div className="dm-main">
                  <div className="dm-top"><b>{c.other.name}</b>{c.lastAt && <span className="dm-when">{timeAgo(c.lastAt)}</span>}</div>
                  <p className="dm-preview">{c.lastBody ?? "Say hello…"}</p>
                </div>
                {c.unread > 0 && <span className="dm-badge">{c.unread}</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
