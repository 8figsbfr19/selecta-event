import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { recordPayment } from "@/lib/actions/payments";
import { toInputDate } from "@/lib/dates";
import { PAYMENT_METHODS, PAYMENT_TYPES, label } from "@/lib/constants";
import SubmitButton from "@/components/ui/SubmitButton";

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: { bookingId?: string; clientId?: string; error?: string };
}) {
  const [clients, bookings] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.booking.findMany({ include: { client: true }, orderBy: { eventDate: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/payments" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
          ← All Payments
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-cream">Record Payment</h1>
      </div>

      {searchParams.error === "invalid" && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Please select a client and enter a valid amount.
        </p>
      )}

      <form action={recordPayment} className="max-w-xl space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Client</label>
          <select name="clientId" required defaultValue={searchParams.clientId || ""} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
            <option value="" className="bg-ink-900">Select client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-ink-900">{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Booking (optional)</label>
          <select name="bookingId" defaultValue={searchParams.bookingId || ""} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
            <option value="" className="bg-ink-900">No linked booking</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id} className="bg-ink-900">{b.client.name} — {b.eventType}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Amount ($)</label>
            <input name="amount" type="number" step="0.01" required className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Date</label>
            <input name="date" type="date" defaultValue={toInputDate(new Date())} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Payment Method</label>
            <select name="method" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m} className="bg-ink-900">{label(m)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Payment Type</label>
            <select name="type" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
              {PAYMENT_TYPES.map((t) => (
                <option key={t} value={t} className="bg-ink-900">{label(t)}</option>
              ))}
            </select>
          </div>
        </div>
        <textarea name="notes" placeholder="Notes" rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
        <SubmitButton pendingText="Recording...">Record Payment</SubmitButton>
      </form>
    </div>
  );
}
