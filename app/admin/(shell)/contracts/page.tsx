import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { CONTRACT_STATUSES, label } from "@/lib/constants";
import { archivedFilter } from "@/lib/archive";
import { setContractArchived, deleteContract } from "@/lib/actions/contracts";
import ActionMenu from "@/components/admin/ActionMenu";
import MenuLink from "@/components/admin/MenuLink";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";
import ArchiveViewTabs from "@/components/admin/ArchiveViewTabs";

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: { status?: string; view?: string };
}) {
  const status = searchParams.status;
  const view = searchParams.view;

  const contracts = await prisma.contract.findMany({
    where: {
      ...(status === "UNSIGNED" ? { status: { in: ["SENT", "VIEWED"] } } : status ? { status } : {}),
      ...archivedFilter(view),
    },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">Contracts</h1>
          <p className="mt-1 text-sm text-cream/50">Send, sign, and track every agreement.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/contracts/templates" className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-cream/70 hover:bg-white/5">
            Templates
          </Link>
          <Link href="/admin/contracts/new" className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-5 py-2 text-sm font-semibold text-ink-950 shadow-gold">
            + New Contract
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterPill href={`/admin/contracts${view ? `?view=${view}` : ""}`} label="All" active={!status} />
          <FilterPill href={`/admin/contracts?status=UNSIGNED${view ? `&view=${view}` : ""}`} label="Unsigned" active={status === "UNSIGNED"} />
          {CONTRACT_STATUSES.map((s) => (
            <FilterPill key={s} href={`/admin/contracts?status=${s}${view ? `&view=${view}` : ""}`} label={label(s)} active={status === s} />
          ))}
        </div>
        <ArchiveViewTabs basePath="/admin/contracts" view={view} extraQuery={{ status }} />
      </div>

      {contracts.length === 0 ? (
        <EmptyState title="No contracts yet" description="Create one from a booking, or start a manual contract for customers reached outside the website." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-cream/40">
              <tr>
                <th className="px-5 py-3">Number</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contracts.map((c) => {
                const isSigned = c.status === "SIGNED";
                return (
                  <tr key={c.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/contracts/${c.id}`} className="font-medium text-gold-200 hover:text-gold-100">
                        {c.number}
                      </Link>
                      {c.archived && (
                        <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream/40">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-cream/60">{c.client.name}</td>
                    <td className="px-5 py-3 text-cream/60">{c.title}</td>
                    <td className="px-5 py-3 text-cream/60">{formatDate(c.createdAt)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ActionMenu>
                        <MenuLink href={`/admin/contracts/${c.id}`} label="View" />
                        <MenuFormButton
                          action={setContractArchived}
                          fields={{ id: c.id, archived: String(!c.archived) }}
                          label={c.archived ? "Restore" : "Archive"}
                        />
                        <DeleteRecordButton
                          action={deleteContract}
                          fields={{ id: c.id }}
                          title={isSigned ? `Delete signed contract ${c.number}?` : `Delete contract ${c.number}?`}
                          description={
                            isSigned
                              ? "This contract has been signed and is part of the legal history for this booking. Permanent deletion cannot be undone."
                              : "This action permanently deletes this contract and cannot be undone."
                          }
                          strong={isSigned || c.status !== "DRAFT"}
                          confirmText={isSigned ? c.number : c.status !== "DRAFT" ? "DELETE" : undefined}
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
