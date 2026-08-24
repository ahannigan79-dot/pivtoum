"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS: { label?: string; items: { href: string; icon: string; label: string }[] }[] = [
  { items: [
    { href: "/hub/welcome", icon: "★", label: "Welcome" },
    { href: "/hub", icon: "◆", label: "Evolve" },
  ] },
  { label: "The Winning Loop", items: [
    { href: "/hub/map", icon: "🧭", label: "Your Map" },
    { href: "/hub/learn", icon: "📚", label: "Learn" },
    { href: "/hub/build", icon: "🛠", label: "Build" },
  ]},
  { label: "Community", items: [
    { href: "/hub/community", icon: "💬", label: "Feed" },
    { href: "/hub/pods", icon: "👥", label: "Your Pod" },
    { href: "/hub/events", icon: "📅", label: "Events" },
    { href: "/hub/members", icon: "🗂", label: "Members" },
    { href: "/hub/library", icon: "📁", label: "Library" },
    { href: "/hub/messages", icon: "✉️", label: "Messages" },
  ]},
];

export function HubNav({ messagesUnread = 0, isFounder = false, openReports = 0 }: {
  messagesUnread?: number; isFounder?: boolean; openReports?: number;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/hub" ? pathname === "/hub" : pathname?.startsWith(href));
  const sections = isFounder
    ? [...SECTIONS, { label: "Founder", items: [
        { href: "/hub/health", icon: "❤", label: "Member health" },
        { href: "/hub/moderation", icon: "🛡", label: "Moderation" },
      ] }]
    : SECTIONS;
  return (
    <nav className="hub-nav">
      {sections.map((s, i) => (
        <div key={i}>
          {s.label && <div className="hub-navsep">{s.label}</div>}
          {s.items.map((it) => (
            <Link key={it.href} href={it.href} className={isActive(it.href) ? "on" : ""}>
              <span className="ic">{it.icon}</span>
              {it.label}
              {it.href === "/hub/messages" && messagesUnread > 0 && <span className="nav-badge">{messagesUnread}</span>}
              {it.href === "/hub/moderation" && openReports > 0 && <span className="nav-badge warn">{openReports}</span>}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
