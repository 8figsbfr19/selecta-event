import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/dates";
import StatusBadge from "@/components/ui/StatusBadge";
import SubmitButton from "@/components/ui/SubmitButton";
import { updateClient, setClientArchived, deleteClient } from "@/lib/actions/clients";
import { sendCustomEmail } from "@/lib/actions/emails";
import MenuFormButton from "@/components/admin/MenuFormButton";
import DeleteRecordButton from "@/components/admin/DeleteRecordButton";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { emailed?: string };
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      inquiries: { orderBy: { createdAt: "desc" } },
      quotes: { orderBy: { createdAt: "desc" } },
      bookings: { orderBy: { eventDate: "desc" } },
      contracts: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { date: "desc" } },
      receipts: { orderBy: { createdAt: "desc" } },
      emails: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!client) notFound();

  const related: string[] = [];
  if (client.inquiries.length > 0) related.push(`${client.inquiries.length} inquir${client.inquiries.length > 1 ? "ies" : "y"} (deleted)`);
  if (client.quotes.length > 0) related.push(`${client.quotes.length} quote${client.quotes.length > 1 ? "s" : ""} (deleted)`);
  if (client.bookings.length > 0) related.push(`${client.bookings.length} booking${client.bookings.length > 1 ? "s" : ""} (deleted)`);
  if (client.contracts.length > 0) {
    const signedCount = client.contracts.filter((c) => c.status === "SIGNED").length;
    related.push(`${client.contracts.length} contract${client.contracts.length > 1 ? "s" : ""}${signedCount > 0 ? ` (including ${signedCount} signed)` : ""} (deleted)`);
  }
  if (client.payments.length > 0) related.push(`${client.payments.length} payment${client.payments.length > 1 ? "s" : ""} (deleted)`);
  if (client.receipts.length > 0) related.push(`${client.receipts.length} receipt${client.receipts.length > 1 ? "s" : ""} (deleted)`);
  if (client.emails.length > 0) related.push(`${client.emails.length} email${client.emails.length > 1 ? "s" : ""} (kept, unlinked from this client)`);
  const hasHistory = related.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/clients" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
            ← All Clients
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-cream">{client.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          {client.archived && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-cream/40">
              Archived
            </span>
          )}
          <MenuFormButton
            action={setClientArchived}
            fields={{ id: client.id, archived: String(!client.archived) }}
            label={client.archived ? "Restore" : "Archive"}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-cream/70 hover:bg-white/5"
          />
          <DeleteRecordButton
            action={deleteClient}
            fields={{ id: client.id }}
            title={`Delete client ${client.name}?`}
            description={
              hasHistory
                ? "This client has related business history. Deleting the client permanently deletes their inquiries, quotes, bookings, contracts, payments, and receipts. Emails are kept but unlinked. This cannot be undone."
                : "This action permanently deletes this client and cannot be undone."
            }
            relatedItems={hasHistory ? related : undefined}
            strong={hasHistory}
            confirmText={hasHistory ? client.name : undefined}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 lg:col-span-1">
          <h2 className="font-display text-base font-semibold text-cream">Details</h2>
          <form action={updateClient} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={client.id} />
            <Field label="Name" name="name" defaultValue={client.name} />
            <Field label="Email" name="email" defaultValue={client.email || ""} />
            <Field label="Phone" name="phone" defaultValue={client.phone || ""} />
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Notes</label>
              <textarea
                name="notes"
                defaultValue={client.notes}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
              />
            </div>
            <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
          </form>

          {client.email && (
            <div className="mt-8 border-t border-white/5 pt-6">
              <h3 className="font-display text-sm font-semibold text-cream">Send Email</h3>
              {searchParams.emailed && <p className="mt-2 text-xs text-emerald-300">Email sent.</p>}
              <form action={sendCustomEmail} className="mt-3 space-y-3">
                <input type="hidden" name="clientId" value={client.id} />
                <input name="subject" placeholder="Subject" required className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
                <textarea name="message" placeholder="Message" required rows={4} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
                <SubmitButton pendingText="Sending...">Send</SubmitButton>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <HistorySection title="Inquiries" empty="No inquiries yet">
            {client.inquiries.map((i) => (
              <Row key={i.id} href={`/admin/inquiries/${i.id}`} left={i.eventType} right={<StatusBadge status={i.status} />} sub={formatDate(i.createdAt)} />
            ))}
          </HistorySection>

          <HistorySection title="Quotes" empty="No quotes yet">
            {client.quotes.map((q) => (
              <Row key={q.id} href={`/admin/quotes/${q.id}`} left={q.number} right={<StatusBadge status={q.status} />} sub={formatDate(q.createdAt)} />
            ))}
          </HistorySection>

          <HistorySection title="Bookings" empty="No bookings yet">
            {client.bookings.map((b) => (
              <Row key={b.id} href={`/admin/bookings/${b.id}`} left={`${b.eventType} — ${formatDate(b.eventDate)}`} right={<StatusBadge status={b.status} />} sub={formatMoney(b.totalCents)} />
            ))}
          </HistorySection>

          <HistorySection title="Contracts" empty="No contracts yet">
            {client.contracts.map((c) => (
              <Row key={c.id} href={`/admin/contracts/${c.id}`} left={c.number} right={<StatusBadge status={c.status} />} sub={c.title} />
            ))}
          </HistorySection>

          <HistorySection title="Payments" empty="No payments yet">
            {client.payments.map((p) => (
              <Row key={p.id} href="/admin/payments" left={formatMoney(p.amountCents)} right={<span className="text-xs text-cream/50">{p.method}</span>} sub={formatDate(p.date)} />
            ))}
          </HistorySection>

          <HistorySection title="Receipts" empty="No receipts yet">
            {client.receipts.map((r) => (
              <Row key={r.id} href={`/admin/receipts/${r.id}`} left={r.number} sub={formatDate(r.createdAt)} />
            ))}
          </HistorySection>

          <HistorySection title="Emails" empty="No emails sent yet">
            {client.emails.map((e) => (
              <Row key={e.id} href="/admin/emails" left={e.subject} right={<StatusBadge status={e.status} />} sub={formatDateTime(e.createdAt)} />
            ))}
          </HistorySection>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">{label}</label>
      <input name={name} defaultValue={defaultValue} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
    </div>
  );
}

function HistorySection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <h2 className="font-display text-base font-semibold text-cream">{title}</h2>
      <div className="mt-3 space-y-2">
        {hasChildren ? children : <p className="text-sm text-cream/40">{empty}</p>}
      </div>
    </div>
  );
}

function Row({
  href,
  left,
  right,
  sub,
}: {
  href: string;
  left: string;
  right?: React.ReactNode;
  sub?: string;
}) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5 hover:bg-white/[0.06]">
      <div>
        <p className="text-sm text-cream">{left}</p>
        {sub && <p className="text-xs text-cream/40">{sub}</p>}
      </div>
      {right}
    </Link>
  );
}
