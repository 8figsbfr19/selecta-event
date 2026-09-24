import { getSettings } from "@/lib/settings";
import { submitContactMessage } from "@/lib/actions/public";
import SubmitButton from "@/components/ui/SubmitButton";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const settings = await getSettings();

  return (
    <div className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">Contact</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-cream sm:text-5xl">Get In Touch</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-cream/60 sm:text-base">
            Questions about availability, packages, or anything else — send a message directly.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-cream/60">
          {settings.phone && <span>{settings.phone}</span>}
          {settings.businessEmail && <span>{settings.businessEmail}</span>}
        </div>

        {searchParams.error === "missing" && (
          <p className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            Please fill in your name, email, and message.
          </p>
        )}

        <form action={submitContactMessage} className="glass-card mt-10 space-y-5 rounded-3xl p-6 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone" name="phone" type="tel" />
            <Field label="Subject" name="subject" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cream/60">
              Message <span className="text-gold-400">*</span>
            </label>
            <textarea
              name="message"
              rows={5}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
            />
          </div>
          <div className="text-center">
            <SubmitButton pendingText="Sending...">Send Message</SubmitButton>
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
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
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
      />
    </div>
  );
}
