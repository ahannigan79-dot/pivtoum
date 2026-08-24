import Link from "next/link";
import type { Thread } from "@/lib/threads";
import { NewThreadForm } from "./NewThreadForm";

export function ThreadNav({ threads, activeSlug, podSlug }: {
  threads: Thread[]; activeSlug: string; podSlug: string;
}) {
  return (
    <nav className="thread-nav">
      {threads.map((t) => (
        <Link key={t.id} href={`/hub/pods/${podSlug}?t=${t.slug}`}
          className={"thread-tab" + (t.slug === activeSlug ? " on" : "")}>
          <span className="thread-emoji-lbl">{t.emoji ?? "💬"}</span> {t.name}
        </Link>
      ))}
      <NewThreadForm slug={podSlug} />
    </nav>
  );
}
