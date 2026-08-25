"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setViewMode } from "@/app/hub/actions";
import type { ViewMode } from "@/lib/gate";

const MODES: { key: ViewMode; label: string; hint: string }[] = [
  { key: "founder", label: "Founder", hint: "Full access + founder tools" },
  { key: "member", label: "Member", hint: "What a paying member sees" },
  { key: "guest", label: "Guest", hint: "The looking glass (non-member)" },
];

/**
 * Founder-only preview switch — walk the hub as founder, a plain member, or a
 * non-member (looking glass) without swapping accounts. Only real founders ever
 * see this; it stays visible in every mode so you can switch back.
 */
export function ViewModeToggle({ current }: { current: ViewMode }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function pick(mode: ViewMode) {
    if (mode === current) return;
    start(async () => { await setViewMode(mode); router.refresh(); });
  }

  return (
    <div className="viewmode" data-pending={pending}>
      <span className="viewmode-k">Viewing as</span>
      <div className="viewmode-row">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            className={"viewmode-btn" + (m.key === current ? " on" : "")}
            onClick={() => pick(m.key)}
            disabled={pending}
            title={m.hint}
            aria-pressed={m.key === current}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
