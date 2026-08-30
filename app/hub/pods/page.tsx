import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getMyPods } from "@/lib/pods";

// "Your Pod" always lands you inside your pod. A member without one goes through
// guided placement (never straight to an empty browse list). Browse still lives
// at /hub/pods/browse for switching later.
export default async function PodsPage() {
  const { userId } = await auth();
  const mine = await getMyPods(userId);
  if (mine.length > 0) redirect(`/hub/pods/${mine[0].slug}`);
  redirect("/hub/pods/place");
}
