"use client";

import { useEffect, useRef } from "react";

function flowerSVG(size: number) {
  const petalColorA = "#f6dd8a";
  const petalColorB = "#e6c15c";
  const centerColor = "#b8892f";
  let petals = "";
  const petalCount = 6;
  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i;
    petals += `<ellipse cx="0" cy="-9" rx="4.2" ry="9" transform="rotate(${angle})" fill="url(#petalGrad)" />`;
  }
  return `<svg width="${size}" height="${size}" viewBox="-16 -16 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${petalColorA}" />
      <stop offset="100%" stop-color="${petalColorB}" />
    </linearGradient></defs>
    <g>${petals}</g>
    <circle cx="0" cy="0" r="3.4" fill="${centerColor}" />
  </svg>`;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function FlowerField({ count = 14 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = ref.current;
    if (!field || field.childElementCount > 0) return;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const wrap = document.createElement("div");
      wrap.className = "flower";

      const size = randomBetween(14, 28);
      const left = randomBetween(2, 96);
      const duration = randomBetween(16, 30);
      const delay = randomBetween(-30, 5);
      const drift = randomBetween(-60, 60);
      const opacity = randomBetween(0.3, 0.75);
      const scale = randomBetween(0.8, 1.3);

      wrap.style.left = `${left}%`;
      wrap.style.animationDuration = `${duration}s`;
      wrap.style.animationDelay = `${delay}s`;
      wrap.style.setProperty("--drift", `${drift}px`);
      wrap.style.setProperty("--o", String(opacity));
      wrap.style.setProperty("--s", String(scale));
      wrap.innerHTML = flowerSVG(size);

      fragment.appendChild(wrap);
    }

    field.appendChild(fragment);
  }, [count]);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
