"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/hub/Icon";

const SECTIONS: { label?: string; items: { href: string; icon: string; label: string }[] }[] = [
  { items: [
    { href: "/hub/welcome", icon: "welcome", label: "Welcome" },
    { href: "/hub", icon: "evolve", label: "Evolve" },
    { href: "/hub/playbook", icon: "playbook", label: "Playbook" },
  ] },
  { label: "The Winning Loop", items: [
    { href: "/hub/map", icon: "map", label: "Your Map" },
    { href: "/hub/learn", icon: "learn", label: "Learn" },
    { href: "/hub/build", icon: "build", label: "Build" },
  ]},
  { label: "Community", items: [
    { href: "/hub/community", icon: "feed", label: "Feed" },
    { href: "/hub/pods", icon: "pods", label: "Your Pod" },
    { href: "/hub/events", icon: "events", label: "Events" },
    { href: "/hub/members", icon: "members", label: "Members" },
    { href: "/hub/library", icon: "library", label: "Library" },
    { href: "/hub/messages", icon: "messages", label: "Messages" },
  ]},
  { label: "Account", items: [
    { href: "/hub/membership", icon: "membership", label: "Membership" },
  ]},
];

export function HubNav({ messagesUnread = 0, isFounder = false, openReports = 0 }: {
  messagesUnread?: number; isFounder?: boolean; openReports?: number;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/hub" ? pathname === "/hub" : pathname?.startsWith(href));
  const sections = isFounder
    ? [...SECTIONS, { label: "Founder", items: [
        { href: "/hub/health", icon: "health", label: "Member health" },
        { href: "/hub/market", icon: "exposure", label: "Market baselines" },
        { href: "/hub/scout", icon: "scout", label: "Article scout" },
        { href: "/hub/moderation", icon: "moderation", label: "Moderation" },
      ] }]
    : SECTIONS;
  return (
    <nav className="hub-nav">
      {sections.map((s, i) => (
        <div key={i}>
          {s.label && <div className="hub-navsep">{s.label}</div>}
          {s.items.map((it) => (
            <Link key={it.href} href={it.href} className={isActive(it.href) ? "on" : ""}>
              <span className="ic"><Icon name={it.icon} size={19} /></span>
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
