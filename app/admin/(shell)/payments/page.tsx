import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { label } from "@/lib/constants";
import EmptyState from "@/components/ui/EmptyState";
import { archivedFilter } from "@/lib/archive";
import { setPaymentArchived, deletePayment } from "@/lib/actions/payments";
import ActionMenu from "@/components/admin/ActionMenu";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";
import ArchiveViewTabs from "@/components/admin/ArchiveViewTabs";

export default async function PaymentsPage({ searchParams }: { searchParams: { view?: string } }) {
  const view = searchParams.view;
  const payments = await prisma.payment.findMany({
    where: archivedFilter(view),
    include: { client: true, booking: true, receipt: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">Payments</h1>
          <p className="mt-1 text-sm text-cream/50">Record and track every payment received.</p>
        </div>
        <div className="flex items-center gap-3">
          <ArchiveViewTabs basePath="/admin/payments" view={view} />
          <Link href="/admin/payments/new" className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-5 py-2 text-sm font-semibold text-ink-950 shadow-gold">
            + Record Payment
          </Link>
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState title="No payments recorded yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-cream/40">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Receipt</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((p) => {
                const related = [
                  `Amount: ${formatMoney(p.amountCents)}`,
                  `Client: ${p.client.name}`,
                  `Date: ${formatDate(p.date)}`,
                  ...(p.booking ? [`Booking: ${p.booking.eventType} — ${formatDate(p.booking.eventDate)}`] : []),
                  ...(p.receipt ? [`Receipt ${p.receipt.number} will also be deleted`] : []),
                ];
                return (
                  <tr key={p.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3 text-cream">
                      {p.client.name}
                      {p.archived && (
                        <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream/40">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-cream/60">{formatDate(p.date)}</td>
                    <td className="px-5 py-3 text-cream/60">{label(p.method)}</td>
                    <td className="px-5 py-3 text-cream/60">{label(p.type)}</td>
                    <td className="px-5 py-3 font-semibold text-gold-300">{formatMoney(p.amountCents)}</td>
                    <td className="px-5 py-3">
                      {p.receipt ? (
                        <Link href={`/admin/receipts/${p.receipt.id}`} className="text-xs font-semibold uppercase tracking-wider text-gold-300 hover:text-gold-200">
                          {p.receipt.number}
                        </Link>
                      ) : (
                        <Link href={`/admin/payments/${p.id}/receipt`} className="text-xs font-semibold uppercase tracking-wider text-cream/50 hover:text-cream">
                          Generate →
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ActionMenu>
                        <MenuFormButton
                          action={setPaymentArchived}
                          fields={{ id: p.id, archived: String(!p.archived) }}
                          label={p.archived ? "Restore" : "Archive"}
                        />
                        <DeleteRecordButton
                          action={deletePayment}
                          fields={{ id: p.id }}
                          title={`Delete payment of ${formatMoney(p.amountCents)}?`}
                          description="This action permanently deletes this payment and cannot be undone."
                          relatedItems={related}
                          strong
                          confirmText="DELETE"
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
