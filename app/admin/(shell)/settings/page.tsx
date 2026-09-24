import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { updateSettings } from "@/lib/actions/settings";
import { changePasswordAction } from "@/lib/actions/auth";
import { saveEmailTemplate, resetEmailTemplate } from "@/lib/actions/email-templates";
import { getAllEmailTemplates } from "@/lib/email-templates";
import { EMAIL_TEMPLATE_LABELS } from "@/lib/constants";
import { REMINDER_VARIABLES } from "@/lib/reminder-variables";
import SubmitButton from "@/components/ui/SubmitButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string; pwerror?: string; pwsuccess?: string; error?: string; templatesaved?: string; templatereset?: string };
}) {
  const [settings, templates] = await Promise.all([getSettings(), getAllEmailTemplates()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-cream">Settings</h1>
        <p className="mt-1 text-sm text-cream/50">Business info, branding, and how the public site behaves.</p>
      </div>

      {searchParams.saved && (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Settings saved.
        </p>
      )}

      <form action={updateSettings} encType="multipart/form-data" className="max-w-3xl space-y-8">
        <section className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="font-display text-base font-semibold text-cream">Branding</h2>
          <div className="flex items-center gap-4">
            <span className="relative block h-16 w-16 overflow-hidden rounded-full ring-1 ring-gold-400/40">
              <Image src={settings.logoUrl} alt={settings.businessName} fill className="object-cover" />
            </span>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Replace Logo</label>
              <input type="file" name="logo" accept="image/*" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream file:mr-3 file:rounded-full file:border-0 file:bg-gold-500 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink-950" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business Name" name="businessName" defaultValue={settings.businessName} />
            <Field label="DJ Name" name="djName" defaultValue={settings.djName} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="font-display text-base font-semibold text-cream">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" name="phone" defaultValue={settings.phone} />
            <Field label="Business Email" name="businessEmail" defaultValue={settings.businessEmail} type="email" />
          </div>
          <Field label="Address" name="address" defaultValue={settings.address} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Instagram URL" name="instagramUrl" defaultValue={settings.instagramUrl} />
            <Field label="TikTok URL" name="tiktokUrl" defaultValue={settings.tiktokUrl} />
            <Field label="Facebook URL" name="facebookUrl" defaultValue={settings.facebookUrl} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="font-display text-base font-semibold text-cream">Homepage Content</h2>
          <Field label="Hero Heading" name="heroHeading" defaultValue={settings.heroHeading} />
          <Field label="Hero Subheading" name="heroSubheading" defaultValue={settings.heroSubheading} />
          <TextArea label="Hero Description" name="heroDescription" defaultValue={settings.heroDescription} />
          <TextArea label="Bio (About Page)" name="bio" defaultValue={settings.bio} rows={6} />
        </section>

        <section className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="font-display text-base font-semibold text-cream">Business Rules</h2>
          <label className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
            <div>
              <p className="text-sm text-cream">Show Events Page</p>
              <p className="text-xs text-cream/40">Adds &quot;Events&quot; to the public navigation and enables the public events/RSVP pages.</p>
            </div>
            <input type="checkbox" name="showEvents" defaultChecked={settings.showEvents} className="h-5 w-5 rounded border-white/20 bg-transparent text-gold-500 focus:ring-gold-400" />
          </label>
          <label className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
            <div>
              <p className="text-sm text-cream">Require Signed Contract Before Booking Confirmation</p>
              <p className="text-xs text-cream/40">When on, confirming a booking without a signed contract shows a warning first.</p>
            </div>
            <input type="checkbox" name="requireSignedContract" defaultChecked={settings.requireSignedContract} className="h-5 w-5 rounded border-white/20 bg-transparent text-gold-500 focus:ring-gold-400" />
          </label>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="font-display text-base font-semibold text-cream">Email Sending</h2>
          <p className="text-xs text-cream/40">
            All application email is sent through Resend. These control how it looks to the client —
            the sending domain itself is configured at the server level.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sender Name" name="senderName" defaultValue={settings.senderName} />
            <Field label="Reply-To Email" name="replyToEmail" defaultValue={settings.replyToEmail} type="email" />
          </div>
        </section>

        <SubmitButton pendingText="Saving...">Save Settings</SubmitButton>
      </form>

      <section id="security" className="scroll-mt-6 space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div>
          <h2 className="font-display text-base font-semibold text-cream">Security — Change Password</h2>
          <p className="mt-1 text-xs text-cream/40">
            Change the password used to sign in to this admin. This is the only account — there are no
            customer logins.
          </p>
        </div>

        {searchParams.pwsuccess && (
          <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Password changed successfully. Use your new password next time you sign in.
          </p>
        )}
        {searchParams.pwerror === "current" && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Your current password is incorrect.
          </p>
        )}
        {searchParams.pwerror === "length" && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            New password must be at least 8 characters.
          </p>
        )}
        {searchParams.pwerror === "mismatch" && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            New password and confirmation do not match.
          </p>
        )}

        <form action={changePasswordAction} className="max-w-md space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Current Password</label>
            <input type="password" name="currentPassword" required autoComplete="current-password" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">New Password</label>
            <input type="password" name="newPassword" required minLength={8} autoComplete="new-password" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Confirm New Password</label>
            <input type="password" name="confirmPassword" required minLength={8} autoComplete="new-password" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          </div>
          <SubmitButton pendingText="Updating...">Change Password</SubmitButton>
        </form>
      </section>

      <section id="email-templates" className="scroll-mt-6 space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div>
          <h2 className="font-display text-base font-semibold text-cream">Email Templates</h2>
          <p className="mt-1 text-xs text-cream/40">
            Edit the wording used for reminder emails. Dynamic fields fill in automatically when sent.
          </p>
        </div>

        {searchParams.templatesaved && (
          <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Template saved.
          </p>
        )}
        {searchParams.templatereset && (
          <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Template reset to default wording.
          </p>
        )}
        {searchParams.error === "template" && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Please enter a subject for the template.
          </p>
        )}

        <div className="space-y-3">
          {templates.map((t) => (
            <details key={t.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <summary className="cursor-pointer font-display text-sm font-semibold text-gold-200">
                {EMAIL_TEMPLATE_LABELS[t.key as keyof typeof EMAIL_TEMPLATE_LABELS] || t.key}
              </summary>
              <form action={saveEmailTemplate} className="mt-4 space-y-3">
                <input type="hidden" name="key" value={t.key} />
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Subject</label>
                  <input name="subject" defaultValue={t.subject} required className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Message</label>
                  <textarea name="body" defaultValue={t.body} rows={6} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 font-mono text-xs leading-relaxed text-cream focus:border-gold-400/50 focus:outline-none" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <SubmitButton pendingText="Saving...">Save Template</SubmitButton>
                  <DeleteRecordButton
                    action={resetEmailTemplate}
                    fields={{ key: t.key }}
                    title={`Reset "${EMAIL_TEMPLATE_LABELS[t.key as keyof typeof EMAIL_TEMPLATE_LABELS] || t.key}" to default?`}
                    description="This replaces your custom subject and message with the built-in default wording. This cannot be undone."
                    triggerLabel="Reset to Default"
                    confirmLabel="Reset to Default"
                    danger={false}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream/60 hover:bg-white/5"
                  />
                </div>
              </form>
            </details>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-cream/40">Available Fields</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {REMINDER_VARIABLES.map((v) => (
              <code key={v} className="rounded-md bg-white/5 px-2 py-1 text-[0.7rem] text-gold-200">
                {`{{${v}}}`}
              </code>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">{label}</label>
      <textarea name={name} rows={rows} defaultValue={defaultValue} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
    </div>
  );
}
