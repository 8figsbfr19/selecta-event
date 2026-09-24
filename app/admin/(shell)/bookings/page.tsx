import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { BOOKING_STATUSES, label } from "@/lib/constants";
import { archivedFilter } from "@/lib/archive";
import { setBookingArchived, deleteBooking } from "@/lib/actions/bookings";
import ActionMenu from "@/components/admin/ActionMenu";
import MenuLink from "@/components/admin/MenuLink";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";
import ArchiveViewTabs from "@/components/admin/ArchiveViewTabs";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; filter?: string; view?: string };
}) {
  const status = searchParams.status;
  const filter = searchParams.filter;
  const view = searchParams.view;

  let bookings = await prisma.booking.findMany({
    where: { ...(status ? { status } : {}), ...archivedFilter(view) },
    include: { client: true, payments: true, receipts: true, contracts: true },
    orderBy: { eventDate: "asc" },
  });

  if (filter === "deposit_due" || filter === "balance_due") {
    bookings = bookings.filter((b) => {
      if (b.status === "CANCELLED") return false;
      const paid = b.payments.reduce((s, p) => s + p.amountCents, 0);
      const depositDue = paid < b.depositCents;
      const balanceDue = paid < b.totalCents;
      return filter === "deposit_due" ? depositDue : balanceDue && !depositDue;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">Bookings</h1>
          <p className="mt-1 text-sm text-cream/50">
            {filter === "deposit_due"
              ? "Bookings with an outstanding deposit."
              : filter === "balance_due"
              ? "Bookings with an outstanding balance."
              : "Every confirmed and pending job."}
          </p>
        </div>
        <Link href="/admin/bookings/new" className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-5 py-2 text-sm font-semibold text-ink-950 shadow-gold">
          + New Booking
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterPill href={`/admin/bookings${view ? `?view=${view}` : ""}`} label="All" active={!status} />
          {BOOKING_STATUSES.map((s) => (
            <FilterPill key={s} href={`/admin/bookings?status=${s}${view ? `&view=${view}` : ""}`} label={label(s)} active={status === s} />
          ))}
        </div>
        <ArchiveViewTabs basePath="/admin/bookings" view={view} extraQuery={{ status }} />
      </div>

      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" description="Convert an accepted quote, or create one manually for customers coming outside the website." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-cream/40">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Balance</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.map((b) => {
                const paid = b.payments.reduce((s, p) => s + p.amountCents, 0);
                const balance = Math.max(b.totalCents - paid, 0);
                const signedContract = b.contracts.some((c) => c.status === "SIGNED");
                const isImportant = b.payments.length > 0 || b.receipts.length > 0 || b.contracts.length > 0 || b.status !== "PENDING";
                const related: string[] = [];
                if (b.payments.length > 0) related.push(`${b.payments.length} payment${b.payments.length > 1 ? "s" : ""} (will be kept, unlinked from this booking)`);
                if (b.receipts.length > 0) related.push(`${b.receipts.length} receipt${b.receipts.length > 1 ? "s" : ""} (will be kept, unlinked from this booking)`);
                if (b.contracts.length > 0) related.push(`${b.contracts.length} contract${b.contracts.length > 1 ? "s" : ""}${signedContract ? " (including a signed contract)" : ""} (will be kept, unlinked from this booking)`);
                return (
                  <tr key={b.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/bookings/${b.id}`} className="font-medium text-gold-200 hover:text-gold-100">
                        {b.client.name}
                      </Link>
                      {b.archived && (
                        <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream/40">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-cream/60">{b.eventType}</td>
                    <td className="px-5 py-3 text-cream/60">{formatDate(b.eventDate)}</td>
                    <td className="px-5 py-3 text-cream/60">{formatMoney(b.totalCents)}</td>
                    <td className="px-5 py-3 text-cream/60">{balance > 0 ? formatMoney(balance) : "Paid"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ActionMenu>
                        <MenuLink href={`/admin/bookings/${b.id}`} label="View" />
                        <MenuFormButton
                          action={setBookingArchived}
                          fields={{ id: b.id, archived: String(!b.archived) }}
                          label={b.archived ? "Restore" : "Archive"}
                        />
                        <DeleteRecordButton
                          action={deleteBooking}
                          fields={{ id: b.id }}
                          title={`Delete booking for ${b.client.name}?`}
                          description="This action permanently deletes this booking and cannot be undone."
                          relatedItems={related.length > 0 ? related : undefined}
                          strong={isImportant}
                          confirmText={isImportant ? "DELETE" : undefined}
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

function FilterPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wider ${
        active ? "border-gold-400/50 bg-gold-400/10 text-gold-300" : "border-white/10 text-cream/50 hover:text-cream"
      }`}
    >
      {label}
    </Link>
  );
}
