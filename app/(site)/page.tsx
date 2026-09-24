import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";

export default async function HomePage() {
  const settings = await getSettings();

  const [services, gallery, testimonials, upcomingEvents] = await Promise.all([
    prisma.service.findMany({ where: { visible: true, archived: false }, orderBy: { sortOrder: "asc" }, take: 4 }),
    prisma.galleryItem.findMany({ where: { visible: true, archived: false }, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }], take: 8 }),
    prisma.testimonial.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    settings.showEvents
      ? prisma.event.findMany({
          where: { status: { in: ["PUBLISHED", "SOLD_OUT"] }, eventDate: { gte: new Date() }, archived: false },
          orderBy: { eventDate: "asc" },
          take: 3,
        })
      : Promise.resolve([]),
  ]);

  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-5 pb-20 pt-28 text-center sm:px-8">
        <div className="relative mb-6 h-28 w-28 sm:h-36 sm:w-36">
          <div
            className="absolute -inset-6 rounded-full opacity-70 blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(246,221,138,0.45) 0%, rgba(246,221,138,0) 70%)" }}
          />
          <Image
            src={settings.logoUrl}
            alt={settings.businessName}
            fill
            className="relative rounded-full object-cover shadow-gold ring-1 ring-gold-400/40"
          />
        </div>

        <p className="mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-gold-300">
          <span className="h-px w-8 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
          DJ · Nightlife · Weddings · Events
          <span className="h-px w-8 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        </p>

        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-cream sm:text-6xl">
          {settings.heroHeading}
        </h1>
        <p className="mt-3 font-serif2 text-xl italic text-gold-200 sm:text-2xl">
          {settings.heroSubheading}
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-sm text-cream/70 sm:text-base">
          {settings.heroDescription}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/quote"
            className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-ink-950 shadow-gold transition-transform hover:scale-105"
          >
            Get a Quote
          </Link>
          <Link
            href="/quote"
            className="rounded-full border border-gold-400/40 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-gold-200 transition-colors hover:bg-gold-400/10"
          >
            Book Now
          </Link>
          {settings.showEvents && (
            <Link
              href="/events"
              className="rounded-full border border-white/15 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-cream/80 transition-colors hover:bg-white/5"
            >
              Upcoming Events
            </Link>
          )}
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="What We Do" title="Services Built For Every Room" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div key={s.id} className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold text-cream">{s.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-cream/60">{s.description}</p>
                {s.startingPriceCents ? (
                  <p className="mt-3 text-xs uppercase tracking-wider text-gold-300">
                    From {formatMoney(s.startingPriceCents)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/services" className="text-sm font-semibold uppercase tracking-wider text-gold-300 hover:text-gold-200">
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* DJ INTRO */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="glass-card relative aspect-square overflow-hidden rounded-3xl">
            {gallery[0] ? (
              <Image src={gallery[0].url} alt="Selecta Event" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-cream/30">Photo coming soon</div>
            )}
          </div>
          <div>
            <SectionHeading eyebrow="Meet The DJ" title={settings.djName} align="left" />
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-cream/70 sm:text-base">
              {settings.bio}
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block text-sm font-semibold uppercase tracking-wider text-gold-300 hover:text-gold-200"
            >
              Full Story →
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      {gallery.length > 0 && (
        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="The Experience" title="Moments From The Floor" />
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.slice(0, 8).map((g) => (
                <div key={g.id} className="glass-card relative aspect-square overflow-hidden rounded-xl">
                  <Image src={g.url} alt={g.caption || "Selecta Event"} fill className="object-cover transition-transform hover:scale-110" />
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/gallery" className="text-sm font-semibold uppercase tracking-wider text-gold-300 hover:text-gold-200">
                View Full Gallery →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* UPCOMING EVENTS */}
      {settings.showEvents && upcomingEvents.length > 0 && (
        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Don't Miss Out" title="Upcoming Events" />
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {upcomingEvents.map((e) => (
                <Link key={e.id} href={`/events/${e.slug}`} className="glass-card block overflow-hidden rounded-2xl">
                  <div className="relative aspect-[4/5]">
                    {e.posterUrl ? (
                      <Image src={e.posterUrl} alt={e.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-ink-900 text-cream/30">
                        {e.title}
                      </div>
                    )}
                    {e.status === "SOLD_OUT" && (
                      <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                        Sold Out
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-display text-lg text-cream">{e.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-gold-300">{formatDate(e.eventDate)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <SectionHeading eyebrow="Kind Words" title="What Clients Say" />
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.id} className="glass-card rounded-2xl p-6 text-left">
                  <p className="font-serif2 text-lg italic text-cream/90">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gold-300">
                    {t.name}
                    {t.eventType ? ` · ${t.eventType}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="px-5 py-24 sm:px-8">
        <div className="glass-card mx-auto max-w-4xl rounded-3xl px-8 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">
            Ready to book <span className="gold-shimmer">{settings.businessName}</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-cream/60 sm:text-base">
            Tell us about your event and get a custom quote within days.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/quote"
              className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-ink-950 shadow-gold transition-transform hover:scale-105"
            >
              Get a Quote
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/15 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-cream/80 hover:bg-white/5"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">{title}</h2>
    </div>
  );
}
