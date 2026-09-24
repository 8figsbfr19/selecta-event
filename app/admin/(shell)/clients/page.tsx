import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EmptyState from "@/components/ui/EmptyState";
import { createClient, setClientArchived, deleteClient } from "@/lib/actions/clients";
import SubmitButton from "@/components/ui/SubmitButton";
import { archivedFilter } from "@/lib/archive";
import ActionMenu from "@/components/admin/ActionMenu";
import MenuLink from "@/components/admin/MenuLink";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";
import ArchiveViewTabs from "@/components/admin/ArchiveViewTabs";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { q?: string; view?: string };
}) {
  const q = searchParams.q?.trim();
  const view = searchParams.view;

  const clients = await prisma.client.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...archivedFilter(view),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true, quotes: true, contracts: true, inquiries: true, payments: true, receipts: true, emails: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">Clients</h1>
          <p className="mt-1 text-sm text-cream/50">Every customer, in one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <ArchiveViewTabs basePath="/admin/clients" view={view} extraQuery={{ q }} />
          <form className="flex gap-2">
            {view && <input type="hidden" name="view" value={view} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search clients..."
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
            />
          </form>
        </div>
      </div>

      <details className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <summary className="cursor-pointer font-display text-base font-semibold text-cream">+ New Client</summary>
        <form action={createClient} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input name="name" placeholder="Full Name" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <input name="email" type="email" placeholder="Email" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <input name="phone" placeholder="Phone" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <input name="notes" placeholder="Notes" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <div className="sm:col-span-2">
            <SubmitButton pendingText="Creating...">Create Client</SubmitButton>
          </div>
        </form>
      </details>

      {clients.length === 0 ? (
        <EmptyState title="No clients yet" description="Clients are created automatically from quote requests, or add one manually above." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-cream/40">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Bookings</th>
                <th className="px-5 py-3">Quotes</th>
                <th className="px-5 py-3">Contracts</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((c) => {
                const related: string[] = [];
                if (c._count.inquiries > 0) related.push(`${c._count.inquiries} inquir${c._count.inquiries > 1 ? "ies" : "y"} (deleted)`);
                if (c._count.quotes > 0) related.push(`${c._count.quotes} quote${c._count.quotes > 1 ? "s" : ""} (deleted)`);
                if (c._count.bookings > 0) related.push(`${c._count.bookings} booking${c._count.bookings > 1 ? "s" : ""} (deleted)`);
                if (c._count.contracts > 0) related.push(`${c._count.contracts} contract${c._count.contracts > 1 ? "s" : ""} (deleted, including any signed contracts)`);
                if (c._count.payments > 0) related.push(`${c._count.payments} payment${c._count.payments > 1 ? "s" : ""} (deleted)`);
                if (c._count.receipts > 0) related.push(`${c._count.receipts} receipt${c._count.receipts > 1 ? "s" : ""} (deleted)`);
                if (c._count.emails > 0) related.push(`${c._count.emails} email${c._count.emails > 1 ? "s" : ""} (kept, unlinked from this client)`);
                const hasHistory = related.length > 0;
                return (
                  <tr key={c.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/clients/${c.id}`} className="font-medium text-gold-200 hover:text-gold-100">
                        {c.name}
                      </Link>
                      {c.archived && (
                        <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream/40">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-cream/60">{c.email || "—"}</td>
                    <td className="px-5 py-3 text-cream/60">{c.phone || "—"}</td>
                    <td className="px-5 py-3 text-cream/60">{c._count.bookings}</td>
                    <td className="px-5 py-3 text-cream/60">{c._count.quotes}</td>
                    <td className="px-5 py-3 text-cream/60">{c._count.contracts}</td>
                    <td className="px-5 py-3 text-right">
                      <ActionMenu>
                        <MenuLink href={`/admin/clients/${c.id}`} label="View" />
                        <MenuFormButton
                          action={setClientArchived}
                          fields={{ id: c.id, archived: String(!c.archived) }}
                          label={c.archived ? "Restore" : "Archive"}
                        />
                        <DeleteRecordButton
                          action={deleteClient}
                          fields={{ id: c.id }}
                          title={`Delete client ${c.name}?`}
                          description={
                            hasHistory
                              ? "This client has related business history. Deleting the client permanently deletes their inquiries, quotes, bookings, contracts, payments, and receipts. Emails are kept but unlinked. This cannot be undone."
                              : "This action permanently deletes this client and cannot be undone."
                          }
                          relatedItems={hasHistory ? related : undefined}
                          strong={hasHistory}
                          confirmText={hasHistory ? c.name : undefined}
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
