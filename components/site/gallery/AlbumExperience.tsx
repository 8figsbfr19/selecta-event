"use client";

import { useMemo, useState } from "react";
import { composeSections, collectLightboxPhotos, type PhotoDTO, type Block } from "@/lib/gallery-compose";
import { HeroPhoto, PairSection, FullSection, PortraitSection } from "./Sections";
import Lightbox from "./Lightbox";

export default function AlbumExperience({ items, albumTitle }: { items: PhotoDTO[]; albumTitle: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sections = useMemo(() => {
    const blocks: Block[] = items.map((item) => ({ kind: "photo" as const, item }));
    return composeSections(blocks);
  }, [items]);

  const lightboxPhotos = useMemo(() => collectLightboxPhotos(sections), [sections]);

  function openPhoto(photo: PhotoDTO) {
    const idx = lightboxPhotos.findIndex((p) => p.id === photo.id);
    if (idx !== -1) setLightboxIndex(idx);
  }

  let sideAlternator = 0;

  return (
    <div>
      <div className="space-y-10 sm:space-y-16">
        {sections.map((section, idx) => {
          if (section.type === "hero-photo") {
            return <HeroPhoto key={idx} item={section.item} onOpen={() => openPhoto(section.item)} />;
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
          return null;
        })}
      </div>

      {sections.length === 0 && <p className="py-20 text-center text-cream/40">No photos in this album yet.</p>}

      <Lightbox
        photos={lightboxPhotos}
        index={lightboxIndex}
        albumTitle={albumTitle}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
