import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/dates";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";

function getWeekendRange() {
  const now = new Date();
  const day = now.getDay(); // 0 Sun ... 6 Sat
  const daysUntilSat = (6 - day + 7) % 7;
  const saturday = new Date(now);
  saturday.setHours(0, 0, 0, 0);
  saturday.setDate(now.getDate() + daysUntilSat);
  const mondayAfter = new Date(saturday);
  mondayAfter.setDate(saturday.getDate() + 2);
  return { start: saturday, end: mondayAfter };
}

export default async function AdminDashboardPage() {
  const { start, end } = getWeekendRange();
  const now = new Date();

  const [
    weekendBookings,
    upcomingBookings,
    newInquiries,
    pendingQuotes,
    unsignedContracts,
    upcomingEvents,
    allBookings,
    allPayments,
    recentPayments,
    recentInquiries,
    unsignedContractsCount,
    quotesAwaitingCount,
    moneyBookings,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: { eventDate: { gte: start, lt: end }, status: { not: "CANCELLED" }, archived: false },
      include: { client: true },
      orderBy: { eventDate: "asc" },
    }),
    prisma.booking.findMany({
      where: { eventDate: { gte: now }, status: { in: ["PENDING", "CONFIRMED"] }, archived: false },
      include: { client: true },
      orderBy: { eventDate: "asc" },
      take: 6,
    }),
    prisma.inquiry.findMany({
      where: { status: "NEW", archived: false },
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.quote.findMany({
      where: { status: "SENT", archived: false },
      include: { client: true },
      orderBy: { sentAt: "desc" },
      take: 6,
    }),
    prisma.contract.findMany({
      where: { status: { in: ["SENT", "VIEWED"] }, archived: false },
      include: { client: true },
      orderBy: { sentAt: "desc" },
      take: 6,
    }),
    prisma.event.findMany({
      where: { eventDate: { gte: now }, status: { in: ["PUBLISHED", "SOLD_OUT"] }, archived: false },
      orderBy: { eventDate: "asc" },
      take: 5,
    }),
    prisma.booking.findMany({ where: { status: { not: "CANCELLED" }, archived: false } }),
    prisma.payment.findMany({ where: { archived: false } }),
    prisma.payment.findMany({
      where: { archived: false },
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.inquiry.findMany({
      where: { archived: false },
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.contract.count({ where: { status: { in: ["SENT", "VIEWED"] }, archived: false } }),
    prisma.quote.count({ where: { status: "SENT", archived: false } }),
    prisma.booking.findMany({
      where: { status: { not: "CANCELLED" }, archived: false },
      include: { payments: true },
    }),
  ]);

  const totalRevenue = allPayments.reduce((s, p) => s + p.amountCents, 0);
  const totalBookingValue = allBookings.reduce((s, b) => s + b.totalCents, 0);
  const outstanding = Math.max(totalBookingValue - totalRevenue, 0);

  let depositsOutstandingCount = 0;
  let balancesOutstandingCount = 0;
  for (const b of moneyBookings) {
    const paid = b.payments.reduce((s, p) => s + p.amountCents, 0);
    const depositDue = paid < b.depositCents;
    const balanceDue = paid < b.totalCents;
    if (depositDue) depositsOutstandingCount++;
    else if (balanceDue) balancesOutstandingCount++;
  }

  const needsAttention = [
    {
      label: "Unsigned Contracts",
      count: unsignedContractsCount,
      href: "/admin/contracts?status=UNSIGNED",
    },
    {
      label: "Deposits Outstanding",
      count: depositsOutstandingCount,
      href: "/admin/bookings?filter=deposit_due",
    },
    {
      label: "Balances Outstanding",
      count: balancesOutstandingCount,
      href: "/admin/bookings?filter=balance_due",
    },
    {
      label: "Quotes Awaiting Response",
      count: quotesAwaitingCount,
      href: "/admin/quotes?status=SENT",
    },
  ].filter((item) => item.count > 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-cream">Dashboard</h1>
        <p className="mt-1 text-sm text-cream/50">Here&apos;s what&apos;s happening with the business.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Bookings" value={String(allBookings.length)} />
        <StatCard label="Revenue Collected" value={formatMoney(totalRevenue)} />
        <StatCard label="Outstanding Balance" value={formatMoney(outstanding)} accent />
        <StatCard label="Upcoming Events" value={String(upcomingEvents.length)} />
      </div>

      {needsAttention.length > 0 && (
        <div className="rounded-2xl border border-gold-400/20 bg-gold-400/[0.04] p-5">
          <h2 className="font-display text-base font-semibold text-gold-200">Needs Attention</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {needsAttention.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 rounded-full border border-gold-400/30 bg-white/[0.03] px-4 py-2 text-sm text-cream/80 hover:bg-white/[0.06]"
              >
                <span className="font-display font-semibold text-gold-300">{item.count}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="This Weekend's Jobs" href="/admin/calendar">
          {weekendBookings.length === 0 ? (
            <EmptyState title="Nothing booked this weekend" />
          ) : (
            <ul className="space-y-3">
              {weekendBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-cream">{b.client.name} — {b.eventType}</p>
                    <p className="text-xs text-cream/50">{formatDate(b.eventDate)} {b.startTime && `· ${b.startTime}`}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming Bookings" href="/admin/bookings">
          {upcomingBookings.length === 0 ? (
            <EmptyState title="No upcoming bookings" />
          ) : (
            <ul className="space-y-3">
              {upcomingBookings.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/bookings/${b.id}`} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06]">
                    <div>
                      <p className="text-sm font-medium text-cream">{b.client.name} — {b.eventType}</p>
                      <p className="text-xs text-cream/50">{formatDate(b.eventDate)}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="New Inquiries" href="/admin/inquiries">
          {newInquiries.length === 0 ? (
            <EmptyState title="No new inquiries" />
          ) : (
            <ul className="space-y-3">
              {newInquiries.map((i) => (
                <li key={i.id}>
                  <Link href={`/admin/inquiries/${i.id}`} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06]">
                    <div>
                      <p className="text-sm font-medium text-cream">{i.client.name} — {i.eventType}</p>
                      <p className="text-xs text-cream/50">{formatDate(i.createdAt)}</p>
                    </div>
                    <StatusBadge status={i.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Pending Quotes" href="/admin/quotes">
          {pendingQuotes.length === 0 ? (
            <EmptyState title="No quotes awaiting response" />
          ) : (
            <ul className="space-y-3">
              {pendingQuotes.map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/quotes/${q.id}`} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06]">
                    <div>
                      <p className="text-sm font-medium text-cream">{q.number} — {q.client.name}</p>
                      <p className="text-xs text-cream/50">Sent {q.sentAt ? formatDate(q.sentAt) : ""}</p>
                    </div>
                    <StatusBadge status={q.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Unsigned Contracts" href="/admin/contracts">
          {unsignedContracts.length === 0 ? (
            <EmptyState title="No contracts waiting on a signature" />
          ) : (
            <ul className="space-y-3">
              {unsignedContracts.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/contracts/${c.id}`} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06]">
                    <div>
                      <p className="text-sm font-medium text-cream">{c.number} — {c.client.name}</p>
                      <p className="text-xs text-cream/50">Sent {c.sentAt ? formatDate(c.sentAt) : ""}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming Events" href="/admin/events">
          {upcomingEvents.length === 0 ? (
            <EmptyState title="No upcoming public events" />
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/events/${e.id}`} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06]">
                    <div>
                      <p className="text-sm font-medium text-cream">{e.title}</p>
                      <p className="text-xs text-cream/50">{formatDate(e.eventDate)}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Recent Payments" href="/admin/payments">
          {recentPayments.length === 0 ? (
            <EmptyState title="No payments recorded yet" />
          ) : (
            <ul className="space-y-3">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-cream">{p.client.name}</p>
                    <p className="text-xs text-cream/50">{formatDate(p.date)}</p>
                  </div>
                  <p className="text-sm font-semibold text-gold-300">{formatMoney(p.amountCents)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent Activity" href="/admin/inquiries">
          {recentInquiries.length === 0 ? (
            <EmptyState title="No activity yet" />
          ) : (
            <ul className="space-y-3">
              {recentInquiries.map((i) => (
                <li key={i.id} className="rounded-xl bg-white/[0.03] px-4 py-3">
                  <p className="text-sm text-cream">
                    New inquiry from <span className="font-medium">{i.client.name}</span> for {i.eventType}
                  </p>
                  <p className="text-xs text-cream/40">{formatDateTime(i.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-wider text-cream/40">{label}</p>
      <p className={`mt-2 font-display text-2xl font-semibold ${accent ? "text-gold-300" : "text-cream"}`}>{value}</p>
    </div>
  );
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-cream">{title}</h2>
        <Link href={href} className="text-xs font-semibold uppercase tracking-wider text-gold-300 hover:text-gold-200">
          View All
        </Link>
      </div>
      {children}
    </div>
  );
}
