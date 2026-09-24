import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import EmptyState from "@/components/ui/EmptyState";
import { archivedFilter } from "@/lib/archive";
import { setReceiptArchived, deleteReceipt } from "@/lib/actions/payments";
import ActionMenu from "@/components/admin/ActionMenu";
import MenuLink from "@/components/admin/MenuLink";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";
import ArchiveViewTabs from "@/components/admin/ArchiveViewTabs";

export default async function ReceiptsPage({ searchParams }: { searchParams: { view?: string } }) {
  const view = searchParams.view;
  const receipts = await prisma.receipt.findMany({
    where: archivedFilter(view),
    include: { client: true, payment: true, booking: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">Receipts</h1>
          <p className="mt-1 text-sm text-cream/50">Every receipt issued to a client.</p>
        </div>
        <ArchiveViewTabs basePath="/admin/receipts" view={view} />
      </div>

      {receipts.length === 0 ? (
        <EmptyState title="No receipts yet" description="Receipts are generated from recorded payments." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-cream/40">
              <tr>
                <th className="px-5 py-3">Number</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {receipts.map((r) => {
                const related = [
                  `Amount: ${formatMoney(r.payment.amountCents)}`,
                  `Client: ${r.client.name}`,
                  `Date: ${formatDate(r.createdAt)}`,
                  ...(r.booking ? [`Booking: ${r.booking.eventType} — ${formatDate(r.booking.eventDate)}`] : []),
                  "The underlying payment record will be kept.",
                ];
                return (
                  <tr key={r.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/receipts/${r.id}`} className="font-medium text-gold-200 hover:text-gold-100">
                        {r.number}
                      </Link>
                      {r.archived && (
                        <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream/40">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-cream/60">{r.client.name}</td>
                    <td className="px-5 py-3 font-semibold text-gold-300">{formatMoney(r.payment.amountCents)}</td>
                    <td className="px-5 py-3 text-cream/60">{formatDate(r.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <ActionMenu>
                        <MenuLink href={`/admin/receipts/${r.id}`} label="View" />
                        <MenuFormButton
                          action={setReceiptArchived}
                          fields={{ id: r.id, archived: String(!r.archived) }}
                          label={r.archived ? "Restore" : "Archive"}
                        />
                        <DeleteRecordButton
                          action={deleteReceipt}
                          fields={{ id: r.id }}
                          title={`Delete receipt ${r.number}?`}
                          description="This action permanently deletes this receipt and cannot be undone."
                          relatedItems={related}
                          strong
                          confirmText={r.number}
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
