"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText = "Saving...",
  className = "",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ||
        "rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-6 py-2.5 text-sm font-semibold text-ink-950 shadow-gold transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
      }
    >
      {pending ? pendingText : children}
    </button>
  );
}
