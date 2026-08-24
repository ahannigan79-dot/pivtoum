"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/hub/community/Avatar";
import { exposureBand } from "@/lib/trajectory";
import { humanizeCareer, type DirectoryMember } from "@/lib/members";

const ROLE_LABEL: Record<string, string> = { founder: "Founder", moderator: "Moderator" };

export function MembersDirectory({ members }: { members: DirectoryMember[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return members;
    return members.filter((m) =>
      [m.name, m.handle, humanizeCareer(m.career), m.lane].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [q, members]);

  return (
    <>
      <div className="mem-search">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, career, or lane…" />
        <span className="mem-count">{filtered.length} {filtered.length === 1 ? "member" : "members"}</span>
      </div>

      {filtered.length === 0 ? (
        <p className="feed-empty">No members match “{q}”.</p>
      ) : (
        <div className="mem-grid">
          {filtered.map((m) => {
            const band = exposureBand(m.overall);
            const career = humanizeCareer(m.career);
            return (
              <Link key={m.id} href={`/hub/members/${m.id}`} className="mem-card">
                <Avatar name={m.name} url={m.avatarUrl} size={44} />
                <div className="mem-main">
                  <div className="mem-name">
                    {m.name}
                    {ROLE_LABEL[m.role] && <span className="mem-role">{ROLE_LABEL[m.role]}</span>}
                  </div>
                  <div className="mem-sub">{career ? career + (m.lane ? ` · ${m.lane}` : "") : "Mapping in progress"}</div>
                </div>
                <div className="mem-meta">
                  {m.overall != null && <span className={`mem-exp ${band.cls}`}>{m.overall}</span>}
                  {m.badgeCount > 0 && <span className="mem-badges">🎖 {m.badgeCount}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
