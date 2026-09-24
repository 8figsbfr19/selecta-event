"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  relatedItems,
  strong,
  confirmText,
  confirmLabel = "Delete Permanently",
  danger = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  relatedItems?: string[];
  strong?: boolean;
  confirmText?: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setTyped("");
      setPending(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const canConfirm = !strong || typed.trim().toLowerCase() === (confirmText || "").trim().toLowerCase();

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-semibold text-cream">{title}</h2>
        <p className="mt-2 text-sm text-cream/60">{description}</p>

        {relatedItems && relatedItems.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">This record has:</p>
            <ul className="mt-2 space-y-1 text-sm text-amber-100/90">
              {relatedItems.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-amber-200/70">Deleting this may affect related records.</p>
          </div>
        )}

        {strong && (
          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">
              Type <span className="font-mono text-red-300">{confirmText}</span> to confirm
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-red-400/50 focus:outline-none"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-cream/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm || pending}
            onClick={async () => {
              setPending(true);
              await onConfirm();
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
              danger ? "bg-red-600 text-white hover:bg-red-500" : "bg-gradient-to-b from-gold-200 to-gold-600 text-ink-950"
            }`}
          >
            {pending ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
