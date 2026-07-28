import type { Career } from "@/data/careers";
import { careerCount } from "@/data/careers";
import { renderMarks } from "@/lib/marks";

/**
 * The bordered quick-answer block. The headline score is circled exactly once,
 * pulled from data — not parsed from the prose.
 */
export function QuickAnswer({ career }: { career: Career }) {
  return (
    <div className="quick">
      <div className="lbl">The short answer</div>
      <p>
        {renderMarks(career.quickAnswer, {
          count: careerCount,
          circleScore: career.headlineScore,
        })}
      </p>
    </div>
  );
}
