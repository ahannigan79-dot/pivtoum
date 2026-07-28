import { careerCount } from "@/data/careers";

/** Renders the number of careers we track, so prose stays accurate on refresh. */
export function CareerCount() {
  return <>{careerCount}</>;
}
