import Link from "next/link";

export default function Footer({
  businessName,
  phone,
  businessEmail,
  instagramUrl,
  tiktokUrl,
  facebookUrl,
}: {
  businessName: string;
  phone: string;
  businessEmail: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
}) {
  const socials = [
    { url: instagramUrl, label: "Instagram" },
    { url: tiktokUrl, label: "TikTok" },
    { url: facebookUrl, label: "Facebook" },
  ].filter((s) => s.url);

  return (
    <footer className="relative z-10 border-t border-white/5 bg-ink-950/80 px-5 py-14 text-center">
      <div className="mx-auto max-w-3xl">
        <p className="font-display text-lg font-bold tracking-[0.3em] text-cream">
          {businessName.toUpperCase()}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-cream/60">
          {phone && <a href={`tel:${phone}`} className="hover:text-gold-300">{phone}</a>}
          {businessEmail && (
            <a href={`mailto:${businessEmail}`} className="hover:text-gold-300">
              {businessEmail}
            </a>
          )}
        </div>
        {socials.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-5 text-xs uppercase tracking-widest text-gold-300/80">
            {socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-gold-200">
                {s.label}
              </a>
            ))}
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-cream/40">
          <Link href="/" className="hover:text-cream/70">Home</Link>
          <Link href="/quote" className="hover:text-cream/70">Get a Quote</Link>
          <Link href="/contact" className="hover:text-cream/70">Contact</Link>
        </div>
        <p className="mt-6 text-[0.65rem] uppercase tracking-[0.2em] text-cream/30">
          © {new Date().getFullYear()} {businessName}. Crafted for the culture.
        </p>
      </div>
    </footer>
  );
}
