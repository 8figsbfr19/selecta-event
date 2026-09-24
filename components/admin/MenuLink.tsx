import Link from "next/link";

export default function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block px-4 py-2 text-sm text-cream/70 hover:bg-white/5">
      {label}
    </Link>
  );
}
