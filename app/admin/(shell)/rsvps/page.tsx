import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/dates";
import EmptyState from "@/components/ui/EmptyState";

export default async function RsvpsOverviewPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();

  const rsvps = await prisma.rsvp.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { event: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const events = await prisma.event.findMany({
    include: { _count: { select: { rsvps: true } } },
    orderBy: { eventDate: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">RSVPs</h1>
          <p className="mt-1 text-sm text-cream/50">Search guests across every event, or open an event for its full list.</p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search guests..."
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
          />
        </form>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="font-display text-base font-semibold text-cream">By Event</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {events.map((e) => (
            <Link key={e.id} href={`/admin/events/${e.id}`} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-cream/60 hover:bg-white/5">
              {e.title} · {e._count.rsvps}
            </Link>
          ))}
        </div>
      </div>

      {rsvps.length === 0 ? (
        <EmptyState title="No RSVPs found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-cream/40">
              <tr>
                <th className="px-5 py-3">Guest</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Guests</th>
                <th className="px-5 py-3">RSVP Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rsvps.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-3">
                    <p className="text-cream">{r.name}</p>
                    <p className="text-xs text-cream/40">{r.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/events/${r.eventId}`} className="text-gold-200 hover:text-gold-100">
                      {r.event.title}
                    </Link>
                    <p className="text-xs text-cream/40">{formatDate(r.event.eventDate)}</p>
                  </td>
                  <td className="px-5 py-3 text-cream/60">{r.guests}</td>
                  <td className="px-5 py-3 text-cream/60">{formatDateTime(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
