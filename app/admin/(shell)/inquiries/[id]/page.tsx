import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/dates";
import StatusBadge from "@/components/ui/StatusBadge";
import { INQUIRY_STATUSES, label } from "@/lib/constants";
import { updateInquiryStatusForm, setInquiryArchived, deleteInquiry } from "@/lib/actions/inquiries";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

export default async function InquiryDetailPage({ params }: { params: { id: string } }) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: params.id },
    include: { client: true, quotes: true },
  });
  if (!inquiry) notFound();

  let services: string[] = [];
  try {
    services = JSON.parse(inquiry.servicesNeeded);
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/inquiries" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
            ← All Inquiries
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-cream">{inquiry.client.name}</h1>
          <p className="text-sm text-cream/50">Submitted {formatDateTime(inquiry.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          {inquiry.archived && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-cream/40">
              Archived
            </span>
          )}
          <StatusBadge status={inquiry.status} />
          <Link
            href={`/admin/quotes/new?inquiryId=${inquiry.id}&clientId=${inquiry.clientId}`}
            className="rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-5 py-2 text-sm font-semibold text-ink-950 shadow-gold"
          >
            Create Quote
          </Link>
          <MenuFormButton
            action={setInquiryArchived}
            fields={{ id: inquiry.id, archived: String(!inquiry.archived) }}
            label={inquiry.archived ? "Restore" : "Archive"}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-cream/70 hover:bg-white/5"
          />
          <DeleteRecordButton
            action={deleteInquiry}
            fields={{ id: inquiry.id }}
            title={`Delete inquiry from ${inquiry.client.name}?`}
            description="This action permanently deletes this inquiry and cannot be undone."
            relatedItems={
              inquiry.quotes.length > 0
                ? [`${inquiry.quotes.length} related quote${inquiry.quotes.length > 1 ? "s" : ""} (will be kept, just unlinked from this inquiry)`]
                : undefined
            }
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:col-span-2">
          <h2 className="font-display text-base font-semibold text-cream">Event Details</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail label="Event Type" value={inquiry.eventType} />
            <Detail label="Event Date" value={inquiry.eventDate ? formatDate(inquiry.eventDate) : "—"} />
            <Detail label="Start Time" value={inquiry.startTime || "—"} />
            <Detail label="End Time" value={inquiry.endTime || "—"} />
            <Detail label="Venue Name" value={inquiry.venueName || "—"} />
            <Detail label="Venue Address" value={inquiry.venueAddress || "—"} />
            <Detail label="Guest Count" value={inquiry.guestCount ? String(inquiry.guestCount) : "—"} />
            <Detail label="Budget" value={inquiry.budget || "—"} />
            <Detail label="Music Preferences" value={inquiry.musicPrefs || "—"} />
          </dl>

          {services.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-cream/40">Services Needed</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {services.map((s) => (
                  <span key={s} className="rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs text-gold-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {inquiry.notes && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-cream/40">Additional Notes</p>
              <p className="mt-2 whitespace-pre-line text-sm text-cream/70">{inquiry.notes}</p>
            </div>
          )}

          {inquiry.quotes.length > 0 && (
            <div className="mt-6 border-t border-white/5 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-cream/40">Related Quotes</p>
              <div className="mt-2 space-y-2">
                {inquiry.quotes.map((q) => (
                  <Link key={q.id} href={`/admin/quotes/${q.id}`} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5 hover:bg-white/[0.06]">
                    <span className="text-sm text-cream">{q.number}</span>
                    <StatusBadge status={q.status} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="font-display text-base font-semibold text-cream">Contact</h2>
            <dl className="mt-4 space-y-3">
              <Detail label="Email" value={inquiry.client.email || "—"} />
              <Detail label="Phone" value={inquiry.client.phone || "—"} />
            </dl>
            <Link href={`/admin/clients/${inquiry.clientId}`} className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-gold-300 hover:text-gold-200">
              View Client Profile →
            </Link>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="font-display text-base font-semibold text-cream">Update Status</h2>
            <form action={updateInquiryStatusForm} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={inquiry.id} />
              <select
                name="status"
                defaultValue={inquiry.status}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
              >
                {INQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-ink-900">
                    {label(s)}
                  </option>
                ))}
              </select>
              <button type="submit" className="w-full rounded-full border border-gold-400/40 px-4 py-2 text-sm font-semibold text-gold-200 hover:bg-gold-400/10">
                Update Status
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-cream/40">{label}</dt>
      <dd className="mt-0.5 text-sm text-cream/80">{value}</dd>
    </div>
  );
}
