import type { Career } from "@/data/careers";
import { careerCount } from "@/data/careers";
import { renderMarks } from "@/lib/marks";

/**
 * The bordered quick-answer block. The headline score is circled once, up top,
 * by the ScoreBadge — so the prose here leaves it as plain text.
 */
export function QuickAnswer({ career }: { career: Career }) {
  return (
    <div className="quick">
      <div className="lbl">The short answer</div>
      <p>{renderMarks(career.quickAnswer, { count: careerCount })}</p>
    </div>
  );
}
