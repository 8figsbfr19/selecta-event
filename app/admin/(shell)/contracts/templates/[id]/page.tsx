import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveTemplate, archiveTemplate, deleteTemplate } from "@/lib/actions/contract-templates";
import { AVAILABLE_VARIABLES } from "@/lib/contract-variables";
import SubmitButton from "@/components/ui/SubmitButton";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
  const template = await prisma.contractTemplate.findUnique({
    where: { id: params.id },
    include: { _count: { select: { contracts: true } } },
  });
  if (!template) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/contracts/templates" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
            ← All Templates
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-cream">Edit Template</h1>
        </div>
        <div className="flex items-center gap-3">
          {template.archived && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-cream/40">
              Archived
            </span>
          )}
          <MenuFormButton
            action={archiveTemplate}
            fields={{ id: template.id, archived: String(!template.archived) }}
            label={template.archived ? "Restore" : "Archive"}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-cream/70 hover:bg-white/5"
          />
          <DeleteRecordButton
            action={deleteTemplate}
            fields={{ id: template.id }}
            title={`Delete template "${template.name}"?`}
            description="This action permanently deletes this template and cannot be undone."
            relatedItems={template._count.contracts > 0 ? [`${template._count.contracts} contract(s) created from this template (will be kept, just unlinked)`] : undefined}
            strong={template._count.contracts > 0}
            confirmText={template._count.contracts > 0 ? "DELETE" : undefined}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form action={saveTemplate} className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:col-span-2">
          <input type="hidden" name="id" value={template.id} />
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Template Name</label>
            <input name="name" required defaultValue={template.name} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Contract Wording</label>
            <textarea name="body" rows={18} defaultValue={template.body} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 font-mono text-xs leading-relaxed text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <p className="text-xs text-cream/40">
            Changes here only affect new contracts created from this template — existing contracts are never modified.
          </p>
          <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
        </form>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="font-display text-sm font-semibold text-cream">Available Variables</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {AVAILABLE_VARIABLES.map((v) => (
              <code key={v} className="rounded-md bg-white/5 px-2 py-1 text-[0.7rem] text-gold-200">
                {`{{${v}}}`}
              </code>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
