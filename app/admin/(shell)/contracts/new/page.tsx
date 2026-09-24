import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createContract } from "@/lib/actions/contracts";
import { EVENT_TYPE_OPTIONS } from "@/lib/constants";
import SubmitButton from "@/components/ui/SubmitButton";

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: { bookingId?: string; clientId?: string; error?: string };
}) {
  const [clients, templates, booking] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.contractTemplate.findMany({ where: { archived: false }, orderBy: { name: "asc" } }),
    searchParams.bookingId
      ? prisma.booking.findUnique({ where: { id: searchParams.bookingId }, include: { client: true } })
      : null,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/contracts" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
          ← All Contracts
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-cream">New Contract</h1>
        {booking && (
          <p className="mt-1 text-sm text-cream/50">
            From booking: {booking.eventType} for {booking.client.name}
          </p>
        )}
      </div>

      {searchParams.error === "client" && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Please select a client.
        </p>
      )}

      <form action={createContract} className="max-w-2xl space-y-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        {booking ? (
          <input type="hidden" name="bookingId" value={booking.id} />
        ) : null}

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Title</label>
          <input name="title" defaultValue="Service Agreement" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Client</label>
          {booking ? (
            <>
              <input type="hidden" name="clientId" value={booking.clientId} />
              <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream/70">{booking.client.name}</p>
            </>
          ) : (
            <select name="clientId" required defaultValue={searchParams.clientId || ""} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
              <option value="" className="bg-ink-900">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-ink-900">{c.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Template</label>
          <select name="templateId" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
            <option value="" className="bg-ink-900">Blank contract</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id} className="bg-ink-900">{t.name}</option>
            ))}
          </select>
        </div>

        {!booking && (
          <div className="space-y-4 rounded-xl border border-dashed border-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-cream/40">Event Details (manual)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <select name="eventType" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
                {EVENT_TYPE_OPTIONS.map((o) => (
                  <option key={o} value={o} className="bg-ink-900">{o}</option>
                ))}
              </select>
              <input type="date" name="eventDate" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input type="time" name="startTime" placeholder="Start Time" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
              <input type="time" name="endTime" placeholder="End Time" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="venueName" placeholder="Venue Name" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
              <input name="guestCount" type="number" placeholder="Guest Count" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
            </div>
            <input name="venueAddress" placeholder="Venue Address" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="total" type="number" step="0.01" placeholder="Total ($)" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
              <input name="deposit" type="number" step="0.01" placeholder="Deposit ($)" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
            </div>
          </div>
        )}

        <SubmitButton pendingText="Creating...">Create Contract</SubmitButton>
      </form>
    </div>
  );
}
