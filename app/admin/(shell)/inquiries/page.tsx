import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { INQUIRY_STATUSES, label } from "@/lib/constants";
import { archivedFilter } from "@/lib/archive";
import { setInquiryArchived, deleteInquiry } from "@/lib/actions/inquiries";
import ActionMenu from "@/components/admin/ActionMenu";
import MenuLink from "@/components/admin/MenuLink";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";
import ArchiveViewTabs from "@/components/admin/ArchiveViewTabs";

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: { status?: string; view?: string };
}) {
  const status = searchParams.status;
  const view = searchParams.view;

  const inquiries = await prisma.inquiry.findMany({
    where: { ...(status ? { status } : {}), ...archivedFilter(view) },
    include: { client: true, quotes: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-cream">Inquiries</h1>
        <p className="mt-1 text-sm text-cream/50">Every quote request submitted from the website.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterPill href={`/admin/inquiries${view ? `?view=${view}` : ""}`} label="All" active={!status} />
          {INQUIRY_STATUSES.map((s) => (
            <FilterPill
              key={s}
              href={`/admin/inquiries?status=${s}${view ? `&view=${view}` : ""}`}
              label={label(s)}
              active={status === s}
            />
          ))}
        </div>
        <ArchiveViewTabs basePath="/admin/inquiries" view={view} extraQuery={{ status }} />
      </div>

      {inquiries.length === 0 ? (
        <EmptyState title="No inquiries" description="Quote requests submitted from the public site will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-cream/40">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Event Type</th>
                <th className="px-5 py-3">Event Date</th>
                <th className="px-5 py-3">Budget</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inquiries.map((i) => (
                <tr key={i.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-3">
                    <Link href={`/admin/inquiries/${i.id}`} className="font-medium text-gold-200 hover:text-gold-100">
                      {i.client.name}
                    </Link>
                    {i.archived && (
                      <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream/40">
                        Archived
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-cream/60">{i.eventType}</td>
                  <td className="px-5 py-3 text-cream/60">{i.eventDate ? formatDate(i.eventDate) : "—"}</td>
                  <td className="px-5 py-3 text-cream/60">{i.budget || "—"}</td>
                  <td className="px-5 py-3 text-cream/60">{formatDate(i.createdAt)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <ActionMenu>
                      <MenuLink href={`/admin/inquiries/${i.id}`} label="View" />
                      <MenuFormButton
                        action={setInquiryArchived}
                        fields={{ id: i.id, archived: String(!i.archived) }}
                        label={i.archived ? "Restore" : "Archive"}
                      />
                      <DeleteRecordButton
                        action={deleteInquiry}
                        fields={{ id: i.id }}
                        title={`Delete inquiry from ${i.client.name}?`}
                        description="This action permanently deletes this inquiry and cannot be undone."
                        relatedItems={
                          i.quotes.length > 0
                            ? [`${i.quotes.length} related quote${i.quotes.length > 1 ? "s" : ""} (will be kept, just unlinked from this inquiry)`]
                            : undefined
                        }
                        menuItem
                        triggerLabel="Delete"
                      />
                    </ActionMenu>
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
