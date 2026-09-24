import { prisma } from "@/lib/prisma";
import { submitQuoteRequest } from "@/lib/actions/public";
import { EVENT_TYPE_OPTIONS } from "@/lib/constants";
import SubmitButton from "@/components/ui/SubmitButton";

export default async function QuotePage({
  searchParams,
}: {
  searchParams: { error?: string; service?: string };
}) {
  const services = await prisma.service.findMany({ where: { visible: true, archived: false }, orderBy: { sortOrder: "asc" } });

  return (
    <div className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">Get A Quote</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-cream sm:text-5xl">
            Let&apos;s Plan Your Event
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-cream/60 sm:text-base">
            Tell us about your event and we&apos;ll follow up with a custom quote.
          </p>
        </div>

        {searchParams.error === "missing" && (
          <p className="mt-8 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            Please fill in your name, email, phone, and event type.
          </p>
        )}

        <form action={submitQuoteRequest} className="glass-card mt-10 space-y-6 rounded-3xl p-6 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone" name="phone" type="tel" required />
            <SelectField label="Event Type" name="eventType" options={EVENT_TYPE_OPTIONS} required defaultValue={searchParams.service ? "" : undefined} />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Event Date" name="eventDate" type="date" />
            <Field label="Start Time" name="startTime" type="time" />
            <Field label="End Time" name="endTime" type="time" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Venue Name" name="venueName" />
            <Field label="Estimated Guest Count" name="guestCount" type="number" />
          </div>

          <Field label="Venue Address" name="venueAddress" />

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cream/60">
              Services Needed
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm text-cream/70">
                  <input
                    type="checkbox"
                    name="services"
                    value={s.name}
                    defaultChecked={searchParams.service === s.name}
                    className="h-4 w-4 rounded border-white/20 bg-transparent text-gold-500 focus:ring-gold-400"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Budget" name="budget" placeholder="e.g. $1,500 - $2,000" />
            <Field label="Music Preferences" name="musicPrefs" placeholder="e.g. Amapiano, Hip-Hop, Habesha" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cream/60">
              Additional Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
            />
          </div>

          <div className="text-center">
            <SubmitButton pendingText="Submitting...">Submit Request</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cream/60">
        {label} {required && <span className="text-gold-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cream/60">
        {label} {required && <span className="text-gold-400">*</span>}
      </label>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
      >
        <option value="" className="bg-ink-900">Select...</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-ink-900">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
