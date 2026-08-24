"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HubNav } from "./HubNav";

export function MobileBar({ notifUnread = 0, messagesUnread = 0, openReports = 0, isFounder = false }: {
  notifUnread?: number; messagesUnread?: number; openReports?: number; isFounder?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]); // close the drawer on navigation

  return (
    <>
      <div className="mbar">
        <button className="mbar-burger" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
        <Link href="/hub" className="mbar-brand">Winning in the Age of AI</Link>
        <Link href="/hub/notifications" className="mbar-bell" aria-label={`Notifications${notifUnread ? ` (${notifUnread} unread)` : ""}`}>
          🔔{notifUnread > 0 && <span className="hub-bell-dot">{notifUnread > 9 ? "9+" : notifUnread}</span>}
        </Link>
      </div>

      {open && <div className="mdrawer-scrim" onClick={() => setOpen(false)} />}
      <aside className={"mdrawer" + (open ? " open" : "")}>
        <div className="mdrawer-head">
          <span className="mdrawer-title">Menu</span>
          <button className="mdrawer-close" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
        </div>
        <HubNav messagesUnread={messagesUnread} isFounder={isFounder} openReports={openReports} />
        <div className="mdrawer-foot">
          <Link href="/hub/notifications">🔔 Notifications</Link>
          <Link href="/hub/settings">⚙ Settings</Link>
        </div>
      </aside>
    </>
  );
}
