"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  bulkAssignAlbum,
  bulkAssignTag,
  bulkSetVisible,
  bulkSetArchived,
  bulkDelete,
  updateGalleryItem,
  toggleFeatured,
  toggleVisible,
  setAlbumCover,
  moveItem,
  deleteGalleryItem,
  setGalleryItemArchived,
} from "@/lib/actions/gallery";
import DeleteRecordButton from "./DeleteRecordButton";
import ConfirmModal from "./ConfirmModal";

type Tag = { id: string; name: string };
type Album = { id: string; title: string };
type Item = {
  id: string;
  url: string;
  type: string;
  caption: string;
  featured: boolean;
  visible: boolean;
  isAlbumCover: boolean;
  albumId: string | null;
  archived: boolean;
  tags: { id: string; name: string }[];
};

export default function GalleryManager({ items, albums, tags }: { items: Item[]; albums: Album[]; tags: Tag[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [bulkAlbum, setBulkAlbum] = useState("");
  const [bulkTag, setBulkTag] = useState("");
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulk(fn: (fd: FormData) => Promise<void>, extra?: Record<string, string>) {
    const fd = new FormData();
    selected.forEach((id) => fd.append("itemIds", id));
    if (extra) Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
    startTransition(async () => {
      await fn(fd);
      setSelected(new Set());
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="sticky top-2 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gold-400/30 bg-ink-950/95 p-4 shadow-gold backdrop-blur">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-300">
            {selected.size} selected
          </span>
          <select
            value={bulkAlbum}
            onChange={(e) => setBulkAlbum(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-cream focus:border-gold-400/50 focus:outline-none"
          >
            <option value="" className="bg-ink-900">Add to album...</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id} className="bg-ink-900">{a.title}</option>
            ))}
          </select>
          <button
            disabled={!bulkAlbum || isPending}
            onClick={() => runBulk(bulkAssignAlbum, { albumId: bulkAlbum })}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-cream/70 hover:bg-white/5 disabled:opacity-40"
          >
            Apply
          </button>

          <select
            value={bulkTag}
            onChange={(e) => setBulkTag(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-cream focus:border-gold-400/50 focus:outline-none"
          >
            <option value="" className="bg-ink-900">Assign tag...</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id} className="bg-ink-900">{t.name}</option>
            ))}
          </select>
          <button
            disabled={!bulkTag || isPending}
            onClick={() => runBulk(bulkAssignTag, { tagId: bulkTag })}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-cream/70 hover:bg-white/5 disabled:opacity-40"
          >
            Apply
          </button>

          <button
            disabled={isPending}
            onClick={() => runBulk(bulkSetVisible, { visible: "true" })}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-cream/70 hover:bg-white/5"
          >
            Show
          </button>
          <button
            disabled={isPending}
            onClick={() => runBulk(bulkSetVisible, { visible: "false" })}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-cream/70 hover:bg-white/5"
          >
            Hide
          </button>
          <button
            disabled={isPending}
            onClick={() => runBulk(bulkSetArchived, { archived: "true" })}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-cream/70 hover:bg-white/5"
          >
            Archive
          </button>
          <button
            disabled={isPending}
            onClick={() => setBulkDeleteOpen(true)}
            className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
          >
            Delete
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-cream/40 hover:text-cream/70"
          >
            Clear selection
          </button>
        </div>
      )}

      <ConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() =>
          new Promise<void>((resolve) => {
            const fd = new FormData();
            selected.forEach((id) => fd.append("itemIds", id));
            startTransition(async () => {
              await bulkDelete(fd);
              setSelected(new Set());
              setBulkDeleteOpen(false);
              resolve();
            });
          })
        }
        title={`Delete ${selected.size} selected item${selected.size > 1 ? "s" : ""}?`}
        description="This action permanently deletes these gallery items and cannot be undone."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="relative aspect-square">
              <label className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/60 backdrop-blur">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                  className="h-4 w-4 rounded border-white/30 bg-transparent text-gold-500 focus:ring-gold-400"
                />
              </label>
              {item.type === "VIDEO" ? (
                <video src={item.url} className="h-full w-full object-cover" />
              ) : (
                <Image src={item.url} alt={item.caption || ""} fill className="object-cover" />
              )}
              <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
                {item.featured && (
                  <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-ink-950">
                    Featured
                  </span>
                )}
                {item.isAlbumCover && (
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-ink-950">
                    Cover
                  </span>
                )}
                {!item.visible && (
                  <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                    Hidden
                  </span>
                )}
                {item.archived && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                    Archived
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 p-3">
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((t) => (
                    <span key={t.id} className="rounded-full bg-white/5 px-2 py-0.5 text-[0.6rem] text-cream/50">
                      {t.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                <form action={toggleFeatured}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="featured" value={(!item.featured).toString()} />
                  <button className="rounded-full border border-white/15 px-2 py-1 text-[0.62rem] text-cream/60 hover:bg-white/5">
                    {item.featured ? "Unfeature" : "Feature"}
                  </button>
                </form>
                <form action={toggleVisible}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="visible" value={(!item.visible).toString()} />
                  <button className="rounded-full border border-white/15 px-2 py-1 text-[0.62rem] text-cream/60 hover:bg-white/5">
                    {item.visible ? "Hide" : "Show"}
                  </button>
                </form>
                {item.albumId && !item.isAlbumCover && (
                  <form action={setAlbumCover}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button className="rounded-full border border-white/15 px-2 py-1 text-[0.62rem] text-cream/60 hover:bg-white/5">
                      Set Cover
                    </button>
                  </form>
                )}
                <form action={moveItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button className="rounded-full border border-white/15 px-2 py-1 text-[0.62rem] text-cream/60 hover:bg-white/5">↑</button>
                </form>
                <form action={moveItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button className="rounded-full border border-white/15 px-2 py-1 text-[0.62rem] text-cream/60 hover:bg-white/5">↓</button>
                </form>
                <form action={setGalleryItemArchived}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="archived" value={(!item.archived).toString()} />
                  <button className="rounded-full border border-white/15 px-2 py-1 text-[0.62rem] text-cream/60 hover:bg-white/5">
                    {item.archived ? "Restore" : "Archive"}
                  </button>
                </form>
                <DeleteRecordButton
                  action={deleteGalleryItem}
                  fields={{ id: item.id }}
                  title="Delete this photo?"
                  description="This action permanently deletes this gallery item and cannot be undone."
                  className="rounded-full border border-red-400/30 px-2 py-1 text-[0.62rem] text-red-300 hover:bg-red-500/10"
                />
              </div>

              <details>
                <summary className="cursor-pointer text-[0.65rem] uppercase tracking-wider text-gold-300/80 hover:text-gold-200">
                  Edit
                </summary>
                <form action={updateGalleryItem} className="mt-2 space-y-2">
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    name="caption"
                    defaultValue={item.caption}
                    placeholder="Caption"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
                  />
                  <select
                    name="albumId"
                    defaultValue={item.albumId || ""}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-cream focus:border-gold-400/50 focus:outline-none"
                  >
                    <option value="" className="bg-ink-900">No album</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id} className="bg-ink-900">{a.title}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <label key={t.id} className="flex items-center gap-1 text-[0.65rem] text-cream/60">
                        <input
                          type="checkbox"
                          name="tagIds"
                          value={t.id}
                          defaultChecked={item.tags.some((it) => it.id === t.id)}
                          className="h-3 w-3 rounded border-white/20 bg-transparent text-gold-500 focus:ring-gold-400"
                        />
                        {t.name}
                      </label>
                    ))}
                  </div>
                  <button className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-3 py-1 text-[0.65rem] font-semibold text-ink-950">
                    Save
                  </button>
                </form>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
