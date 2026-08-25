import Link from "next/link";
import { notFound } from "next/navigation";
import { getGeneratedRep } from "@/lib/gym-generate";
import { GymRep } from "@/components/hub/build/GymRep";

export const metadata = { title: "Judgment Gym — fresh rep" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getGeneratedRep(id);
  if (!s) notFound();
  return (
    <>
      <div className="hub-toolbar">
        <Link href="/hub/build/gym" className="back">‹ Judgment Gym</Link>
        <span className="tt">{s.career} · fresh rep ✦</span>
      </div>
      <div className="hub-body">
        <p className="gym-fresh-note">A fresh rep, generated for your lane. Every run is new — come back for another whenever you want the reps.</p>
        <GymRep scenario={s} />
      </div>
    </>
  );
}
