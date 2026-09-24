import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export default async function AboutPage() {
  const settings = await getSettings();
  const gallery = await prisma.galleryItem.findMany({
    where: { visible: true, archived: false },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    take: 4,
  });

  const socials = [
    { url: settings.instagramUrl, label: "Instagram" },
    { url: settings.tiktokUrl, label: "TikTok" },
    { url: settings.facebookUrl, label: "Facebook" },
  ].filter((s) => s.url);

  return (
    <div className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">About</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-cream sm:text-5xl">
            {settings.djName}
          </h1>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="glass-card relative aspect-[4/5] overflow-hidden rounded-3xl">
            {gallery[0] ? (
              <Image src={gallery[0].url} alt={settings.djName} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-cream/30">Photo coming soon</div>
            )}
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-cream/75 sm:text-base">
            <p className="whitespace-pre-line">{settings.bio}</p>

            {socials.length > 0 && (
              <div className="flex gap-5 pt-2 text-xs font-semibold uppercase tracking-widest text-gold-300">
                {socials.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-gold-200">
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <AboutCard title="Nightclub Experience" text="Peak-time sets and headline slots at clubs and lounges, built for a floor that expects the best." />
          <AboutCard title="Wedding Experience" text="Ceremony to last dance — reading the room across every generation in attendance." />
          <AboutCard title="Cultural Events" text="A deep catalogue spanning cultural celebrations, holidays, and community traditions." />
        </div>

        {gallery.length > 1 && (
          <div className="mt-20 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.slice(1, 4).map((g) => (
              <div key={g.id} className="glass-card relative aspect-square overflow-hidden rounded-xl">
                <Image src={g.url} alt={g.caption || settings.djName} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AboutCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-display text-base font-semibold text-gold-200">{title}</h3>
      <p className="mt-2 text-sm text-cream/60">{text}</p>
    </div>
  );
}
