import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, toInputDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import StatusBadge from "@/components/ui/StatusBadge";
import { saveBooking, updateBookingStatus, forceConfirmBooking, setBookingArchived, deleteBooking } from "@/lib/actions/bookings";
import { sendPaymentReminder } from "@/lib/actions/reminders";
import { BOOKING_STATUSES, EVENT_TYPE_OPTIONS, PAYMENT_TYPES, label } from "@/lib/constants";
import SubmitButton from "@/components/ui/SubmitButton";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/dates";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { warn?: string; reminder?: string };
}) {
  const [booking, settings, reminderEmails] = await Promise.all([
    prisma.booking.findUnique({
      where: { id: params.id },
      include: { client: true, payments: true, contracts: true, quote: true, receipts: true },
    }),
    getSettings(),
    prisma.emailLog.findMany({
      where: {
        bookingId: params.id,
        type: { in: ["DEPOSIT_REMINDER", "BALANCE_REMINDER", "FINAL_PAYMENT_REMINDER", "BOOKING_CONFIRMATION"] },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!booking) notFound();

  const paid = booking.payments.reduce((s, p) => s + p.amountCents, 0);
  const balance = Math.max(booking.totalCents - paid, 0);
  let services: string[] = [];
  try {
    services = JSON.parse(booking.services);
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/bookings" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
            ← All Bookings
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-cream">{booking.client.name}</h1>
          <p className="text-sm text-cream/50">{booking.eventType} · {formatDate(booking.eventDate)}</p>
        </div>
        <div className="flex items-center gap-3">
          {booking.archived && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-cream/40">
              Archived
            </span>
          )}
          <StatusBadge status={booking.status} />
          <MenuFormButton
            action={setBookingArchived}
            fields={{ id: booking.id, archived: String(!booking.archived) }}
            label={booking.archived ? "Restore" : "Archive"}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-cream/70 hover:bg-white/5"
          />
          {(() => {
            const signedContract = booking.contracts.some((c) => c.status === "SIGNED");
            const isImportant = booking.payments.length > 0 || booking.receipts.length > 0 || booking.contracts.length > 0 || booking.status !== "PENDING";
            const related: string[] = [];
            if (booking.payments.length > 0) related.push(`${booking.payments.length} payment${booking.payments.length > 1 ? "s" : ""} (will be kept, unlinked from this booking)`);
            if (booking.receipts.length > 0) related.push(`${booking.receipts.length} receipt${booking.receipts.length > 1 ? "s" : ""} (will be kept, unlinked from this booking)`);
            if (booking.contracts.length > 0) related.push(`${booking.contracts.length} contract${booking.contracts.length > 1 ? "s" : ""}${signedContract ? " (including a signed contract)" : ""} (will be kept, unlinked from this booking)`);
            return (
              <DeleteRecordButton
                action={deleteBooking}
                fields={{ id: booking.id }}
                title={`Delete booking for ${booking.client.name}?`}
                description="This action permanently deletes this booking and cannot be undone."
                relatedItems={related.length > 0 ? related : undefined}
                strong={isImportant}
                confirmText={isImportant ? "DELETE" : undefined}
              />
            );
          })()}
        </div>
      </div>

      {searchParams.warn === "contract" && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-200">
          <p className="font-semibold">This booking has no signed contract.</p>
          <p className="mt-1 text-amber-200/80">
            Your settings require a signed contract before confirming a booking. Send a contract first, or confirm anyway if you&apos;re sure.
          </p>
          <form action={forceConfirmBooking} className="mt-3">
            <input type="hidden" name="id" value={booking.id} />
            <button className="rounded-full border border-amber-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-200 hover:bg-amber-400/10">
              Confirm Anyway
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <form action={updateBookingStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={booking.id} />
          <select name="status" defaultValue={booking.status} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-cream focus:border-gold-400/50 focus:outline-none">
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-ink-900">{label(s)}</option>
            ))}
          </select>
          <button className="rounded-full border border-gold-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold-200 hover:bg-gold-400/10">
            Update Status
          </button>
        </form>
        <Link
          href={`/admin/contracts/new?bookingId=${booking.id}&clientId=${booking.clientId}`}
          className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-950 shadow-gold"
        >
          Create Contract
        </Link>
        <Link
          href={`/admin/payments/new?bookingId=${booking.id}&clientId=${booking.clientId}`}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream/70 hover:bg-white/5"
        >
          Record Payment
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:col-span-2">
          <h2 className="font-display text-base font-semibold text-cream">Booking Details</h2>
          <form action={saveBooking} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={booking.id} />
            <input type="hidden" name="clientId" value={booking.clientId} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Event Type</label>
                <select name="eventType" defaultValue={booking.eventType} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
                  {EVENT_TYPE_OPTIONS.map((o) => (
                    <option key={o} value={o} className="bg-ink-900">{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Guest Count</label>
                <input name="guestCount" type="number" defaultValue={booking.guestCount || ""} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Event Date</label>
                <input type="date" name="eventDate" defaultValue={toInputDate(booking.eventDate)} required className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Start Time</label>
                <input type="time" name="startTime" defaultValue={booking.startTime || ""} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">End Time</label>
                <input type="time" name="endTime" defaultValue={booking.endTime || ""} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="venueName" defaultValue={booking.venueName || ""} placeholder="Venue Name" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
              <input name="venueAddress" defaultValue={booking.venueAddress || ""} placeholder="Venue Address" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
            </div>
            <input name="services" defaultValue={services.join(", ")} placeholder="Services (comma separated)" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Total Price ($)</label>
                <input name="total" type="number" step="0.01" defaultValue={(booking.totalCents / 100).toFixed(2)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Deposit ($)</label>
                <input name="deposit" type="number" step="0.01" defaultValue={(booking.depositCents / 100).toFixed(2)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
              </div>
            </div>
            <input type="hidden" name="source" value={booking.source} />
            <textarea name="notes" defaultValue={booking.notes} rows={3} placeholder="Notes" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
            <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="font-display text-base font-semibold text-cream">Payment Summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-cream/50">Total</dt><dd className="text-cream">{formatMoney(booking.totalCents)}</dd></div>
              <div className="flex justify-between"><dt className="text-cream/50">Deposit</dt><dd className="text-cream">{formatMoney(booking.depositCents)}</dd></div>
              <div className="flex justify-between"><dt className="text-cream/50">Paid</dt><dd className="text-emerald-300">{formatMoney(paid)}</dd></div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-semibold"><dt className="text-cream">Balance</dt><dd className="text-gold-300">{formatMoney(balance)}</dd></div>
            </dl>

            {balance > 0 && booking.client.email && (
              <form action={sendPaymentReminder} className="mt-4 space-y-2 border-t border-white/10 pt-4">
                <input type="hidden" name="bookingId" value={booking.id} />
                {searchParams.reminder && (
                  <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                    Reminder sent.
                  </p>
                )}
                <label className="block text-xs font-semibold uppercase tracking-wider text-cream/50">Send Payment Reminder</label>
                <div className="flex gap-2">
                  <select name="kind" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-cream focus:border-gold-400/50 focus:outline-none">
                    {PAYMENT_TYPES.filter((t) => t !== "OTHER").map((t) => (
                      <option key={t} value={t} className="bg-ink-900">
                        {t === "DEPOSIT" ? "Deposit Required" : t === "PARTIAL" ? "Partial Balance" : "Final Balance"}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-full border border-gold-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold-200 hover:bg-gold-400/10">
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>

          {reminderEmails.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h2 className="font-display text-base font-semibold text-cream">Reminder History</h2>
              <div className="mt-3 space-y-2">
                {reminderEmails.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="text-cream/70">{label(e.type)} Sent</span>
                    <span className="text-xs text-cream/40">{formatDateTime(e.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="font-display text-base font-semibold text-cream">Contracts</h2>
            {booking.contracts.length === 0 ? (
              <p className="mt-3 text-sm text-cream/40">No contracts yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {booking.contracts.map((c) => (
                  <Link key={c.id} href={`/admin/contracts/${c.id}`} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 hover:bg-white/[0.06]">
                    <span className="text-sm text-cream">{c.number}</span>
                    <StatusBadge status={c.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="font-display text-base font-semibold text-cream">Payments</h2>
            {booking.payments.length === 0 ? (
              <p className="mt-3 text-sm text-cream/40">No payments recorded.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {booking.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
                    <span className="text-sm text-cream">{formatDate(p.date)} · {label(p.method)}</span>
                    <span className="text-sm font-semibold text-gold-300">{formatMoney(p.amountCents)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
