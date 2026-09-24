import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/dates";
import { submitRsvp } from "@/lib/actions/public";
import SubmitButton from "@/components/ui/SubmitButton";

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { rsvp?: string; error?: string };
}) {
  const settings = await getSettings();
  if (!settings.showEvents) notFound();

  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: { rsvps: true },
  });
  if (!event || event.status === "DRAFT" || event.archived) notFound();

  const totalGuests = event.rsvps.reduce((s, r) => s + r.guests, 0);
  const isSoldOut = event.status === "SOLD_OUT" || (event.capacity ? totalGuests >= event.capacity : false);
  const rsvpAction = submitRsvp.bind(null, event.id);

  return (
    <div className="px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
        <div className="glass-card relative aspect-[4/5] overflow-hidden rounded-3xl">
          {event.posterUrl ? (
            <Image src={event.posterUrl} alt={event.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-cream/30">
              {event.title}
            </div>
          )}
          {isSoldOut && (
            <span className="absolute right-4 top-4 rounded-full bg-red-500/90 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-white">
              Sold Out
            </span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
            {formatDate(event.eventDate)}
            {event.startTime ? ` · ${event.startTime}` : ""}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">{event.title}</h1>

          <div className="mt-4 space-y-1 text-sm text-cream/60">
            {event.venueName && <p>{event.venueName}</p>}
            {event.venueAddress && <p>{event.venueAddress}</p>}
            <p>Age Restriction: {event.ageRestriction}</p>
          </div>

          {event.description && (
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-cream/70">{event.description}</p>
          )}

          {event.capacity && (
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-gold-300">
              {totalGuests} / {event.capacity} RSVP
            </p>
          )}

          <div className="glass-card mt-8 rounded-2xl p-6">
            {isSoldOut ? (
              <div className="text-center">
                <p className="font-display text-xl text-red-300">SOLD OUT</p>
                <p className="mt-2 text-sm text-cream/50">
                  This event has reached capacity. Follow our socials for the next date.
                </p>
              </div>
            ) : searchParams.rsvp === "success" ? (
              <div className="text-center">
                <p className="font-display text-xl text-gold-200">You&apos;re on the list!</p>
                <p className="mt-2 text-sm text-cream/60">We&apos;ll see you there.</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-lg text-cream">RSVP</h2>
                {searchParams.error === "missing" && (
                  <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    Please fill in your name and email.
                  </p>
                )}
                {searchParams.error === "soldout" && (
                  <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    Sorry, that would exceed remaining capacity.
                  </p>
                )}
                <form action={rsvpAction} className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      name="name"
                      placeholder="Full Name"
                      required
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      required
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone"
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
                    />
                    <input
                      name="guests"
                      type="number"
                      min={1}
                      defaultValue={1}
                      placeholder="Number of Guests"
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
                    />
                  </div>
                  <SubmitButton pendingText="Submitting..." className="w-full rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink-950 shadow-gold">
                    RSVP Now
                  </SubmitButton>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
