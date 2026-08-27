"use client";
import { useEffect, useRef, useState } from "react";

/** A compact, on-brand role picker that always opens below the field (the native
 *  <select> flips direction on its own and sizes its options large). Click-outside
 *  and Escape close it; the list scrolls when the 28 roles overflow. */
export function RoleSelect({ options, value, onChange, placeholder = "Choose your role…", disabled = false }: {
  options: { slug: string; name: string }[];
  value: string;
  onChange: (slug: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const current = options.find((o) => o.slug === value);
  if (disabled) {
    return (
      <div className="rsel locked">
        <div className="rsel-btn" aria-disabled="true">
          <span className={current ? undefined : "rsel-ph"}>{current?.name ?? placeholder}</span>
          <span className="rsel-lock" aria-hidden="true">🔒</span>
        </div>
      </div>
    );
  }
  return (
    <div className={"rsel" + (open ? " open" : "")} ref={ref}>
      <button type="button" className="rsel-btn" onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox" aria-expanded={open}>
        <span className={current ? undefined : "rsel-ph"}>{current?.name ?? placeholder}</span>
        <span className="rsel-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className="rsel-list" role="listbox">
          {options.map((o) => (
            <li key={o.slug} role="option" aria-selected={o.slug === value}
              className={"rsel-opt" + (o.slug === value ? " on" : "")}
              onClick={() => { onChange(o.slug); setOpen(false); }}>
              {o.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
