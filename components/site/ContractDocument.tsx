import Image from "next/image";
import { formatDate, formatDateTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export default function ContractDocument({
  contract,
  settings,
}: {
  contract: {
    number: string;
    title: string;
    body: string;
    status: string;
    totalCents: number;
    depositCents: number;
    paidCents: number;
    signedAt: Date | null;
    signerName: string | null;
    signatureText: string | null;
    signatureUrl: string | null;
    createdAt: Date;
    client: { name: string; email: string | null; phone: string | null };
    booking: {
      eventType: string;
      eventDate: Date;
      venueName: string | null;
      venueAddress: string | null;
    } | null;
  };
  settings: { businessName: string; logoUrl: string; djName: string; businessEmail: string; phone: string };
}) {
  const remaining = Math.max(contract.totalCents - contract.paidCents, 0);

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-ink-950 shadow-xl sm:p-12 print:shadow-none">
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
          <p className="text-xs uppercase tracking-widest text-black/40">Contract</p>
          <p className="font-display text-lg font-bold">{contract.number}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-black/40">Client</p>
          <p className="mt-1 text-sm font-semibold">{contract.client.name}</p>
          {contract.client.email && <p className="text-sm text-black/60">{contract.client.email}</p>}
          {contract.client.phone && <p className="text-sm text-black/60">{contract.client.phone}</p>}
        </div>
        {contract.booking && (
          <div>
            <p className="text-xs uppercase tracking-widest text-black/40">Event</p>
            <p className="mt-1 text-sm font-semibold">{contract.booking.eventType}</p>
            <p className="text-sm text-black/60">{formatDate(contract.booking.eventDate)}</p>
            {contract.booking.venueName && <p className="text-sm text-black/60">{contract.booking.venueName}</p>}
            {contract.booking.venueAddress && <p className="text-sm text-black/60">{contract.booking.venueAddress}</p>}
          </div>
        )}
      </div>

      <h1 className="mt-8 font-display text-2xl font-bold">{contract.title}</h1>

      <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-black/80">{contract.body}</div>

      {contract.totalCents > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-black/10 pt-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-black/40">Total</p>
            <p className="font-semibold">{formatMoney(contract.totalCents)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-black/40">Deposit</p>
            <p className="font-semibold">{formatMoney(contract.depositCents)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-black/40">Balance Remaining</p>
            <p className="font-semibold">{formatMoney(remaining)}</p>
          </div>
        </div>
      )}

      <div className="mt-10 border-t border-black/10 pt-6">
        <p className="text-xs uppercase tracking-widest text-black/40">Signature</p>
        {contract.status === "SIGNED" ? (
          <div className="mt-3">
            {contract.signatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contract.signatureUrl}
                alt={`Signature of ${contract.signerName ?? "signer"}`}
                className="h-24 max-w-full object-contain object-left"
              />
            ) : (
              <p className="font-serif2 text-2xl italic">{contract.signatureText}</p>
            )}
            <p className="mt-1 text-sm font-semibold">{contract.signerName}</p>
            <p className="text-xs text-black/50">Signed {contract.signedAt && formatDateTime(contract.signedAt)}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-black/40">Awaiting signature.</p>
        )}
      </div>

      <p className="mt-10 text-center text-[0.65rem] uppercase tracking-widest text-black/30">
        {settings.businessName} — Generated {formatDate(contract.createdAt)}
      </p>
    </div>
  );
}
