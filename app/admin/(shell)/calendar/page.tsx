import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { blockDate, unblockDate } from "@/lib/actions/calendar";
import ConfirmSubmit from "@/components/ui/ConfirmSubmit";
import { isSameDay, formatDate, parseDateOnly } from "@/lib/dates";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseMonthParam(param?: string) {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [y, m] = param.split("-").map(Number);
    return { year: y, month: m - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function parseWeekParam(param?: string) {
  const base = param && /^\d{4}-\d{2}-\d{2}$/.test(param) ? parseDateOnly(param) : new Date();
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  start.setDate(base.getDate() - base.getDay());
  return start;
}

function toParam(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string; week?: string; view?: string };
}) {
  const view = searchParams.view === "week" ? "week" : "month";
  const { year, month } = parseMonthParam(searchParams.month);
  const weekStart = parseWeekParam(searchParams.week);

  const rangeStart = view === "week" ? weekStart : new Date(year, month, 1);
  const rangeEnd =
    view === "week"
      ? new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7)
      : new Date(year, month + 1, 1);

  const [bookings, events, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: { eventDate: { gte: rangeStart, lt: rangeEnd }, status: { not: "CANCELLED" } },
      include: { client: true },
    }),
    prisma.event.findMany({
      where: { eventDate: { gte: rangeStart, lt: rangeEnd }, status: { in: ["PUBLISHED", "SOLD_OUT", "DRAFT"] } },
    }),
    prisma.calendarBlock.findMany({ where: { date: { gte: rangeStart, lt: rangeEnd } } }),
  ]);

  function itemsFor(day: Date) {
    return {
      bookings: bookings.filter((b) => isSameDay(b.eventDate, day)),
      events: events.filter((e) => isSameDay(e.eventDate, day)),
      blocks: blocks.filter((b) => isSameDay(b.date, day)),
    };
  }

  let monthCells: (Date | null)[] = [];
  if (view === "month") {
    const firstWeekday = rangeStart.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstWeekday; i++) monthCells.push(null);
    for (let d = 1; d <= daysInMonth; d++) monthCells.push(new Date(year, month, d));
    while (monthCells.length % 7 !== 0) monthCells.push(null);
  }

  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const prevMonthParam = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthParam = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

  const prevWeek = new Date(weekStart);
  prevWeek.setDate(weekStart.getDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(weekStart.getDate() + 7);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cream">Calendar</h1>
          <p className="mt-1 text-sm text-cream/50">Bookings, events, and blocked dates at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          {view === "month" ? (
            <>
              <Link href={`/admin/calendar?month=${prevMonthParam}&view=month`} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-cream/70 hover:bg-white/5">←</Link>
              <span className="font-display text-lg text-cream">{MONTH_NAMES[month]} {year}</span>
              <Link href={`/admin/calendar?month=${nextMonthParam}&view=month`} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-cream/70 hover:bg-white/5">→</Link>
            </>
          ) : (
            <>
              <Link href={`/admin/calendar?week=${toParam(prevWeek)}&view=week`} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-cream/70 hover:bg-white/5">←</Link>
              <span className="font-display text-lg text-cream">{formatDate(weekDays[0])} – {formatDate(weekDays[6])}</span>
              <Link href={`/admin/calendar?week=${toParam(nextWeek)}&view=week`} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-cream/70 hover:bg-white/5">→</Link>
            </>
          )}
          <div className="ml-4 flex overflow-hidden rounded-full border border-white/15">
            <Link href={`/admin/calendar?view=month`} className={`px-3 py-1.5 text-xs ${view === "month" ? "bg-gold-400/20 text-gold-200" : "text-cream/50"}`}>Month</Link>
            <Link href={`/admin/calendar?view=week`} className={`px-3 py-1.5 text-xs ${view === "week" ? "bg-gold-400/20 text-gold-200" : "text-cream/50"}`}>Week</Link>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <form action={blockDate} className="flex flex-wrap items-center gap-2">
          <input type="date" name="date" required className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:border-gold-400/50 focus:outline-none" />
          <input name="reason" placeholder="Reason (optional)" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none" />
          <button className="rounded-full border border-gold-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold-200 hover:bg-gold-400/10">
            Block Date
          </button>
        </form>
        <Link href="/admin/bookings/new" className="ml-auto rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-950 shadow-gold">
          + New Booking
        </Link>
      </div>

      {view === "month" ? (
        <>
          <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wider text-cream/40">
            {DAY_NAMES.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthCells.map((day, idx) => {
              if (!day) return <div key={idx} className="min-h-[110px] rounded-xl bg-white/[0.01]" />;
              const { bookings: dayBookings, events: dayEvents, blocks: dayBlocks } = itemsFor(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div key={idx} className={`min-h-[110px] rounded-xl border p-2 ${isToday ? "border-gold-400/40 bg-gold-400/5" : "border-white/5 bg-white/[0.02]"}`}>
                  <p className={`text-xs ${isToday ? "font-bold text-gold-300" : "text-cream/50"}`}>{day.getDate()}</p>
                  <DayItems bookings={dayBookings} events={dayEvents} blocks={dayBlocks} />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
          {weekDays.map((day, idx) => {
            const { bookings: dayBookings, events: dayEvents, blocks: dayBlocks } = itemsFor(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div key={idx} className={`min-h-[140px] rounded-xl border p-3 ${isToday ? "border-gold-400/40 bg-gold-400/5" : "border-white/5 bg-white/[0.02]"}`}>
                <p className="text-[0.65rem] uppercase tracking-wider text-cream/40">{DAY_NAMES[day.getDay()]}</p>
                <p className={`text-sm ${isToday ? "font-bold text-gold-300" : "text-cream/70"}`}>{formatDate(day)}</p>
                <div className="mt-2">
                  <DayItems bookings={dayBookings} events={dayEvents} blocks={dayBlocks} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-cream/40">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-gold-500/60" /> Booking</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-purple-500/60" /> Public Event</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500/60" /> Blocked</span>
      </div>
    </div>
  );
}

function DayItems({
  bookings,
  events,
  blocks,
}: {
  bookings: { id: string; client: { name: string } }[];
  events: { id: string; title: string }[];
  blocks: { id: string; reason: string }[];
}) {
  return (
    <div className="mt-1 space-y-1">
      {bookings.map((b) => (
        <Link key={b.id} href={`/admin/bookings/${b.id}`} className="block truncate rounded bg-gold-500/20 px-1.5 py-0.5 text-[0.65rem] text-gold-200 hover:bg-gold-500/30">
          {b.client.name}
        </Link>
      ))}
      {events.map((e) => (
        <Link key={e.id} href={`/admin/events/${e.id}`} className="block truncate rounded bg-purple-500/20 px-1.5 py-0.5 text-[0.65rem] text-purple-200 hover:bg-purple-500/30">
          {e.title}
        </Link>
      ))}
      {blocks.map((bl) => (
        <form key={bl.id} action={unblockDate}>
          <input type="hidden" name="id" value={bl.id} />
          <ConfirmSubmit
            message="Remove this block?"
            className="block w-full truncate rounded bg-red-500/20 px-1.5 py-0.5 text-left text-[0.65rem] text-red-200 hover:bg-red-500/30"
          >
            🚫 {bl.reason}
          </ConfirmSubmit>
        </form>
      ))}
    </div>
  );
}
