import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { findLesson, getLearnProgress } from "@/lib/learn";
import { LessonComplete } from "@/components/hub/learn/LessonComplete";

export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  const found = findLesson(lesson);
  return { title: found ? `${found.lesson.title} — Learn` : "Lesson — Learn" };
}

export default async function LessonPage({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  const found = findLesson(lesson);
  if (!found) notFound();
  const { userId } = await auth();
  const done = (await getLearnProgress(userId)).has(lesson);

  const l = found.lesson;
  return (
    <>
      <div className="hub-toolbar">
        <Link href="/hub/learn" className="back">‹ Learn</Link>
        <span className="tt">{found.module.title}</span>
      </div>
      <div className="hub-body les">
        <article className="les-body">
          <p className="les-kicker">{found.module.title} · {l.minutes} min read</p>
          <h1>{l.title}</h1>
          <p className="les-summary">{l.summary}</p>
          {l.sections.map((s, i) => (
            <section key={i} className="les-sect">
              <h2>{s.h}</h2>
              {(Array.isArray(s.p) ? s.p : s.p ? [s.p] : []).map((para, j) => <p key={j}>{para}</p>)}
              {s.bullets && s.bullets.length > 0 && (
                <ul className="les-bullets">{s.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
              )}
            </section>
          ))}
        </article>
        <LessonComplete lessonKey={l.key} done={done}
          nextHref={found.next ? `/hub/learn/${found.next.key}` : null}
          nextTitle={found.next?.title ?? null} />
      </div>
    </>
  );
}
