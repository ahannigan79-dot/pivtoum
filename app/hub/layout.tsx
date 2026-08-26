import Link from "next/link";
import { headers } from "next/headers";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateProfile, touchVisit, isFounder } from "@/lib/member";
import { getUnreadCount } from "@/lib/dms";
import { getUnreadNotifCount } from "@/lib/notifications";
import { openReportCount } from "@/lib/moderation";
import { pendingSubmissionCount } from "@/lib/submissions";
import { getAccess, getViewMode, isPreviewAllowed } from "@/lib/gate";
import { HubNav } from "@/components/hub/HubNav";
import { MobileBar } from "@/components/hub/MobileBar";
import { PwaRegister } from "@/components/hub/PwaRegister";
import { InstallPrompt } from "@/components/hub/InstallPrompt";
import { LookingGlass } from "@/components/hub/LookingGlass";
import { ViewModeToggle } from "@/components/hub/ViewModeToggle";
import { Icon } from "@/components/hub/Icon";
import "./hub.css";

export const metadata = { title: "Winning in the Age of AI — Your Community", robots: { index: false, follow: false } };

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const profile = await getOrCreateProfile();
  if (profile) await touchVisit(profile.clerkUserId);
  const realFounder = isFounder(profile);        // true founder — decides who sees the switch
  const viewMode = await getViewMode();

  // Gate: non-members (no active subscription) get the looking glass on every
  // route except the ones that let them subscribe or manage settings. A founder
  // can preview the member/guest flow via the view-mode switch.
  const access = await getAccess(userId, profile);
  const founder = access.founder;                 // effective — reflects the preview mode
  const path = (await headers()).get("x-pathname");
  const gated = !access.member && !isPreviewAllowed(path);

  const [messagesUnread, notifUnread, openReports, subsPending] = profile && access.member
    ? await Promise.all([
        getUnreadCount(profile.clerkUserId),
        getUnreadNotifCount(profile.clerkUserId),
        founder ? openReportCount() : Promise.resolve(0),
        founder ? pendingSubmissionCount() : Promise.resolve(0),
      ])
    : [0, 0, 0, 0];
  return (
    <div className="hub">
      <aside className="hub-side">
        <div className="hub-head">
          <Link href="/hub" className="hub-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hub-logo" src="/brand/pivotum-logo-plain.svg" alt="Pivotum" />
            <b>Winning in the Age of AI</b>
          </Link>
          <Link href="/hub/notifications" className="hub-bell" aria-label={`Notifications${notifUnread ? ` (${notifUnread} unread)` : ""}`}>
            <span className="hub-bell-ic"><Icon name="alerts" size={19} /></span>
            {notifUnread > 0 && <span className="hub-bell-dot">{notifUnread > 9 ? "9+" : notifUnread}</span>}
          </Link>
        </div>
        <HubNav messagesUnread={messagesUnread} isFounder={founder} openReports={openReports} subsPending={subsPending} />
        {realFounder && <ViewModeToggle current={viewMode} />}
        <div className="hub-side-foot">
          <UserButton />
          {profile ? (
            <Link href={`/hub/members/${profile.handle ?? profile.clerkUserId}`} className="nm">
              {profile.displayName ?? "Member"}
            </Link>
          ) : (
            <span className="nm">Member</span>
          )}
          <Link href="/hub/settings" className="hub-gear" aria-label="Settings"><Icon name="settings" size={18} /></Link>
        </div>
      </aside>
      <MobileBar notifUnread={notifUnread} messagesUnread={messagesUnread} openReports={openReports} isFounder={founder} />
      <PwaRegister />
      <InstallPrompt />
      <main className="hub-main">{gated ? <LookingGlass /> : children}</main>
    </div>
  );
}
