import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import ReceiptDocument from "@/components/site/ReceiptDocument";
import { emailReceipt, setReceiptArchived, deleteReceipt } from "@/lib/actions/payments";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import SubmitButton from "@/components/ui/SubmitButton";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

export default async function ReceiptDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { emailed?: string };
}) {
  const [receipt, settings] = await Promise.all([
    prisma.receipt.findUnique({
      where: { id: params.id },
      include: { client: true, booking: { include: { payments: true } }, payment: true },
    }),
    getSettings(),
  ]);
  if (!receipt) notFound();

  const totalPaid = receipt.booking?.payments.reduce((s, p) => s + p.amountCents, 0);

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin/receipts" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
          ← All Receipts
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {receipt.archived && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-cream/40">
              Archived
            </span>
          )}
          <button
            data-print-trigger
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream/70 hover:bg-white/5"
          >
            Print / Save PDF
          </button>
          {receipt.client.email && (
            <form action={emailReceipt}>
              <input type="hidden" name="id" value={receipt.id} />
              <SubmitButton pendingText="Sending..." className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-950 shadow-gold">
                Email Receipt
              </SubmitButton>
            </form>
          )}
          <MenuFormButton
            action={setReceiptArchived}
            fields={{ id: receipt.id, archived: String(!receipt.archived) }}
            label={receipt.archived ? "Restore" : "Archive"}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream/70 hover:bg-white/5"
          />
          <DeleteRecordButton
            action={deleteReceipt}
            fields={{ id: receipt.id }}
            title={`Delete receipt ${receipt.number}?`}
            description="This action permanently deletes this receipt and cannot be undone."
            relatedItems={[
              `Amount: ${formatMoney(receipt.payment.amountCents)}`,
              `Client: ${receipt.client.name}`,
              `Date: ${formatDate(receipt.createdAt)}`,
              ...(receipt.booking ? [`Booking: ${receipt.booking.eventType} — ${formatDate(receipt.booking.eventDate)}`] : []),
              "The underlying payment record will be kept.",
            ]}
            strong
            confirmText={receipt.number}
            className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-300 hover:bg-red-500/20"
          />
        </div>
      </div>

      {searchParams.emailed && <p className="no-print text-sm text-emerald-300">Receipt emailed.</p>}

      <ReceiptDocument
        receipt={receipt}
        settings={settings}
        bookingTotalCents={receipt.booking?.totalCents}
        totalPaidCents={totalPaid}
      />

      <script
        dangerouslySetInnerHTML={{
          __html: `document.querySelector('[data-print-trigger]')?.addEventListener('click', () => window.print());`,
        }}
      />
    </div>
  );
}
