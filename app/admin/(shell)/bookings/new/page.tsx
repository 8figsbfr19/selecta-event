import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { saveBooking } from "@/lib/actions/bookings";
import { EVENT_TYPE_OPTIONS, BOOKING_SOURCES, label } from "@/lib/constants";
import SubmitButton from "@/components/ui/SubmitButton";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/bookings" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
          ← All Bookings
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-cream">New Booking</h1>
        <p className="mt-1 text-sm text-cream/50">For customers who booked outside the website.</p>
      </div>

      {searchParams.error === "client" && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Please select an existing client or enter a new client&apos;s name.
        </p>
      )}

      <form action={saveBooking} className="max-w-3xl space-y-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Existing Client</label>
          <select name="clientId" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
            <option value="" className="bg-ink-900">— Or create new below —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-ink-900">{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 rounded-xl border border-dashed border-white/10 p-4 sm:grid-cols-3">
          <input name="newClientName" placeholder="New Client Name" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <input name="newClientEmail" type="email" placeholder="New Client Email" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <input name="newClientPhone" placeholder="New Client Phone" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Event Type</label>
            <select name="eventType" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
              {EVENT_TYPE_OPTIONS.map((o) => (
                <option key={o} value={o} className="bg-ink-900">{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">How Did This Come In?</label>
            <select name="source" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
              {BOOKING_SOURCES.map((s) => (
                <option key={s} value={s} className="bg-ink-900">{label(s)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Event Date</label>
            <input type="date" name="eventDate" required className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Start Time</label>
            <input type="time" name="startTime" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">End Time</label>
            <input type="time" name="endTime" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input name="venueName" placeholder="Venue Name" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <input name="guestCount" type="number" placeholder="Guest Count" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
        </div>
        <input name="venueAddress" placeholder="Venue Address" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
        <input name="services" placeholder="Services (comma separated)" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Total Price ($)</label>
            <input name="total" type="number" step="0.01" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Deposit ($)</label>
            <input name="deposit" type="number" step="0.01" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
        </div>

        <textarea name="notes" placeholder="Notes" rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />

        <SubmitButton pendingText="Creating...">Create Booking</SubmitButton>
      </form>
    </div>
  );
}
