export type Orientation = "portrait" | "landscape" | "square";

export type PhotoDTO = {
  id: string;
  url: string;
  caption: string;
  width: number | null;
  height: number | null;
  featured: boolean;
  tags: string[]; // tag slugs
};

export type AlbumDTO = {
  id: string;
  slug: string;
  title: string;
  description: string;
  eventDate: string | null;
  coverUrl: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  itemCount: number;
  tags: string[]; // tag slugs
};

export type Block = { kind: "photo"; item: PhotoDTO } | { kind: "album"; album: AlbumDTO };

export function getOrientation(width?: number | null, height?: number | null): Orientation {
  if (!width || !height) return "landscape";
  const ratio = width / height;
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.87) return "portrait";
  return "square";
}

export type Section =
  | { type: "hero-photo"; item: PhotoDTO }
  | { type: "hero-album"; album: AlbumDTO }
  | { type: "pair"; items: PhotoDTO[] }
  | { type: "full"; item: PhotoDTO }
  | { type: "portrait"; item: PhotoDTO }
  | { type: "album-feature"; album: AlbumDTO };

/**
 * Walks the available photos/albums and composes them into a repeating
 * editorial rhythm (hero -> pair -> full-width -> portrait w/ whitespace ->
 * album feature -> ...), gracefully skipping steps it can't fulfill rather
 * than forcing a uniform grid.
 */
export function composeSections(blocks: Block[]): Section[] {
  const photoQueue: PhotoDTO[] = blocks.filter((b): b is { kind: "photo"; item: PhotoDTO } => b.kind === "photo").map((b) => b.item);
  const albumQueue: AlbumDTO[] = blocks.filter((b): b is { kind: "album"; album: AlbumDTO } => b.kind === "album").map((b) => b.album);

  const sections: Section[] = [];
  let step = 0;
  let usedFirstHero = false;

  function takePortrait(): PhotoDTO | null {
    const idx = photoQueue.findIndex((p) => getOrientation(p.width, p.height) === "portrait");
    if (idx === -1) return null;
    return photoQueue.splice(idx, 1)[0];
  }

  while (photoQueue.length > 0 || albumQueue.length > 0) {
    const cycle = step % 6;

    if (!usedFirstHero && (photoQueue.length > 0 || albumQueue.length > 0)) {
      // Open with the strongest asset available: a featured photo, else the first album, else the first photo.
      const featuredIdx = photoQueue.findIndex((p) => p.featured);
      if (featuredIdx !== -1) {
        sections.push({ type: "hero-photo", item: photoQueue.splice(featuredIdx, 1)[0] });
      } else if (albumQueue.length > 0) {
        sections.push({ type: "hero-album", album: albumQueue.shift()! });
      } else if (photoQueue.length > 0) {
        sections.push({ type: "hero-photo", item: photoQueue.shift()! });
      }
      usedFirstHero = true;
      step++;
      continue;
    }

    if (cycle === 0) {
      const pair = photoQueue.splice(0, 2);
      if (pair.length > 0) sections.push({ type: "pair", items: pair });
    } else if (cycle === 1) {
      const item = photoQueue.shift();
      if (item) sections.push({ type: "full", item });
    } else if (cycle === 2) {
      const portrait = takePortrait();
      if (portrait) sections.push({ type: "portrait", item: portrait });
    } else if (cycle === 3) {
      const album = albumQueue.shift();
      if (album) sections.push({ type: "album-feature", album });
      else {
        const item = photoQueue.shift();
        if (item) sections.push({ type: "full", item });
      }
    } else if (cycle === 4) {
      const pair = photoQueue.splice(0, 2);
      if (pair.length > 0) sections.push({ type: "pair", items: pair });
    } else {
      const item = photoQueue.shift();
      if (item) sections.push({ type: "full", item });
    }

    step++;

    // Safety valve: if a cycle produced nothing and both queues are empty, stop.
    if (photoQueue.length === 0 && albumQueue.length === 0) break;
  }

  return sections;
}

/** Flattens sections back into the ordered list of photos that should be lightboxable (albums excluded - they link out instead). */
export function collectLightboxPhotos(sections: Section[]): PhotoDTO[] {
  const photos: PhotoDTO[] = [];
  for (const s of sections) {
    if (s.type === "hero-photo") photos.push(s.item);
    else if (s.type === "pair") photos.push(...s.items);
    else if (s.type === "full") photos.push(s.item);
    else if (s.type === "portrait") photos.push(s.item);
  }
  return photos;
}
