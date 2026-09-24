import Link from "next/link";
import { saveEvent } from "@/lib/actions/events";
import SubmitButton from "@/components/ui/SubmitButton";

export default function NewEventPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/events" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
          ← All Events
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-cream">New Event</h1>
      </div>

      {searchParams.error === "missing" && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Please enter a title and event date.
        </p>
      )}

      <form action={saveEvent} encType="multipart/form-data" className="max-w-2xl space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Title</label>
          <input name="title" required className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Description</label>
          <textarea name="description" rows={4} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Poster Image</label>
          <input type="file" name="poster" accept="image/*" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream file:mr-3 file:rounded-full file:border-0 file:bg-gold-500 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink-950" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="venueName" placeholder="Venue Name" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <input name="venueAddress" placeholder="Venue Address" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Event Date</label>
            <input type="date" name="eventDate" required className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Start Time</label>
            <input type="time" name="startTime" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">End Time</label>
            <input type="time" name="endTime" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Age Restriction</label>
            <input name="ageRestriction" defaultValue="All Ages" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Capacity</label>
            <input type="number" name="capacity" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">RSVP Deadline</label>
            <input type="date" name="rsvpDeadline" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
        </div>
        <SubmitButton pendingText="Creating...">Create Event</SubmitButton>
      </form>
    </div>
  );
}
