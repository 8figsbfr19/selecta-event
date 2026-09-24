"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Three-dot action menu. The panel is toggled with CSS (not conditional
 * mounting) so children that own their own modal state - e.g.
 * DeleteRecordButton - aren't torn down when the menu closes.
 */
export default function ActionMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-cream/50 hover:bg-white/10 hover:text-cream"
        aria-label="Actions"
        aria-expanded={open}
      >
        ⋯
      </button>
      <div
        className={`absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-xl border border-white/10 bg-ink-900 py-1 shadow-2xl ${
          open ? "block" : "hidden"
        }`}
        onClick={() => setOpen(false)}
      >
        {children}
      </div>
    </div>
  );
}
