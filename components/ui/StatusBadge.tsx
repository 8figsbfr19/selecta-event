import { label } from "@/lib/constants";

const COLOR_MAP: Record<string, string> = {
  NEW: "bg-blue-500/15 text-blue-300 border-blue-400/30",
  CONTACTED: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30",
  QUOTE_SENT: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  DRAFT: "bg-white/10 text-cream/70 border-white/20",
  SENT: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  VIEWED: "bg-purple-500/15 text-purple-300 border-purple-400/30",
  ACCEPTED: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  SIGNED: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  CONFIRMED: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  PUBLISHED: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  SENT_EMAIL: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  COMPLETED: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  PENDING: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  DECLINED: "bg-red-500/15 text-red-300 border-red-400/30",
  CANCELLED: "bg-red-500/15 text-red-300 border-red-400/30",
  VOIDED: "bg-red-500/15 text-red-300 border-red-400/30",
  FAILED: "bg-red-500/15 text-red-300 border-red-400/30",
  EXPIRED: "bg-white/10 text-cream/50 border-white/20",
  ARCHIVED: "bg-white/10 text-cream/40 border-white/20",
  SOLD_OUT: "bg-red-500/15 text-red-300 border-red-400/30",
  NOT_CONFIGURED: "bg-white/10 text-cream/50 border-white/20",
};

export default function StatusBadge({ status }: { status: string }) {
  const classes = COLOR_MAP[status] || "bg-white/10 text-cream/70 border-white/20";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${classes}`}>
      {label(status)}
    </span>
  );
}
