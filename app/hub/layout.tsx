import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getOrCreateProfile, touchVisit, isFounder } from "@/lib/member";
import { getUnreadCount } from "@/lib/dms";
import { getUnreadNotifCount } from "@/lib/notifications";
import { openReportCount } from "@/lib/moderation";
import { HubNav } from "@/components/hub/HubNav";
import { MobileBar } from "@/components/hub/MobileBar";
import "./hub.css";

export const metadata = { title: "Winning in the Age of AI — Your Community", robots: { index: false, follow: false } };

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const profile = await getOrCreateProfile();
  if (profile) await touchVisit(profile.clerkUserId);
  const founder = isFounder(profile);
  const [messagesUnread, notifUnread, openReports] = profile
    ? await Promise.all([
        getUnreadCount(profile.clerkUserId),
        getUnreadNotifCount(profile.clerkUserId),
        founder ? openReportCount() : Promise.resolve(0),
      ])
    : [0, 0, 0];
  return (
    <div className="hub">
      <aside className="hub-side">
        <div className="hub-head">
          <Link href="/hub" className="hub-brand">
            <span className="hub-mk" />
            <span><small>Pivotum · Your community</small><b>Winning in the Age of AI</b></span>
          </Link>
          <Link href="/hub/notifications" className="hub-bell" aria-label={`Notifications${notifUnread ? ` (${notifUnread} unread)` : ""}`}>
            <span className="hub-bell-ic">🔔</span>
            {notifUnread > 0 && <span className="hub-bell-dot">{notifUnread > 9 ? "9+" : notifUnread}</span>}
          </Link>
        </div>
        <HubNav messagesUnread={messagesUnread} isFounder={founder} openReports={openReports} />
        <div className="hub-side-foot">
          <UserButton />
          {profile ? (
            <Link href={`/hub/members/${profile.handle ?? profile.clerkUserId}`} className="nm">
              {profile.displayName ?? "Member"}
            </Link>
          ) : (
            <span className="nm">Member</span>
          )}
          <Link href="/hub/settings" className="hub-gear" aria-label="Settings">⚙</Link>
        </div>
      </aside>
      <MobileBar notifUnread={notifUnread} messagesUnread={messagesUnread} openReports={openReports} isFounder={founder} />
      <main className="hub-main">{children}</main>
    </div>
  );
}
