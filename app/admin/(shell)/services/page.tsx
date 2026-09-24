import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { saveService, toggleServiceVisibility, deleteService, setServiceArchived } from "@/lib/actions/services";
import { formatMoney } from "@/lib/money";
import SubmitButton from "@/components/ui/SubmitButton";
import { archivedFilter } from "@/lib/archive";
import ArchiveViewTabs from "@/components/admin/ArchiveViewTabs";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

export default async function ServicesAdminPage({ searchParams }: { searchParams: { view?: string } }) {
  const view = searchParams.view;
  const services = await prisma.service.findMany({ where: archivedFilter(view), orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">Services</h1>
          <p className="mt-1 text-sm text-cream/50">What&apos;s offered on the public Services page.</p>
        </div>
        <ArchiveViewTabs basePath="/admin/services" view={view} />
      </div>

      <details className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <summary className="cursor-pointer font-display text-base font-semibold text-cream">+ New Service</summary>
        <form action={saveService} encType="multipart/form-data" className="mt-4 grid gap-4 sm:grid-cols-2">
          <input name="name" placeholder="Service Name" required className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <input name="startingPrice" type="number" step="0.01" placeholder="Starting Price ($, optional)" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <textarea name="description" placeholder="Description" rows={3} className="sm:col-span-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <input type="file" name="image" accept="image/*" className="sm:col-span-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream file:mr-3 file:rounded-full file:border-0 file:bg-gold-500 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink-950" />
          <div className="sm:col-span-2">
            <SubmitButton pendingText="Saving...">Add Service</SubmitButton>
          </div>
        </form>
      </details>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="flex gap-4 p-5">
              {s.imageUrl && (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={s.imageUrl} alt={s.name} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-display text-base font-semibold text-cream">{s.name}</p>
                  <span className={`text-[0.6rem] font-bold uppercase tracking-wider ${s.visible ? "text-emerald-300" : "text-cream/30"}`}>
                    {s.visible ? "Visible" : "Hidden"}
                  </span>
                </div>
                {s.archived && (
                  <span className="mt-1 inline-block rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream/40">
                    Archived
                  </span>
                )}
                <p className="mt-1 line-clamp-2 text-xs text-cream/50">{s.description}</p>
                {s.startingPriceCents ? (
                  <p className="mt-1 text-xs text-gold-300">From {formatMoney(s.startingPriceCents)}</p>
                ) : null}
              </div>
            </div>
            <div className="flex gap-2 border-t border-white/5 p-3">
              <form action={toggleServiceVisibility}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="visible" value={(!s.visible).toString()} />
                <button className="rounded-full border border-white/15 px-3 py-1 text-xs text-cream/60 hover:bg-white/5">
                  {s.visible ? "Hide" : "Show"}
                </button>
              </form>
              <MenuFormButton
                action={setServiceArchived}
                fields={{ id: s.id, archived: String(!s.archived) }}
                label={s.archived ? "Restore" : "Archive"}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-cream/60 hover:bg-white/5"
              />
              <DeleteRecordButton
                action={deleteService}
                fields={{ id: s.id }}
                title={`Delete service "${s.name}"?`}
                description="This action permanently deletes this service and cannot be undone."
                className="rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
              />
            </div>
            <details className="border-t border-white/5 p-3">
              <summary className="cursor-pointer text-xs text-gold-300/80 hover:text-gold-200">Edit</summary>
              <form action={saveService} encType="multipart/form-data" className="mt-3 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={s.id} />
                <input name="name" defaultValue={s.name} required className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
                <input name="startingPrice" type="number" step="0.01" defaultValue={s.startingPriceCents ? (s.startingPriceCents / 100).toFixed(2) : ""} placeholder="Starting Price ($)" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
                <textarea name="description" defaultValue={s.description} rows={3} className="sm:col-span-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
                <input type="file" name="image" accept="image/*" className="sm:col-span-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream file:mr-3 file:rounded-full file:border-0 file:bg-gold-500 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink-950" />
                <div className="sm:col-span-2">
                  <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
                </div>
              </form>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
