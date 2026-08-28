"use client";

import Link from "next/link";
import { useState } from "react";

const DOMAIN = 10; // scores run 1–10

export interface IndexRow {
  slug: string;
  name: string;
  safest: number;
  exposed: number;
  loSafe: boolean;
  hiExposed: boolean;
  isLink: boolean;
  goLabel: string;
}

/**
 * The homepage career index. Defaults to risk order (safest → most exposed) —
 * the editorial view that carries the argument and keeps the green/red story
 * intact — with an A–Z toggle for readers who just want to look up one career.
 * Re-sorts client-side; the number colouring survives either order.
 */
export function CareerIndex({ rows }: { rows: IndexRow[] }) {
  const [sort, setSort] = useState<"risk" | "az">("risk");

  const sorted = [...rows].sort((a, b) =>
    sort === "az" ? a.name.localeCompare(b.name) : a.safest - b.safest || a.exposed - b.exposed,
  );

  return (
    <>
      <div className="idx-sort" role="group" aria-label="Sort careers">
        <span className="idx-sort-label">Sort</span>
        <button
          type="button"
          className={sort === "risk" ? "on" : ""}
          aria-pressed={sort === "risk"}
          onClick={() => setSort("risk")}
        >
          Risk order
        </button>
        <button
          type="button"
          className={sort === "az" ? "on" : ""}
          aria-pressed={sort === "az"}
          onClick={() => setSort("az")}
        >
          A&ndash;Z
        </button>
      </div>

      <div className="index">
        <div className="idx-scale">
          <span>Career</span>
          <span className="idx-ends">
            <span>Safest 0</span>
            <span>10 Most exposed</span>
          </span>
          <span />
          <span className="idx-head-go">Career Map</span>
        </div>
        {sorted.map((r) => {
          const left = (r.safest / DOMAIN) * 100;
          const width = Math.max(((r.exposed - r.safest) / DOMAIN) * 100, 1.5);
          const inner = (
            <>
              <span className="idx-name">{r.name}</span>
              <span className="idx-track">
                <span className="idx-seg" style={{ left: `${left}%`, width: `${width}%` }} />
              </span>
              <span className="idx-nums">
                <span className={`idx-lo ${r.loSafe ? "safe" : ""}`}>{r.safest.toFixed(1)}</span>
                &ndash;
                <span className={`idx-hi ${r.hiExposed ? "exposed" : ""}`}>
                  {r.exposed.toFixed(1)}
                </span>
              </span>
              <span className="idx-go" aria-hidden="true">
                {r.isLink ? (
                  <>
                    <span className="idx-go-t">{r.goLabel}</span>
                    <svg viewBox="0 0 16 16" className="idx-go-i">
                      <path
                        d="M3 8h9M9 4l4 4-4 4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                ) : null}
              </span>
            </>
          );
          return r.isLink ? (
            <Link key={r.slug} className="idx-row" href={`/careers/${r.slug}`}>
              {inner}
            </Link>
          ) : (
            <span key={r.slug} className="idx-row">
              {inner}
            </span>
          );
        })}
      </div>
    </>
  );
}
