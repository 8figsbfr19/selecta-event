import Image from "next/image";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { label } from "@/lib/constants";

export default function ReceiptDocument({
  receipt,
  settings,
  bookingTotalCents,
  totalPaidCents,
}: {
  receipt: {
    number: string;
    createdAt: Date;
    client: { name: string; email: string | null };
    booking: { eventType: string; eventDate: Date } | null;
    payment: { amountCents: number; method: string; date: Date };
  };
  settings: { businessName: string; logoUrl: string; businessEmail: string };
  bookingTotalCents?: number;
  totalPaidCents?: number;
}) {
  const showBalance = typeof bookingTotalCents === "number";
  const remaining = showBalance ? Math.max(bookingTotalCents! - (totalPaidCents ?? 0), 0) : 0;
  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-ink-950 shadow-xl sm:p-12 print:shadow-none">
      <div className="flex items-center justify-between border-b border-black/10 pb-6">
        <div className="flex items-center gap-3">
          <span className="relative block h-12 w-12 overflow-hidden rounded-full">
            <Image src={settings.logoUrl} alt={settings.businessName} fill className="object-cover" />
          </span>
          <div>
            <p className="font-display text-lg font-bold">{settings.businessName}</p>
            {settings.businessEmail && <p className="text-xs text-black/50">{settings.businessEmail}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-black/40">Receipt</p>
          <p className="font-display text-lg font-bold">{receipt.number}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-black/40">Client</p>
          <p className="mt-1 text-sm font-semibold">{receipt.client.name}</p>
          {receipt.client.email && <p className="text-sm text-black/60">{receipt.client.email}</p>}
        </div>
        {receipt.booking && (
          <div>
            <p className="text-xs uppercase tracking-widest text-black/40">Event</p>
            <p className="mt-1 text-sm font-semibold">{receipt.booking.eventType}</p>
            <p className="text-sm text-black/60">{formatDate(receipt.booking.eventDate)}</p>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-black/10 p-5">
        <div className="flex justify-between text-sm">
          <span className="text-black/50">Amount Paid</span>
          <span className="font-semibold">{formatMoney(receipt.payment.amountCents)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-black/50">Payment Method</span>
          <span>{label(receipt.payment.method)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-black/50">Payment Date</span>
          <span>{formatDate(receipt.payment.date)}</span>
        </div>
        {showBalance && (
          <>
            <div className="mt-4 flex justify-between border-t border-black/10 pt-3 text-sm">
              <span className="text-black/50">Booking Total</span>
              <span>{formatMoney(bookingTotalCents!)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-black/50">Total Paid To Date</span>
              <span>{formatMoney(totalPaidCents ?? 0)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm font-semibold">
              <span className="text-black/50">Remaining Balance</span>
              <span>{formatMoney(remaining)}</span>
            </div>
          </>
        )}
      </div>

      <p className="mt-10 text-center text-[0.65rem] uppercase tracking-widest text-black/30">
        Thank you — {settings.businessName} · Issued {formatDate(receipt.createdAt)}
      </p>
    </div>
  );
}
