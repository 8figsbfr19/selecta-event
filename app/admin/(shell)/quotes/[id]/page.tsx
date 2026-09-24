import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuoteForm from "@/components/admin/QuoteForm";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatMoney } from "@/lib/money";
import { sendQuoteAction, markQuoteStatus, convertQuoteToBooking, setQuoteArchived, deleteQuote } from "@/lib/actions/quotes";
import { sendQuoteFollowUp } from "@/lib/actions/reminders";
import { formatDateTime } from "@/lib/dates";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: { client: true, lineItems: { orderBy: { sortOrder: "asc" } }, booking: true },
  });
  if (!quote) notFound();

  const [clients, followUps] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.emailLog.findMany({
      where: { quoteId: quote.id, type: "QUOTE_FOLLOWUP" },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const subtotal = quote.lineItems.reduce((s, li) => s + li.priceCents * li.quantity, 0);
  const afterDiscount = subtotal - quote.discountCents;
  const total = Math.round(afterDiscount * (1 + quote.taxPercent / 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/quotes" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
            ← All Quotes
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-cream">{quote.number}</h1>
          <p className="text-sm text-cream/50">{quote.client.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {quote.archived && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-cream/40">
              Archived
            </span>
          )}
          <StatusBadge status={quote.status} />
          <MenuFormButton
            action={setQuoteArchived}
            fields={{ id: quote.id, archived: String(!quote.archived) }}
            label={quote.archived ? "Restore" : "Archive"}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-cream/70 hover:bg-white/5"
          />
          <DeleteRecordButton
            action={deleteQuote}
            fields={{ id: quote.id }}
            title={`Delete quote ${quote.number}?`}
            description="This action permanently deletes this quote and cannot be undone."
            relatedItems={quote.booking ? [`1 converted booking (will be kept, just unlinked from this quote)`] : undefined}
            strong={quote.status !== "DRAFT" || !!quote.booking}
            confirmText={quote.status !== "DRAFT" || quote.booking ? quote.number : undefined}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <form action={sendQuoteAction}>
          <input type="hidden" name="id" value={quote.id} />
          <button className="rounded-full border border-gold-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold-200 hover:bg-gold-400/10">
            Send Quote
          </button>
        </form>
        {quote.status === "SENT" && (
          <form action={sendQuoteFollowUp}>
            <input type="hidden" name="id" value={quote.id} />
            <button className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream/70 hover:bg-white/5">
              Send Follow-Up
            </button>
          </form>
        )}
        <form action={markQuoteStatus}>
          <input type="hidden" name="id" value={quote.id} />
          <input type="hidden" name="status" value="ACCEPTED" />
          <button className="rounded-full border border-emerald-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 hover:bg-emerald-400/10">
            Mark Accepted
          </button>
        </form>
        <form action={markQuoteStatus}>
          <input type="hidden" name="id" value={quote.id} />
          <input type="hidden" name="status" value="DECLINED" />
          <button className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-300 hover:bg-red-400/10">
            Mark Declined
          </button>
        </form>
        {quote.status === "ACCEPTED" && !quote.booking && (
          <form action={convertQuoteToBooking}>
            <input type="hidden" name="id" value={quote.id} />
            <button className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-950 shadow-gold">
              Convert to Booking
            </button>
          </form>
        )}
        {quote.booking && (
          <Link
            href={`/admin/bookings/${quote.booking.id}`}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream/70 hover:bg-white/5"
          >
            View Booking →
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:col-span-2">
          <h2 className="font-display text-base font-semibold text-cream">Edit Quote</h2>
          <div className="mt-4">
            <QuoteForm
              quote={{
                id: quote.id,
                clientId: quote.clientId,
                inquiryId: quote.inquiryId,
                eventType: quote.eventType,
                eventDate: quote.eventDate,
                discountCents: quote.discountCents,
                taxPercent: quote.taxPercent,
                depositCents: quote.depositCents,
                expiresAt: quote.expiresAt,
                notes: quote.notes,
                lineItems: quote.lineItems,
              }}
              clients={clients}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="font-display text-base font-semibold text-cream">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-cream/50">Subtotal</dt><dd className="text-cream">{formatMoney(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-cream/50">Discount</dt><dd className="text-cream">-{formatMoney(quote.discountCents)}</dd></div>
            <div className="flex justify-between"><dt className="text-cream/50">Tax</dt><dd className="text-cream">{quote.taxPercent}%</dd></div>
            <div className="flex justify-between border-t border-white/10 pt-2 font-semibold"><dt className="text-cream">Total</dt><dd className="text-gold-300">{formatMoney(total)}</dd></div>
            <div className="flex justify-between"><dt className="text-cream/50">Deposit Required</dt><dd className="text-cream">{formatMoney(quote.depositCents)}</dd></div>
          </dl>

          {followUps.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cream/40">Follow-Up History</h3>
              <div className="mt-2 space-y-2">
                {followUps.map((f) => (
                  <div key={f.id} className="flex items-center justify-between text-sm">
                    <span className="text-cream/70">Follow-Up Sent</span>
                    <span className="text-xs text-cream/40">{formatDateTime(f.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
