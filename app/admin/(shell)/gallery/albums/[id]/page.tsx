import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateAlbum, deleteAlbum, uploadGalleryItems, setAlbumArchived } from "@/lib/actions/gallery";
import { toInputDate } from "@/lib/dates";
import SubmitButton from "@/components/ui/SubmitButton";
import GalleryManager from "@/components/admin/GalleryManager";
import EmptyState from "@/components/ui/EmptyState";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

export default async function EditAlbumPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { saved?: string; error?: string };
}) {
  const [album, allAlbums, allTags] = await Promise.all([
    prisma.galleryAlbum.findUnique({
      where: { id: params.id },
      include: {
        tags: true,
        items: { include: { tags: true }, orderBy: [{ isAlbumCover: "desc" }, { sortOrder: "asc" }] },
      },
    }),
    prisma.galleryAlbum.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.galleryTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!album) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/gallery" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
            ← Gallery
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-cream">{album.title}</h1>
          <p className="text-sm text-cream/50">/gallery/{album.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          {album.archived && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-cream/40">
              Archived
            </span>
          )}
          <MenuFormButton
            action={setAlbumArchived}
            fields={{ id: album.id, archived: String(!album.archived) }}
            label={album.archived ? "Restore" : "Archive"}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-cream/70 hover:bg-white/5"
          />
          <DeleteRecordButton
            action={deleteAlbum}
            fields={{ id: album.id }}
            title={`Delete album ${album.title}?`}
            description="This action permanently deletes this album and cannot be undone. Photos in it are kept, just unlinked from the album."
            triggerLabel="Delete Album"
          />
        </div>
      </div>

      {searchParams.saved && (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Album saved.
        </p>
      )}
      {searchParams.error === "title" && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Please enter a title.
        </p>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="font-display text-base font-semibold text-cream">Album Details</h2>
        <form action={updateAlbum} className="mt-4 max-w-xl space-y-4">
          <input type="hidden" name="id" value={album.id} />
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Title</label>
            <input name="title" defaultValue={album.title} required className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Description</label>
            <textarea name="description" defaultValue={album.description} rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Event Date</label>
              <input type="date" name="eventDate" defaultValue={toInputDate(album.eventDate)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Display Order</label>
              <input type="number" name="sortOrder" defaultValue={album.sortOrder} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
            </div>
          </div>
          {allTags.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Tags</label>
              <div className="flex flex-wrap gap-3">
                {allTags.map((t) => (
                  <label key={t.id} className="flex items-center gap-1.5 text-xs text-cream/60">
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={t.id}
                      defaultChecked={album.tags.some((at) => at.id === t.id)}
                      className="h-3.5 w-3.5 rounded border-white/20 bg-transparent text-gold-500 focus:ring-gold-400"
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <label className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
            <span className="text-sm text-cream">Visible on public site</span>
            <input type="checkbox" name="visible" defaultChecked={album.visible} className="h-5 w-5 rounded border-white/20 bg-transparent text-gold-500 focus:ring-gold-400" />
          </label>
          <SubmitButton pendingText="Saving...">Save Album</SubmitButton>
        </form>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="font-display text-base font-semibold text-cream">Add Photos To This Album</h2>
        <form action={uploadGalleryItems} encType="multipart/form-data" className="mt-4 flex flex-wrap items-end gap-4">
          <input type="hidden" name="albumId" value={album.id} />
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Files</label>
            <input
              type="file"
              name="files"
              accept="image/*"
              multiple
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream file:mr-3 file:rounded-full file:border-0 file:bg-gold-500 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink-950"
            />
          </div>
          <SubmitButton pendingText="Uploading...">Upload</SubmitButton>
        </form>
      </div>

      {album.items.length === 0 ? (
        <EmptyState title="No photos in this album yet" description="Upload some above, or reassign existing gallery photos to this album." />
      ) : (
        <GalleryManager
          items={album.items.map((i) => ({
            id: i.id,
            url: i.url,
            type: i.type,
            caption: i.caption,
            featured: i.featured,
            visible: i.visible,
            isAlbumCover: i.isAlbumCover,
            albumId: i.albumId,
            archived: i.archived,
            tags: i.tags.map((t) => ({ id: t.id, name: t.name })),
          }))}
          albums={allAlbums.map((a) => ({ id: a.id, title: a.title }))}
          tags={allTags.map((t) => ({ id: t.id, name: t.name }))}
        />
      )}
    </div>
  );
}
