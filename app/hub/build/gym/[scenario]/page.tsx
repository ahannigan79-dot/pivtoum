import { notFound } from "next/navigation";
import { ToolFrame } from "@/components/hub/ToolFrame";

const SCENARIOS: Record<string, { file: string; title: string }> = {
  marketing: { file: "judgment-gym-marketing", title: "Judgment Gym — Marketing" },
  nursing: { file: "judgment-gym-nursing", title: "Judgment Gym — Nursing" },
};

export default async function Page({ params }: { params: Promise<{ scenario: string }> }) {
  const { scenario } = await params;
  const t = SCENARIOS[scenario];
  if (!t) notFound();
  return <ToolFrame src={`/tools/${t.file}.html`} title={t.title} backHref="/hub/build/gym" backLabel="Judgment Gym" repKey={`gym-${scenario}`} />;
}
