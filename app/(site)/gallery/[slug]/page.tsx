import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";
import AlbumExperience from "@/components/site/gallery/AlbumExperience";
import type { PhotoDTO } from "@/lib/gallery-compose";

export default async function AlbumPage({ params }: { params: { slug: string } }) {
  const album = await prisma.galleryAlbum.findUnique({
    where: { slug: params.slug },
    include: {
      tags: true,
      items: {
        where: { visible: true, archived: false },
        orderBy: [{ isAlbumCover: "desc" }, { sortOrder: "asc" }],
        include: { tags: true },
      },
    },
  });

  if (!album || !album.visible || album.archived) notFound();

  const items: PhotoDTO[] = album.items.map((i) => ({
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
        <Link href="/gallery" className="text-xs font-semibold uppercase tracking-wider text-gold-300 hover:text-gold-200">
          ← All Gallery
        </Link>

        <div className="mb-16 mt-6 text-center">
          {album.eventDate && (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
              {formatDate(album.eventDate)}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl font-semibold text-cream sm:text-5xl">{album.title}</h1>
          {album.description && (
            <p className="mx-auto mt-4 max-w-2xl text-sm text-cream/60 sm:text-base">{album.description}</p>
          )}
          {album.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-widest text-cream/40">
              {album.tags.map((t) => (
                <span key={t.id}>{t.name}</span>
              ))}
            </div>
          )}
        </div>

        <AlbumExperience items={items} albumTitle={album.title} />
      </div>
    </div>
  );
}
