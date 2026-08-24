import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getNotifications, markAllNotificationsRead, notifIcon } from "@/lib/notifications";
import { timeAgo } from "@/lib/community";
import { Avatar } from "@/components/hub/community/Avatar";

export const metadata = { title: "Notifications — Winning in the Age of AI" };

export default async function NotificationsPage() {
  const { userId } = await auth();
  const items = userId ? await getNotifications(userId) : [];
  // Capture the unread state above, then clear the badge for next time.
  if (userId) await markAllNotificationsRead(userId);

  return (
    <>
      <div className="hub-top"><h1>Notifications</h1><span className="sp" /></div>
      <div className="hub-body hub-feed">
        {items.length === 0 ? (
          <p className="feed-empty">You&apos;re all caught up. Replies, reactions, messages and new credentials will show up here.</p>
        ) : (
          <div className="notif-list">
            {items.map((n) => {
              const inner = (
                <>
                  {n.actorName ? (
                    <Avatar name={n.actorName} url={n.actorAvatar ?? null} size={40} />
                  ) : (
                    <span className="notif-icon">{notifIcon(n.kind)}</span>
                  )}
                  <div className="notif-main">
                    <p className="notif-text">
                      {n.actorName && <b>{n.actorName} </b>}{n.title}
                    </p>
                    {n.preview && <p className="notif-preview">{n.preview}</p>}
                    <span className="notif-when">{timeAgo(n.createdAt)}</span>
                  </div>
                </>
              );
              const cls = "notif-row" + (n.read ? "" : " unread");
              return n.href ? (
                <Link key={n.id} href={n.href} className={cls}>{inner}</Link>
              ) : (
                <div key={n.id} className={cls}>{inner}</div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
