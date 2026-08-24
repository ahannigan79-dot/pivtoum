import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getMyPods } from "@/lib/pods";

// "Your Pod" always lands you inside your pod. Browse/join lives at /hub/pods/browse.
export default async function PodsPage() {
  const { userId } = await auth();
  const mine = await getMyPods(userId);
  if (mine.length > 0) redirect(`/hub/pods/${mine[0].slug}`);
  redirect("/hub/pods/browse");
}
