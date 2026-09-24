import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { uploadGalleryItems, createTag, setAlbumArchived, deleteAlbum } from "@/lib/actions/gallery";
import SubmitButton from "@/components/ui/SubmitButton";
import EmptyState from "@/components/ui/EmptyState";
import GalleryManager from "@/components/admin/GalleryManager";
import InlineTagChip from "@/components/admin/InlineTagChip";
import { archivedFilter } from "@/lib/archive";
import ActionMenu from "@/components/admin/ActionMenu";
import MenuLink from "@/components/admin/MenuLink";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";
import ArchiveViewTabs from "@/components/admin/ArchiveViewTabs";

export default async function GalleryAdminPage({
  searchParams,
}: {
  searchParams: { error?: string; view?: string };
}) {
  const view = searchParams.view;
  const [items, albums, tags] = await Promise.all([
    prisma.galleryItem.findMany({
      where: archivedFilter(view),
      include: { tags: true },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.galleryAlbum.findMany({ where: archivedFilter(view), orderBy: { sortOrder: "asc" } }),
    prisma.galleryTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">Gallery</h1>
          <p className="mt-1 text-sm text-cream/50">Photos, albums, and tags shown on the public site.</p>
        </div>
        <div className="flex items-center gap-3">
          <ArchiveViewTabs basePath="/admin/gallery" view={view} />
          <Link
            href="/admin/gallery/albums/new"
            className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-5 py-2 text-sm font-semibold text-ink-950 shadow-gold"
          >
            + New Album
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="font-display text-base font-semibold text-cream">Albums</h2>
          {albums.length === 0 ? (
            <p className="mt-3 text-sm text-cream/40">No albums yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {albums.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5 hover:bg-white/[0.06]"
                >
                  <Link href={`/admin/gallery/albums/${a.id}`} className="flex-1 text-sm text-cream">
                    {a.title}
                    {a.archived && (
                      <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream/40">
                        Archived
                      </span>
                    )}
                  </Link>
                  <span className={`mr-3 text-xs uppercase tracking-wider ${a.visible ? "text-emerald-300" : "text-cream/30"}`}>
                    {a.visible ? "Visible" : "Hidden"}
                  </span>
                  <ActionMenu>
                    <MenuLink href={`/admin/gallery/albums/${a.id}`} label="View / Edit" />
                    <MenuFormButton
                      action={setAlbumArchived}
                      fields={{ id: a.id, archived: String(!a.archived) }}
                      label={a.archived ? "Restore" : "Archive"}
                    />
                    <DeleteRecordButton
                      action={deleteAlbum}
                      fields={{ id: a.id }}
                      title={`Delete album ${a.title}?`}
                      description="This action permanently deletes this album and cannot be undone. Photos in it are kept, just unlinked from the album."
                      menuItem
                    />
                  </ActionMenu>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="font-display text-base font-semibold text-cream">Tags</h2>
          {searchParams.error === "tagname" && (
            <p className="mt-2 text-xs text-red-300">Please enter a tag name.</p>
          )}
          <form action={createTag} className="mt-3 flex gap-2">
            <input
              name="name"
              placeholder="New tag (e.g. Wedding)"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
            />
            <button className="rounded-full border border-gold-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold-200 hover:bg-gold-400/10">
              Add
            </button>
          </form>
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((t) => (
                <InlineTagChip key={t.id} id={t.id} name={t.name} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="font-display text-base font-semibold text-cream">Upload Photos</h2>
        <form action={uploadGalleryItems} encType="multipart/form-data" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
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
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Album</label>
            <select name="albumId" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none">
              <option value="" className="bg-ink-900">No album</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id} className="bg-ink-900">{a.title}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <SubmitButton pendingText="Uploading...">Upload</SubmitButton>
          </div>
          {tags.length > 0 && (
            <div className="lg:col-span-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Tags (applied to all uploaded)</label>
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
        </form>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No media yet" description="Upload your first photos above." />
      ) : (
        <GalleryManager
          items={items.map((i) => ({
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
          albums={albums.map((a) => ({ id: a.id, title: a.title }))}
          tags={tags.map((t) => ({ id: t.id, name: t.name }))}
        />
      )}
    </div>
  );
}
