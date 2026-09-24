import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createAlbum } from "@/lib/actions/gallery";
import SubmitButton from "@/components/ui/SubmitButton";

export default async function NewAlbumPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const tags = await prisma.galleryTag.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/gallery" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
          ← Gallery
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-cream">New Album</h1>
      </div>

      {searchParams.error === "title" && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Please enter a title.
        </p>
      )}

      <form action={createAlbum} className="max-w-xl space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Title</label>
          <input name="title" required placeholder="e.g. Habesha Night Calgary" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Description</label>
          <textarea name="description" rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Event Date</label>
          <input type="date" name="eventDate" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
        </div>
        {tags.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Tags</label>
            <div className="flex flex-wrap gap-3">
              {tags.map((t) => (
                <label key={t.id} className="flex items-center gap-1.5 text-xs text-cream/60">
                  <input type="checkbox" name="tagIds" value={t.id} className="h-3.5 w-3.5 rounded border-white/20 bg-transparent text-gold-500 focus:ring-gold-400" />
                  {t.name}
                </label>
              ))}
            </div>
          </div>
        )}
        <label className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
          <span className="text-sm text-cream">Visible on public site</span>
          <input type="checkbox" name="visible" defaultChecked className="h-5 w-5 rounded border-white/20 bg-transparent text-gold-500 focus:ring-gold-400" />
        </label>
        <SubmitButton pendingText="Creating...">Create Album</SubmitButton>
      </form>
    </div>
  );
}
