import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime, toInputDate } from "@/lib/dates";
import StatusBadge from "@/components/ui/StatusBadge";
import { saveEvent, setEventStatus, setEventArchived, deleteEvent } from "@/lib/actions/events";
import { deleteRsvp } from "@/lib/actions/events";
import SubmitButton from "@/components/ui/SubmitButton";
import ConfirmSubmit from "@/components/ui/ConfirmSubmit";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { rsvps: { orderBy: { createdAt: "desc" } } },
  });
  if (!event) notFound();

  const totalGuests = event.rsvps.reduce((s, r) => s + r.guests, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/events" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
            ← All Events
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-cream">{event.title}</h1>
          <p className="text-sm text-cream/50">{formatDate(event.eventDate)}</p>
        </div>
        <div className="flex items-center gap-3">
          {event.archived && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-cream/40">
              Archived
            </span>
          )}
          <StatusBadge status={event.status} />
          <MenuFormButton
            action={setEventArchived}
            fields={{ id: event.id, archived: String(!event.archived) }}
            label={event.archived ? "Restore" : "Archive"}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-cream/70 hover:bg-white/5"
          />
          <DeleteRecordButton
            action={deleteEvent}
            fields={{ id: event.id }}
            title={`Delete event ${event.title}?`}
            description="This action permanently deletes this event and cannot be undone."
            relatedItems={
              event.rsvps.length > 0
                ? [`${totalGuests} RSVP guest${totalGuests !== 1 ? "s" : ""} across ${event.rsvps.length} RSVP${event.rsvps.length > 1 ? "s" : ""} (deleted)`]
                : undefined
            }
            strong={event.rsvps.length > 0}
            confirmText={event.rsvps.length > 0 ? "DELETE" : undefined}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        {event.status === "DRAFT" && <StatusButton eventId={event.id} status="PUBLISHED" label="Publish" primary />}
        {event.status === "PUBLISHED" && (
          <>
            <StatusButton eventId={event.id} status="DRAFT" label="Unpublish" />
            <StatusButton eventId={event.id} status="SOLD_OUT" label="Mark Sold Out" />
            <StatusButton eventId={event.id} status="COMPLETED" label="Mark Completed" />
            <StatusButton eventId={event.id} status="CANCELLED" label="Cancel Event" danger />
          </>
        )}
        {event.status === "SOLD_OUT" && (
          <>
            <StatusButton eventId={event.id} status="PUBLISHED" label="Reopen (Not Sold Out)" />
            <StatusButton eventId={event.id} status="COMPLETED" label="Mark Completed" />
            <StatusButton eventId={event.id} status="CANCELLED" label="Cancel Event" danger />
          </>
        )}
        {(event.status === "COMPLETED" || event.status === "CANCELLED") && (
          <StatusButton eventId={event.id} status="DRAFT" label="Reset to Draft" />
        )}
        {event.status !== "DRAFT" && (
          <Link href={`/events/${event.slug}`} target="_blank" className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream/70 hover:bg-white/5">
            View Public Page ↗
          </Link>
        )}
        <a href={`/api/admin/events/${event.id}/rsvps/export`} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream/70 hover:bg-white/5">
          Export Guest List CSV
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:col-span-2">
          <h2 className="font-display text-base font-semibold text-cream">Event Details</h2>
          <form action={saveEvent} encType="multipart/form-data" className="mt-4 space-y-4">
            <input type="hidden" name="id" value={event.id} />
            {event.posterUrl && (
              <div className="relative h-48 w-36 overflow-hidden rounded-xl">
                <Image src={event.posterUrl} alt={event.title} fill className="object-cover" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Title</label>
              <input name="title" defaultValue={event.title} required className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Description</label>
              <textarea name="description" defaultValue={event.description} rows={4} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Replace Poster</label>
              <input type="file" name="poster" accept="image/*" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream file:mr-3 file:rounded-full file:border-0 file:bg-gold-500 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink-950" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="venueName" defaultValue={event.venueName || ""} placeholder="Venue Name" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
              <input name="venueAddress" defaultValue={event.venueAddress || ""} placeholder="Venue Address" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Event Date</label>
                <input type="date" name="eventDate" defaultValue={toInputDate(event.eventDate)} required className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Start Time</label>
                <input type="time" name="startTime" defaultValue={event.startTime || ""} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">End Time</label>
                <input type="time" name="endTime" defaultValue={event.endTime || ""} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <input name="ageRestriction" defaultValue={event.ageRestriction} placeholder="Age Restriction" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
              <input type="number" name="capacity" defaultValue={event.capacity || ""} placeholder="Capacity" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
              <input type="date" name="rsvpDeadline" defaultValue={event.rsvpDeadline ? toInputDate(event.rsvpDeadline) : ""} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
            </div>
            <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
          </form>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="font-display text-base font-semibold text-cream">Guest List</h2>
          {event.capacity && (
            <p className="mt-1 text-sm text-gold-300">{totalGuests} / {event.capacity} RSVP</p>
          )}
          <div className="mt-4 max-h-[480px] space-y-2 overflow-y-auto">
            {event.rsvps.length === 0 ? (
              <p className="text-sm text-cream/40">No RSVPs yet.</p>
            ) : (
              event.rsvps.map((r) => (
                <div key={r.id} className="rounded-xl bg-white/[0.03] px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-cream">{r.name} {r.guests > 1 && <span className="text-cream/40">(+{r.guests - 1})</span>}</p>
                    <form action={deleteRsvp}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="eventId" value={event.id} />
                      <ConfirmSubmit message="Remove this RSVP?" className="text-xs text-red-300/70 hover:text-red-300">✕</ConfirmSubmit>
                    </form>
                  </div>
                  <p className="text-xs text-cream/40">{r.email} {r.phone && `· ${r.phone}`}</p>
                  <p className="text-[0.65rem] text-cream/30">{formatDateTime(r.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusButton({
  eventId,
  status,
  label,
  primary,
  danger,
}: {
  eventId: string;
  status: string;
  label: string;
  primary?: boolean;
  danger?: boolean;
}) {
  const classes = primary
    ? "bg-gradient-to-b from-gold-200 to-gold-600 text-ink-950 shadow-gold"
    : danger
    ? "border border-red-400/40 text-red-300 hover:bg-red-400/10"
    : "border border-white/15 text-cream/70 hover:bg-white/5";

  return (
    <form action={setEventStatus}>
      <input type="hidden" name="id" value={eventId} />
      <input type="hidden" name="status" value={status} />
      <button className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${classes}`}>
        {label}
      </button>
    </form>
  );
}
