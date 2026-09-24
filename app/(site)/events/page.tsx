import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/dates";
import EmptyState from "@/components/ui/EmptyState";

export default async function EventsPage() {
  const settings = await getSettings();
  if (!settings.showEvents) notFound();

  const events = await prisma.event.findMany({
    where: { status: { in: ["PUBLISHED", "SOLD_OUT", "COMPLETED"] }, archived: false },
    orderBy: { eventDate: "asc" },
    include: { rsvps: true },
  });

  const now = new Date();
  const upcoming = events.filter((e) => e.eventDate >= now && e.status !== "COMPLETED");
  const past = events.filter((e) => e.eventDate < now || e.status === "COMPLETED");

  return (
    <div className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">Events</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-cream sm:text-5xl">
            Upcoming Nights
          </h1>
        </div>

        {upcoming.length === 0 ? (
          <div className="mt-14">
            <EmptyState title="No upcoming events right now" description="Check back soon for the next date." />
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => {
              const totalGuests = e.rsvps.reduce((s, r) => s + r.guests, 0);
              return (
                <Link key={e.id} href={`/events/${e.slug}`} className="glass-card block overflow-hidden rounded-2xl">
                  <div className="relative aspect-[4/5]">
                    {e.posterUrl ? (
                      <Image src={e.posterUrl} alt={e.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-ink-900 p-4 text-center text-cream/30">
                        {e.title}
                      </div>
                    )}
                    {e.status === "SOLD_OUT" && (
                      <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                        Sold Out
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="font-display text-lg text-cream">{e.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-gold-300">{formatDate(e.eventDate)}</p>
                    {e.venueName && <p className="mt-1 text-xs text-cream/50">{e.venueName}</p>}
                    {e.capacity && (
                      <p className="mt-2 text-xs text-cream/40">
                        {totalGuests} / {e.capacity} RSVP
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {past.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-xl text-cream/50">Past Events</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {past.map((e) => (
                <div key={e.id} className="glass-card rounded-xl p-4 opacity-60">
                  <p className="font-display text-sm text-cream">{e.title}</p>
                  <p className="mt-1 text-xs text-cream/40">{formatDate(e.eventDate)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
