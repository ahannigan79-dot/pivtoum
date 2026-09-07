import "server-only";
import { getTrajectory } from "@/lib/trajectory";
import { qualifyingMonths } from "@/lib/gym-gate";
import { focusDividend } from "@/lib/focus";
import { getLaneOverride } from "@/lib/baselines";
import { currentExposure } from "@/lib/score";

/* One place that answers "what is my exposure right now" so every surface agrees.
 * Two layers: the MAP READING (your answers × the market baseline, what the Map
 * tool computes and saves) and your CURRENT score (the reading minus the work
 * you've banked — effort + focus dividends). The dashboard headline is `current`;
 * the Map page shows the reading; this ties them together so they never diverge
 * without explanation. */

export type Standing = {
  hasMap: boolean;
  mapReading: number | null; // your saved map score, adjusted for any market re-score
  dividend: number;          // exposure your work has bought down (effort + focus)
  current: number | null;    // mapReading − dividend
};

export async function getStanding(
  userId: string | null,
  careerSlug: string | null | undefined,
  currentLane: string | null | undefined,
): Promise<Standing> {
  const traj = await getTrajectory(userId);
  if (!traj.hasMap || traj.overall == null) return { hasMap: false, mapReading: null, dividend: 0, current: null };
  const savedBaseline = traj.computed?.personal?.laneBaseline ?? null;
  const laneOverride = await getLaneOverride(careerSlug, currentLane);
  const marketShift = laneOverride != null && savedBaseline != null ? laneOverride - savedBaseline : 0;
  const [effort, focus] = await Promise.all([qualifyingMonths(userId), focusDividend(userId)]);
  const dividend = effort + focus;
  const mapReading = traj.overall + marketShift;
  return { hasMap: true, mapReading, dividend, current: currentExposure(mapReading, dividend) };
}
