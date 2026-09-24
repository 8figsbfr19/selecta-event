"use client";

import { useMemo, useState } from "react";
import { composeSections, collectLightboxPhotos, type PhotoDTO, type AlbumDTO, type Block } from "@/lib/gallery-compose";
import { HeroPhoto, HeroAlbum, PairSection, FullSection, PortraitSection, AlbumFeatureSection } from "./Sections";
import Lightbox from "./Lightbox";

type Tag = { id: string; name: string; slug: string };

export default function GalleryExperience({
  albums,
  items,
  tags,
}: {
  albums: AlbumDTO[];
  items: PhotoDTO[];
  tags: Tag[];
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredAlbums = useMemo(
    () => (activeTag ? albums.filter((a) => a.tags.includes(activeTag)) : albums),
    [albums, activeTag]
  );
  const filteredItems = useMemo(
    () => (activeTag ? items.filter((i) => i.tags.includes(activeTag)) : items),
    [items, activeTag]
  );

  const sections = useMemo(() => {
    const blocks: Block[] = [
      ...filteredItems.map((item) => ({ kind: "photo" as const, item })),
      ...filteredAlbums.map((album) => ({ kind: "album" as const, album })),
    ];
    return composeSections(blocks);
  }, [filteredItems, filteredAlbums]);

  const lightboxPhotos = useMemo(() => collectLightboxPhotos(sections), [sections]);

  function openPhoto(photo: PhotoDTO) {
    const idx = lightboxPhotos.findIndex((p) => p.id === photo.id);
    if (idx !== -1) setLightboxIndex(idx);
  }

  let sideAlternator = 0;

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-[0.25em]">
          <button
            onClick={() => setActiveTag(null)}
            className={`border-b pb-1 transition-colors ${
              activeTag === null ? "border-gold-400 text-gold-300" : "border-transparent text-cream/50 hover:text-cream"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.slug)}
              className={`border-b pb-1 transition-colors ${
                activeTag === tag.slug ? "border-gold-400 text-gold-300" : "border-transparent text-cream/50 hover:text-cream"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-10 sm:space-y-16">
        {sections.map((section, idx) => {
          if (section.type === "hero-photo") {
            return <HeroPhoto key={idx} item={section.item} onOpen={() => openPhoto(section.item)} />;
          }
          if (section.type === "hero-album") {
            return <HeroAlbum key={idx} album={section.album} />;
          }
          if (section.type === "pair") {
            return <PairSection key={idx} items={section.items} onOpen={openPhoto} />;
          }
          if (section.type === "full") {
            return <FullSection key={idx} item={section.item} onOpen={() => openPhoto(section.item)} />;
          }
          if (section.type === "portrait") {
            const align = sideAlternator % 2 === 0 ? "left" : "right";
            sideAlternator++;
            return <PortraitSection key={idx} item={section.item} onOpen={() => openPhoto(section.item)} align={align} />;
          }
          if (section.type === "album-feature") {
            const align = sideAlternator % 2 === 0 ? "left" : "right";
            sideAlternator++;
            return <AlbumFeatureSection key={idx} album={section.album} align={align} />;
          }
          return null;
        })}
      </div>

      {sections.length === 0 && (
        <p className="py-20 text-center text-cream/40">No photos match that tag yet.</p>
      )}

      <Lightbox
        photos={lightboxPhotos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
