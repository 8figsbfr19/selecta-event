import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/dates";
import StatusBadge from "@/components/ui/StatusBadge";
import { label } from "@/lib/constants";
import EmptyState from "@/components/ui/EmptyState";
import { retryEmailAction } from "@/lib/actions/emails";

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: { retried?: string };
}) {
  const emails = await prisma.emailLog.findMany({
    include: { client: true, contract: true, booking: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-cream">Emails</h1>
        <p className="mt-1 text-sm text-cream/50">
          A record of every business communication sent through Selecta Event.
        </p>
      </div>

      {searchParams.retried && (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Retry attempt sent — check the status below.
        </p>
      )}

      {emails.length === 0 ? (
        <EmptyState title="No emails yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-cream/40">
              <tr>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Booking</th>
                <th className="px-5 py-3">Contract</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {emails.map((e) => (
                <tr key={e.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-3 text-cream/70">{e.to}</td>
                  <td className="px-5 py-3 text-cream">
                    {e.subject}
                    {e.status === "FAILED" && e.error && (
                      <p className="mt-0.5 text-xs text-red-300/70">{e.error}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-cream/60">{label(e.type)}</td>
                  <td className="px-5 py-3 text-cream/60">
                    {e.client && (
                      <Link href={`/admin/clients/${e.client.id}`} className="text-gold-300 hover:text-gold-200">
                        {e.client.name}
                      </Link>
                    )}
                  </td>
                  <td className="px-5 py-3 text-cream/60">
                    {e.booking && (
                      <Link href={`/admin/bookings/${e.booking.id}`} className="text-gold-300 hover:text-gold-200">
                        {e.booking.eventType}
                      </Link>
                    )}
                  </td>
                  <td className="px-5 py-3 text-cream/60">
                    {e.contract && (
                      <Link href={`/admin/contracts/${e.contract.id}`} className="text-gold-300 hover:text-gold-200">
                        {e.contract.number}
                      </Link>
                    )}
                  </td>
                  <td className="px-5 py-3 text-cream/60">{formatDateTime(e.createdAt)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-5 py-3">
                    {e.status === "FAILED" && (
                      <form action={retryEmailAction}>
                        <input type="hidden" name="id" value={e.id} />
                        <button className="rounded-full border border-gold-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-200 hover:bg-gold-400/10">
                          Retry
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
