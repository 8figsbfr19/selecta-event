"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/quotes", label: "Quotes" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/contracts", label: "Contracts" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/receipts", label: "Receipts" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/rsvps", label: "RSVPs" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/settings", label: "Settings" },
];

export default function Sidebar({ businessName, logoUrl }: { businessName: string; logoUrl: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/5 bg-ink-950 px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="relative block h-8 w-8 overflow-hidden rounded-full ring-1 ring-gold-400/40">
            <Image src={logoUrl} alt={businessName} fill className="object-cover" />
          </span>
          <span className="font-display text-sm font-semibold text-cream">{businessName} Admin</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-cream/70"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      <aside
        className={`w-64 shrink-0 border-r border-white/5 bg-ink-950 lg:block ${open ? "block" : "hidden"}`}
      >
        <div className="hidden items-center gap-3 border-b border-white/5 px-5 py-5 lg:flex">
          <span className="relative block h-10 w-10 overflow-hidden rounded-full ring-1 ring-gold-400/40">
            <Image src={logoUrl} alt={businessName} fill className="object-cover" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-cream">{businessName}</p>
            <p className="text-[0.65rem] uppercase tracking-widest text-gold-300/70">Admin</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? "bg-gold-400/10 text-gold-300"
                  : "text-cream/60 hover:bg-white/5 hover:text-cream"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/5 p-3">
          <Link href="/" target="_blank" className="block rounded-lg px-3 py-2 text-xs text-cream/40 hover:text-cream/70">
            View Public Site ↗
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-red-300/80 hover:bg-red-500/10 hover:text-red-300">
              Log Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
