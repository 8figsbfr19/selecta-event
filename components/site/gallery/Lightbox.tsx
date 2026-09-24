"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { PhotoDTO } from "@/lib/gallery-compose";

export default function Lightbox({
  photos,
  index,
  albumTitle,
  onClose,
  onNavigate,
}: {
  photos: PhotoDTO[];
  index: number | null;
  albumTitle?: string;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const open = index !== null;
  const current = index !== null ? photos[index] : null;

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index !== null && index < photos.length - 1) onNavigate(index + 1);
      if (e.key === "ArrowLeft" && index !== null && index > 0) onNavigate(index - 1);
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, index, photos.length, onClose, onNavigate]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || index === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0 && index < photos.length - 1) onNavigate(index + 1);
      if (delta > 0 && index > 0) onNavigate(index - 1);
    }
    touchStartX.current = null;
  }

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center justify-between px-5 py-4 text-cream/70 sm:px-8">
            <span className="text-xs uppercase tracking-[0.2em]">
              {albumTitle && <span className="mr-3 text-gold-300">{albumTitle}</span>}
              {index !== null && (
                <span>
                  {index + 1} / {photos.length}
                </span>
              )}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-lg hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-6 sm:px-16">
            {index !== null && index > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(index - 1);
                }}
                aria-label="Previous"
                className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-cream/80 hover:bg-white/10 sm:left-6"
              >
                ‹
              </button>
            )}

            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative flex max-h-full max-w-full items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-[70vh] w-[88vw] sm:w-[80vw]">
                <Image
                  src={current.url}
                  alt={current.caption || "Selecta Event"}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>

            {index !== null && index < photos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(index + 1);
                }}
                aria-label="Next"
                className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-cream/80 hover:bg-white/10 sm:right-6"
              >
                ›
              </button>
            )}
          </div>

          {current.caption && (
            <p className="pb-6 text-center text-sm text-cream/60" onClick={(e) => e.stopPropagation()}>
              {current.caption}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
