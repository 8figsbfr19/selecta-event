import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EmptyState from "@/components/ui/EmptyState";
import { archiveTemplate, duplicateTemplate, deleteTemplate } from "@/lib/actions/contract-templates";
import { archivedFilter } from "@/lib/archive";
import ArchiveViewTabs from "@/components/admin/ArchiveViewTabs";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

export default async function TemplatesPage({ searchParams }: { searchParams: { view?: string } }) {
  const view = searchParams.view;
  const templates = await prisma.contractTemplate.findMany({
    where: archivedFilter(view),
    orderBy: [{ archived: "asc" }, { name: "asc" }],
    include: { _count: { select: { contracts: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/contracts" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
            ← Contracts
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-cream">Contract Templates</h1>
          <p className="mt-1 text-sm text-cream/50">Reusable agreements for different types of events.</p>
        </div>
        <div className="flex items-center gap-3">
          <ArchiveViewTabs basePath="/admin/contracts/templates" view={view} />
          <Link href="/admin/contracts/templates/new" className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-5 py-2 text-sm font-semibold text-ink-950 shadow-gold">
            + New Template
          </Link>
        </div>
      </div>

      {templates.length === 0 ? (
        <EmptyState title="No templates yet" description="Paste your existing contract wording into a new template to reuse it for every booking." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((t) => (
            <div key={t.id} className={`rounded-2xl border border-white/5 bg-white/[0.02] p-5 ${t.archived ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between">
                <Link href={`/admin/contracts/templates/${t.id}`} className="font-display text-base font-semibold text-gold-200 hover:text-gold-100">
                  {t.name}
                </Link>
                {t.archived && <span className="text-xs uppercase tracking-wider text-cream/40">Archived</span>}
              </div>
              <p className="mt-2 line-clamp-3 text-xs text-cream/40">{t.body}</p>
              <p className="mt-3 text-xs text-cream/30">{t._count.contracts} contract(s) created</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/admin/contracts/templates/${t.id}`} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-cream/70 hover:bg-white/5">
                  Edit
                </Link>
                <form action={duplicateTemplate}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-cream/70 hover:bg-white/5">
                    Duplicate
                  </button>
                </form>
                <form action={archiveTemplate}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="archived" value={(!t.archived).toString()} />
                  <button className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-cream/70 hover:bg-white/5">
                    {t.archived ? "Restore" : "Archive"}
                  </button>
                </form>
                <DeleteRecordButton
                  action={deleteTemplate}
                  fields={{ id: t.id }}
                  title={`Delete template "${t.name}"?`}
                  description="This action permanently deletes this template and cannot be undone."
                  relatedItems={t._count.contracts > 0 ? [`${t._count.contracts} contract(s) created from this template (will be kept, just unlinked)`] : undefined}
                  strong={t._count.contracts > 0}
                  confirmText={t._count.contracts > 0 ? "DELETE" : undefined}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
