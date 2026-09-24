"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { PhotoDTO, AlbumDTO } from "@/lib/gallery-compose";
import { getOrientation } from "@/lib/gallery-compose";
import { formatDate } from "@/lib/dates";

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function aspectStyle(width: number | null, height: number | null, fallback: string) {
  if (width && height) return { aspectRatio: `${width} / ${height}` };
  return {};
}

export function HeroPhoto({ item, onOpen }: { item: PhotoDTO; onOpen: () => void }) {
  return (
    <motion.button
      {...reveal}
      onClick={onOpen}
      className="group relative block h-[58vh] w-full overflow-hidden rounded-2xl sm:h-[78vh]"
    >
      <Image
        src={item.url}
        alt={item.caption || "Selecta Event"}
        fill
        sizes="100vw"
        priority
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      {item.caption && (
        <p className="absolute bottom-6 left-6 max-w-md text-left font-serif2 text-lg italic text-cream/90 sm:bottom-8 sm:left-8 sm:text-xl">
          {item.caption}
        </p>
      )}
    </motion.button>
  );
}

export function HeroAlbum({ album }: { album: AlbumDTO }) {
  return (
    <motion.div {...reveal} className="relative">
      <Link href={`/gallery/${album.slug}`} className="group relative block h-[58vh] w-full overflow-hidden rounded-2xl sm:h-[78vh]">
        {album.coverUrl ? (
          <Image
            src={album.coverUrl}
            alt={album.title}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-ink-900 text-cream/30">{album.title}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-8 left-6 right-6 sm:bottom-10 sm:left-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
            {album.eventDate ? formatDate(new Date(album.eventDate)) : "Featured Album"}
          </p>
          <h2 className="mt-2 max-w-xl font-display text-3xl font-semibold text-cream sm:text-5xl">{album.title}</h2>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-cream/80">
            View Album <span aria-hidden>→</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export function PairSection({ items, onOpen }: { items: PhotoDTO[]; onOpen: (item: PhotoDTO) => void }) {
  return (
    <motion.div {...reveal} className="grid grid-cols-2 gap-3 sm:gap-6">
      {items.map((item, i) => (
        <button
          key={item.id}
          onClick={() => onOpen(item)}
          className={`group relative overflow-hidden rounded-2xl ${i === 1 ? "sm:mt-12" : ""}`}
          style={aspectStyle(item.width, item.height, "1/1")}
        >
          <Image
            src={item.url}
            alt={item.caption || "Selecta Event"}
            fill
            sizes="45vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        </button>
      ))}
    </motion.div>
  );
}

export function FullSection({ item, onOpen }: { item: PhotoDTO; onOpen: () => void }) {
  return (
    <motion.button
      {...reveal}
      onClick={onOpen}
      className="group relative block h-[46vh] w-full overflow-hidden rounded-2xl sm:h-[64vh]"
    >
      <Image
        src={item.url}
        alt={item.caption || "Selecta Event"}
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
    </motion.button>
  );
}

export function PortraitSection({
  item,
  onOpen,
  align,
  label,
}: {
  item: PhotoDTO;
  onOpen: () => void;
  align: "left" | "right";
  label?: string;
}) {
  return (
    <motion.div {...reveal} className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center">
      {align === "left" ? (
        <>
          <button
            onClick={onOpen}
            className="group relative col-span-1 overflow-hidden rounded-2xl sm:col-span-5"
            style={aspectStyle(item.width, item.height, "3/4")}
          >
            <Image src={item.url} alt={item.caption || "Selecta Event"} fill sizes="40vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
          </button>
          <div className="hidden sm:col-span-7 sm:block" />
        </>
      ) : (
        <>
          <div className="hidden sm:col-span-7 sm:block" />
          <button
            onClick={onOpen}
            className="group relative col-span-1 overflow-hidden rounded-2xl sm:col-span-5"
            style={aspectStyle(item.width, item.height, "3/4")}
          >
            <Image src={item.url} alt={item.caption || "Selecta Event"} fill sizes="40vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
          </button>
        </>
      )}
      {label && (
        <p className="col-span-full font-serif2 text-lg italic text-cream/50 sm:hidden">{label}</p>
      )}
    </motion.div>
  );
}

export function AlbumFeatureSection({ album, align }: { album: AlbumDTO; align: "left" | "right" }) {
  const image = (
    <Link
      href={`/gallery/${album.slug}`}
      className="group relative col-span-1 block overflow-hidden rounded-2xl sm:col-span-7"
      style={aspectStyle(album.coverWidth, album.coverHeight, "4/3")}
    >
      {album.coverUrl ? (
        <Image src={album.coverUrl} alt={album.title} fill sizes="60vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      ) : (
        <div className="flex h-full items-center justify-center bg-ink-900 text-cream/30">{album.title}</div>
      )}
    </Link>
  );

  const text = (
    <div className="col-span-1 flex flex-col justify-center sm:col-span-5">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
        {album.eventDate ? formatDate(new Date(album.eventDate)) : "Album"}
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold text-cream sm:text-3xl">{album.title}</h3>
      {album.description && <p className="mt-3 text-sm text-cream/60">{album.description}</p>}
      <Link
        href={`/gallery/${album.slug}`}
        className="mt-5 inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-300 hover:text-gold-200"
      >
        View Album <span aria-hidden>→</span>
      </Link>
    </div>
  );

  return (
    <motion.div {...reveal} className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center sm:gap-10">
      {align === "left" ? (
        <>
          {image}
          {text}
        </>
      ) : (
        <>
          {text}
          {image}
        </>
      )}
    </motion.div>
  );
}

export { getOrientation };
