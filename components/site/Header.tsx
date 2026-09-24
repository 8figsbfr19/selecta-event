"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

export default function Header({
  businessName,
  logoUrl,
  showEvents,
}: {
  businessName: string;
  logoUrl: string;
  showEvents: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
    ...(showEvents ? [{ href: "/events", label: "Events" }] : []),
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative block h-11 w-11 overflow-hidden rounded-full shadow-gold ring-1 ring-gold-400/40">
            <Image src={logoUrl} alt={businessName} fill className="object-cover" />
          </span>
          <span className="font-display text-lg font-semibold tracking-wide text-cream">
            {businessName}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                pathname === link.href
                  ? "text-gold-300"
                  : "text-cream/70 hover:text-gold-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/quote"
            className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-5 py-2 text-sm font-semibold text-ink-950 shadow-gold transition-transform hover:scale-105"
          >
            Get a Quote
          </Link>
        </nav>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/30 text-gold-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/5 bg-ink-950/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium uppercase tracking-wider ${
                  pathname === link.href ? "text-gold-300" : "text-cream/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/quote"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-5 py-2 text-center text-sm font-semibold text-ink-950"
            >
              Get a Quote
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
