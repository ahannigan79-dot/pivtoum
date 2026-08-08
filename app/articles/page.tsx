import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/content/articles/registry";
import { EmailSignup } from "@/components/EmailSignup";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Our thinking on how AI is reshaping careers — the arguments behind The AI Career Index, written for the parents making the call.",
  alternates: { canonical: "/articles" },
};

const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function ArticlesIndex() {
  return (
    <div className="page">
      <div className="body">
        <div className="crumb" style={{ paddingTop: "1.5rem" }}>
          <span>
            <Link href="/">Pivotum</Link>
          </span>
          <i>/</i>
          <span>Articles</span>
        </div>
        <header className="artindex-head">
          <h1>Articles</h1>
          <p className="sub">
            Our thinking on how AI is reshaping careers &mdash; the arguments behind the Index,
            written for the parents making the call.
          </p>
        </header>
        <ul className="artindex-list">
          {articles.map((a) => (
            <li className="artindex-item" key={a.slug}>
              <Link href={`/articles/${a.slug}`}>
                <span className="aidate">{fmtDate(a.datePublished)}</span>
                <h2 className="aititle">{a.title}</h2>
                <p className="aidesc">{a.description}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="artindex-sep" />
        <EmailSignup />
        <SiteFooter />
      </div>
    </div>
  );
}
