"use client";
import Link from "next/link";
import { useTransition } from "react";
import { completeLesson } from "@/app/hub/learn/actions";

export function LessonComplete({ lessonKey, done, nextHref, nextTitle }: {
  lessonKey: string; done: boolean; nextHref: string | null; nextTitle: string | null;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="les-foot">
      {done ? (
        <span className="les-done">✓ Completed</span>
      ) : (
        <button className="les-complete" disabled={pending}
          onClick={() => start(() => completeLesson(lessonKey))}>
          {pending ? "Saving…" : "Mark complete"}
        </button>
      )}
      {nextHref
        ? <Link href={nextHref} className="les-next">{done ? "Next" : "Next"}: {nextTitle} →</Link>
        : <Link href="/hub/learn" className="les-next">Back to Learn →</Link>}
    </div>
  );
}
