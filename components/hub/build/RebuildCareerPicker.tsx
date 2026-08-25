"use client";
import { useRouter } from "next/navigation";

/** Jump to a career's rebuilds in the catalogue. */
export function RebuildCareerPicker({ careers, current }: { careers: { career: string; total: number }[]; current?: string }) {
  const router = useRouter();
  return (
    <label className="gymcat-pick">
      <span>Search by career:</span>
      <select
        value={current ?? ""}
        onChange={(e) => { if (e.target.value) router.push(`/hub/build/rebuild/browse?career=${encodeURIComponent(e.target.value)}`); }}
      >
        <option value="">Choose a career…</option>
        {careers.map((c) => <option key={c.career} value={c.career}>{c.career} ({c.total})</option>)}
      </select>
    </label>
  );
}
