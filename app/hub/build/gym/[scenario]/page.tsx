import Link from "next/link";
import { notFound } from "next/navigation";
import { GYM_SCENARIOS } from "@/lib/gym";
import { GymRep } from "@/components/hub/build/GymRep";

export async function generateMetadata({ params }: { params: Promise<{ scenario: string }> }) {
  const { scenario } = await params;
  const s = GYM_SCENARIOS[scenario];
  return { title: s ? `Judgment Gym — ${s.career}` : "Judgment Gym — Pivotum" };
}

export default async function Page({ params }: { params: Promise<{ scenario: string }> }) {
  const { scenario } = await params;
  const s = GYM_SCENARIOS[scenario];
  if (!s) notFound();
  return (
    <>
      <div className="hub-toolbar">
        <Link href="/hub/build/gym" className="back">‹ Judgment Gym</Link>
        <span className="tt">{s.career} · one rep</span>
      </div>
      <div className="hub-body">
        <GymRep scenario={s} />
      </div>
    </>
  );
}
