import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { getSettings } from "@/lib/settings";
import { archivedFilter } from "@/lib/archive";
import { setEventArchived, deleteEvent } from "@/lib/actions/events";
import ActionMenu from "@/components/admin/ActionMenu";
import MenuLink from "@/components/admin/MenuLink";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";
import ArchiveViewTabs from "@/components/admin/ArchiveViewTabs";

export default async function AdminEventsPage({ searchParams }: { searchParams: { view?: string } }) {
  const view = searchParams.view;
  const [events, settings] = await Promise.all([
    prisma.event.findMany({ where: archivedFilter(view), include: { rsvps: true }, orderBy: { eventDate: "desc" } }),
    getSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">Events</h1>
          <p className="mt-1 text-sm text-cream/50">
            Public events page is currently{" "}
            <span className={settings.showEvents ? "text-emerald-300" : "text-red-300"}>
              {settings.showEvents ? "ON" : "OFF"}
            </span>
            . Toggle it in{" "}
            <Link href="/admin/settings" className="text-gold-300 hover:text-gold-200">
              Settings
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ArchiveViewTabs basePath="/admin/events" view={view} />
          <Link href="/admin/events/new" className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-5 py-2 text-sm font-semibold text-ink-950 shadow-gold">
            + New Event
          </Link>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState title="No events yet" description="Create your first event and publish it when ready." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => {
            const totalGuests = e.rsvps.reduce((s, r) => s + r.guests, 0);
            const hasRsvps = e.rsvps.length > 0;
            return (
              <div key={e.id} className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04]">
                <Link href={`/admin/events/${e.id}`} className="absolute inset-0 z-0" aria-label={e.title} />
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <p className="font-display text-base font-semibold text-cream">{e.title}</p>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={e.status} />
                    <div className="relative z-20">
                      <ActionMenu>
                        <MenuLink href={`/admin/events/${e.id}`} label="View / Edit" />
                        <MenuFormButton
                          action={setEventArchived}
                          fields={{ id: e.id, archived: String(!e.archived) }}
                          label={e.archived ? "Restore" : "Archive"}
                        />
                        <DeleteRecordButton
                          action={deleteEvent}
                          fields={{ id: e.id }}
                          title={`Delete event ${e.title}?`}
                          description="This action permanently deletes this event and cannot be undone."
                          relatedItems={hasRsvps ? [`${totalGuests} RSVP guest${totalGuests !== 1 ? "s" : ""} across ${e.rsvps.length} RSVP${e.rsvps.length > 1 ? "s" : ""} (deleted)`] : undefined}
                          strong={hasRsvps}
                          confirmText={hasRsvps ? "DELETE" : undefined}
                          menuItem
                        />
                      </ActionMenu>
                    </div>
                  </div>
                </div>
                <p className="relative z-10 mt-1 text-xs text-cream/50">{formatDate(e.eventDate)}</p>
                {e.archived && (
                  <span className="relative z-10 mt-2 inline-block rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream/40">
                    Archived
                  </span>
                )}
                {e.capacity && (
                  <p className="relative z-10 mt-3 text-xs uppercase tracking-wider text-gold-300">
                    {totalGuests} / {e.capacity} RSVP
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
