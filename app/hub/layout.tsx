import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getOrCreateProfile, touchVisit } from "@/lib/member";
import { getUnreadCount } from "@/lib/dms";
import { HubNav } from "@/components/hub/HubNav";
import "./hub.css";

export const metadata = { title: "Winning in the Age of AI — Your Community", robots: { index: false, follow: false } };

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const profile = await getOrCreateProfile();
  if (profile) await touchVisit(profile.clerkUserId);
  const messagesUnread = profile ? await getUnreadCount(profile.clerkUserId) : 0;
  return (
    <div className="hub">
      <aside className="hub-side">
        <Link href="/hub" className="hub-brand">
          <span className="hub-mk" />
          <span><small>Pivotum · Your community</small><b>Winning in the Age of AI</b></span>
        </Link>
        <HubNav messagesUnread={messagesUnread} />
        <div className="hub-side-foot">
          <UserButton />
          {profile ? (
            <Link href={`/hub/members/${profile.handle ?? profile.clerkUserId}`} className="nm">
              {profile.displayName ?? "Member"}
            </Link>
          ) : (
            <span className="nm">Member</span>
          )}
        </div>
      </aside>
      <main className="hub-main">{children}</main>
    </div>
  );
}
