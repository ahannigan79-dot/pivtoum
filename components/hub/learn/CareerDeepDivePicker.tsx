"use client";
import { useRouter } from "next/navigation";

/** Jump to another field's Deep Dive. */
export function CareerDeepDivePicker({ options, current }: { options: { slug: string; name: string }[]; current?: string }) {
  const router = useRouter();
  return (
    <label className="dd-pick">
      <span>Read another field:</span>
      <select
        value={current ?? ""}
        onChange={(e) => { if (e.target.value) router.push(`/hub/learn/career/${e.target.value}`); }}
      >
        <option value="">Choose a field…</option>
        {options.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}
      </select>
    </label>
  );
}
