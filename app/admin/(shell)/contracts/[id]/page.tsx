import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/dates";
import StatusBadge from "@/components/ui/StatusBadge";
import SubmitButton from "@/components/ui/SubmitButton";
import ConfirmSubmit from "@/components/ui/ConfirmSubmit";
import {
  updateContractBody,
  sendContractAction,
  sendContractReminder,
  voidContract,
  markContractDeclined,
  duplicateContract,
  setContractArchived,
  deleteContract,
} from "@/lib/actions/contracts";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

const LOCKED = ["SIGNED", "VOIDED"];

export default async function ContractDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: { client: true, booking: true },
  });
  if (!contract) notFound();

  const reminders = await prisma.emailLog.findMany({
    where: { contractId: contract.id, type: "CONTRACT_REMINDER" },
    orderBy: { createdAt: "asc" },
  });

  const timelineEvents: { label: string; date: Date }[] = [];
  if (contract.sentAt) timelineEvents.push({ label: "Contract Sent", date: contract.sentAt });
  for (const r of reminders) timelineEvents.push({ label: "Reminder Sent", date: r.createdAt });
  if (contract.viewedAt) timelineEvents.push({ label: "Viewed", date: contract.viewedAt });
  if (contract.signedAt) timelineEvents.push({ label: "Signed", date: contract.signedAt });
  timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  const locked = LOCKED.includes(contract.status);
  const link = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/contract/${contract.publicToken}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/contracts" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
            ← All Contracts
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-cream">{contract.number}</h1>
          <p className="text-sm text-cream/50">{contract.client.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {contract.archived && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-cream/40">
              Archived
            </span>
          )}
          <StatusBadge status={contract.status} />
          <MenuFormButton
            action={setContractArchived}
            fields={{ id: contract.id, archived: String(!contract.archived) }}
            label={contract.archived ? "Restore" : "Archive"}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-cream/70 hover:bg-white/5"
          />
          <DeleteRecordButton
            action={deleteContract}
            fields={{ id: contract.id }}
            title={contract.status === "SIGNED" ? `Delete signed contract ${contract.number}?` : `Delete contract ${contract.number}?`}
            description={
              contract.status === "SIGNED"
                ? "This contract has been signed and is part of the legal history for this booking. Permanent deletion cannot be undone."
                : "This action permanently deletes this contract and cannot be undone."
            }
            strong={contract.status === "SIGNED" || contract.status !== "DRAFT"}
            confirmText={contract.status === "SIGNED" ? contract.number : contract.status !== "DRAFT" ? "DELETE" : undefined}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <Link href={`/admin/contracts/${contract.id}/print`} target="_blank" className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream/70 hover:bg-white/5">
          Preview / Print
        </Link>
        {!locked && contract.status === "DRAFT" && (
          <form action={sendContractAction}>
            <input type="hidden" name="id" value={contract.id} />
            <button className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-950 shadow-gold">
              Send Contract
            </button>
          </form>
        )}
        {["SENT", "VIEWED"].includes(contract.status) && (
          <form action={sendContractReminder}>
            <input type="hidden" name="id" value={contract.id} />
            <button className="rounded-full border border-gold-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold-200 hover:bg-gold-400/10">
              Send Reminder
            </button>
          </form>
        )}
        {!locked && contract.status !== "DECLINED" && (
          <form action={markContractDeclined}>
            <input type="hidden" name="id" value={contract.id} />
            <button className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-300 hover:bg-red-400/10">
              Mark Declined
            </button>
          </form>
        )}
        {!locked && (
          <form action={voidContract}>
            <input type="hidden" name="id" value={contract.id} />
            <ConfirmSubmit message="Void this contract? This cannot be undone.">Void Contract</ConfirmSubmit>
          </form>
        )}
        <form action={duplicateContract}>
          <input type="hidden" name="id" value={contract.id} />
          <button className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream/70 hover:bg-white/5">
            Duplicate As New
          </button>
        </form>
      </div>

      {contract.status !== "DRAFT" && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-cream/50">
          Secure client link: <span className="text-gold-200">{link}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:col-span-2">
          <h2 className="font-display text-base font-semibold text-cream">Contract Text</h2>
          {locked ? (
            <>
              <p className="mt-2 text-xs text-amber-300">
                This contract has been {contract.status.toLowerCase()} and can no longer be edited. Duplicate it to make changes for this client.
              </p>
              <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-white/[0.03] p-4 font-sans text-sm leading-relaxed text-cream/80">
                {contract.body}
              </pre>
            </>
          ) : (
            <form action={updateContractBody} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={contract.id} />
              {searchParams.error === "locked" && (
                <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  This contract can no longer be edited.
                </p>
              )}
              <input name="title" defaultValue={contract.title} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
              <textarea name="body" defaultValue={contract.body} rows={20} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 font-mono text-xs leading-relaxed text-cream focus:border-gold-400/50 focus:outline-none" />
              <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="font-display text-base font-semibold text-cream">Overview</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-cream/50">Total</dt><dd className="text-cream">{formatMoney(contract.totalCents)}</dd></div>
              <div className="flex justify-between"><dt className="text-cream/50">Deposit</dt><dd className="text-cream">{formatMoney(contract.depositCents)}</dd></div>
              {contract.sentAt && <div className="flex justify-between"><dt className="text-cream/50">Sent</dt><dd className="text-cream">{formatDateTime(contract.sentAt)}</dd></div>}
              {contract.viewedAt && <div className="flex justify-between"><dt className="text-cream/50">Viewed</dt><dd className="text-cream">{formatDateTime(contract.viewedAt)}</dd></div>}
              {contract.signedAt && <div className="flex justify-between"><dt className="text-cream/50">Signed</dt><dd className="text-emerald-300">{formatDateTime(contract.signedAt)}</dd></div>}
            </dl>
            {contract.booking && (
              <Link href={`/admin/bookings/${contract.booking.id}`} className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-gold-300 hover:text-gold-200">
                View Booking →
              </Link>
            )}
          </div>

          {timelineEvents.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h2 className="font-display text-base font-semibold text-cream">Activity</h2>
              <div className="mt-3 space-y-2">
                {timelineEvents.map((e, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-cream/70">{e.label}</span>
                    <span className="text-xs text-cream/40">{formatDateTime(e.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contract.status === "SIGNED" && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-6">
              <h2 className="font-display text-base font-semibold text-emerald-300">Signature</h2>
              <p className="mt-2 text-sm text-cream/80">{contract.signerName}</p>
              {contract.signatureUrl ? (
                <div className="mt-2 rounded-lg bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={contract.signatureUrl} alt={`Signature of ${contract.signerName}`} className="h-16 object-contain object-left" />
                </div>
              ) : (
                <p className="mt-1 font-serif2 text-lg italic text-cream/70">{contract.signatureText}</p>
              )}
              <p className="mt-2 text-xs text-cream/40">{contract.signedAt && formatDateTime(contract.signedAt)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
