import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getOrCreateProfile } from "@/lib/member";
import { HubNav } from "@/components/hub/HubNav";
import "./hub.css";

export const metadata = { title: "The Hub — Pivotum", robots: { index: false, follow: false } };

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const profile = await getOrCreateProfile();
  return (
    <div className="hub">
      <aside className="hub-side">
        <Link href="/hub" className="hub-brand">
          <span className="hub-mk" />
          <span><small>Pivotum</small><b>The Hub</b></span>
        </Link>
        <HubNav />
        <div className="hub-side-foot">
          <UserButton />
          <span className="nm">{profile?.displayName ?? "Member"}</span>
        </div>
      </aside>
      <main className="hub-main">{children}</main>
    </div>
  );
}
