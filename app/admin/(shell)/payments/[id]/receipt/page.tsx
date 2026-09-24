import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { generateReceipt } from "@/lib/actions/payments";
import SubmitButton from "@/components/ui/SubmitButton";

export default async function PaymentReceiptPage({ params }: { params: { id: string } }) {
  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { client: true, receipt: true },
  });
  if (!payment) notFound();

  if (payment.receipt) {
    redirect(`/admin/receipts/${payment.receipt.id}`);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-6 text-center">
        <p className="font-display text-lg text-emerald-300">Payment Recorded</p>
        <p className="mt-2 text-sm text-cream/70">
          {formatMoney(payment.amountCents)} from {payment.client.name} on {formatDate(payment.date)}
        </p>
      </div>

      <form action={generateReceipt} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
        <input type="hidden" name="paymentId" value={payment.id} />
        <p className="text-sm text-cream/60">Generate a professional receipt for this payment.</p>
        <div className="mt-4">
          <SubmitButton pendingText="Generating...">Generate Receipt</SubmitButton>
        </div>
      </form>
    </div>
  );
}
