import Link from "next/link";
import { saveTemplate } from "@/lib/actions/contract-templates";
import { AVAILABLE_VARIABLES } from "@/lib/contract-variables";
import SubmitButton from "@/components/ui/SubmitButton";

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/contracts/templates" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
          ← All Templates
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-cream">New Contract Template</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form action={saveTemplate} className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:col-span-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Template Name</label>
            <input name="name" required placeholder="e.g. Wedding DJ Agreement" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Contract Wording</label>
            <textarea name="body" rows={18} placeholder="Paste your contract wording here. Use {{Client Name}}, {{Event Date}}, etc. for automatic fields." className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 font-mono text-xs leading-relaxed text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          </div>
          <SubmitButton pendingText="Saving...">Save Template</SubmitButton>
        </form>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="font-display text-sm font-semibold text-cream">Available Variables</h2>
          <p className="mt-1 text-xs text-cream/40">Click to copy, or type manually into your wording.</p>
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
