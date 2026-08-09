"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";

const NAV = [
  { href: "/", label: "Careers" },
  { href: "/methodology", label: "Methodology" },
  { href: "/articles", label: "Articles" },
  { href: "/#subscribe", label: "Subscribe" },
];

/** Thin, quiet global header — wordmark plus wayfinding. On phones the links
 *  collapse into a menu so Careers, Methodology and Articles stay reachable. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const pathname = usePathname();

  // The /scores and /map ad landing pages are intentionally distraction-free — no nav.
  if (pathname === "/scores" || pathname === "/map") return null;

  return (
    <header className="site-header">
      <div className="inner">
        <Link className="brand" href="/" aria-label="Pivotum home" onClick={close}>
          <Wordmark />
        </Link>

        <nav className="site-nav">
          {NAV.map((l) => (
            <Link key={l.href} className="site-nav-link" href={l.href}>
              {l.label}
            </Link>
          ))}
          <Link className="site-nav-link site-nav-cta" href="/buy">
            Get profiles
          </Link>
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="nav-toggle-bars" data-open={open} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {open ? (
        <div className="nav-panel">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="nav-panel-link" onClick={close}>
              {l.label}
            </Link>
          ))}
          <Link href="/buy" className="nav-panel-link nav-panel-cta" onClick={close}>
            Get profiles
          </Link>
        </div>
      ) : null}
    </header>
  );
}
