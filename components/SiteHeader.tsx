import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

/** Thin, quiet global header — wordmark plus minimal wayfinding. */
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="inner">
        <Link className="brand" href="/" aria-label="Pivotum home">
          <Wordmark />
        </Link>
        <nav>
          <Link className="site-nav-link nav-hide-sm" href="/">
            Careers
          </Link>
          <Link className="site-nav-link nav-hide-sm" href="/methodology">
            Methodology
          </Link>
          <Link className="site-nav-link nav-hide-sm" href="/essays/helping-your-kid-pick-a-career">
            Essays
          </Link>
          <Link className="site-nav-link" href="/#subscribe">
            Subscribe
          </Link>
          <Link className="site-nav-link site-nav-cta" href="/buy">
            Get profiles
          </Link>
        </nav>
      </div>
    </header>
  );
}
