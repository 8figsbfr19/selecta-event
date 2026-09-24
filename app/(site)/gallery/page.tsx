import { prisma } from "@/lib/prisma";
import GalleryExperience from "@/components/site/gallery/GalleryExperience";
import type { PhotoDTO, AlbumDTO } from "@/lib/gallery-compose";

export default async function GalleryPage() {
  const [albums, standaloneItems, tags] = await Promise.all([
    prisma.galleryAlbum.findMany({
      where: { visible: true, archived: false },
      include: {
        tags: true,
        items: {
          where: { visible: true, archived: false },
          orderBy: [{ isAlbumCover: "desc" }, { sortOrder: "asc" }],
          take: 1,
        },
        _count: { select: { items: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.galleryItem.findMany({
      where: { visible: true, archived: false, albumId: null },
      include: { tags: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.galleryTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const albumDTOs: AlbumDTO[] = albums.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    description: a.description,
    eventDate: a.eventDate ? a.eventDate.toISOString() : null,
    coverUrl: a.items[0]?.url ?? null,
    coverWidth: a.items[0]?.width ?? null,
    coverHeight: a.items[0]?.height ?? null,
    itemCount: a._count.items,
    tags: a.tags.map((t) => t.slug),
  }));

  const itemDTOs: PhotoDTO[] = standaloneItems.map((i) => ({
    id: i.id,
    url: i.url,
    caption: i.caption,
    width: i.width,
    height: i.height,
    featured: i.featured,
    tags: i.tags.map((t) => t.slug),
  }));

  return (
    <div className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">Gallery</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-cream sm:text-5xl">
            The Nights In Frame
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-cream/60 sm:text-base">
            A curated look at weddings, nightlife, and celebrations behind the decks.
          </p>
        </div>

        {albumDTOs.length === 0 && itemDTOs.length === 0 ? (
          <p className="py-20 text-center text-cream/40">Gallery coming soon.</p>
        ) : (
          <GalleryExperience
            albums={albumDTOs}
            items={itemDTOs}
            tags={tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug }))}
          />
        )}
      </div>
    </div>
  );
}
