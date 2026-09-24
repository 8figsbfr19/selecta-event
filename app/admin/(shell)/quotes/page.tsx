import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { archivedFilter } from "@/lib/archive";
import { setQuoteArchived, deleteQuote } from "@/lib/actions/quotes";
import ActionMenu from "@/components/admin/ActionMenu";
import MenuLink from "@/components/admin/MenuLink";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";
import ArchiveViewTabs from "@/components/admin/ArchiveViewTabs";

export default async function QuotesPage({ searchParams }: { searchParams: { view?: string } }) {
  const view = searchParams.view;
  const quotes = await prisma.quote.findMany({
    where: archivedFilter(view),
    include: { client: true, lineItems: true, booking: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">Quotes</h1>
          <p className="mt-1 text-sm text-cream/50">Create and track professional quotes.</p>
        </div>
        <div className="flex items-center gap-3">
          <ArchiveViewTabs basePath="/admin/quotes" view={view} />
          <Link href="/admin/quotes/new" className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-5 py-2 text-sm font-semibold text-ink-950 shadow-gold">
            + New Quote
          </Link>
        </div>
      </div>

      {quotes.length === 0 ? (
        <EmptyState title="No quotes yet" description="Create a quote from an inquiry, or start a new one directly." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-cream/40">
              <tr>
                <th className="px-5 py-3">Number</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Event Date</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {quotes.map((q) => {
                const subtotal = q.lineItems.reduce((s, li) => s + li.priceCents * li.quantity, 0) - q.discountCents;
                const total = Math.round(subtotal * (1 + q.taxPercent / 100));
                const hasBooking = !!q.booking;
                const isSimple = q.status === "DRAFT" && !hasBooking;
                return (
                  <tr key={q.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/quotes/${q.id}`} className="font-medium text-gold-200 hover:text-gold-100">
                        {q.number}
                      </Link>
                      {q.archived && (
                        <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream/40">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-cream/60">{q.client.name}</td>
                    <td className="px-5 py-3 text-cream/60">{q.eventDate ? formatDate(q.eventDate) : "—"}</td>
                    <td className="px-5 py-3 text-cream/60">${(total / 100).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ActionMenu>
                        <MenuLink href={`/admin/quotes/${q.id}`} label="View / Edit" />
                        <MenuFormButton
                          action={setQuoteArchived}
                          fields={{ id: q.id, archived: String(!q.archived) }}
                          label={q.archived ? "Restore" : "Archive"}
                        />
                        <DeleteRecordButton
                          action={deleteQuote}
                          fields={{ id: q.id }}
                          title={`Delete quote ${q.number}?`}
                          description="This action permanently deletes this quote and cannot be undone."
                          relatedItems={hasBooking ? [`1 converted booking (will be kept, just unlinked from this quote)`] : undefined}
                          strong={!isSimple}
                          confirmText={!isSimple ? q.number : undefined}
                          menuItem
                        />
                      </ActionMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
