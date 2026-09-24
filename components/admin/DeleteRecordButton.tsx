"use client";

import { useState, useTransition } from "react";
import ConfirmModal from "./ConfirmModal";

export default function DeleteRecordButton({
  action,
  fields,
  title,
  description,
  relatedItems,
  strong,
  confirmText,
  triggerLabel = "Delete",
  confirmLabel,
  danger = true,
  menuItem = false,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  title: string;
  description: string;
  relatedItems?: string[];
  strong?: boolean;
  confirmText?: string;
  triggerLabel?: string;
  confirmLabel?: string;
  danger?: boolean;
  menuItem?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleConfirm(): Promise<void> {
    return new Promise((resolve) => {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      startTransition(async () => {
        await action(fd);
        setOpen(false);
        resolve();
      });
    });
  }

  const defaultClassName = menuItem
    ? "block w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"
    : "rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className || defaultClassName}>
        {triggerLabel}
      </button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={title}
        description={description}
        relatedItems={relatedItems}
        strong={strong}
        confirmText={confirmText}
        confirmLabel={confirmLabel}
        danger={danger}
      />
    </>
  );
}
