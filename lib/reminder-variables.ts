import { formatMoney } from "./money";
import { formatDate } from "./dates";
import { resolveVariables } from "./contract-variables";

export type ReminderVariableSource = {
  client: { name: string; email?: string | null; phone?: string | null };
  booking?: {
    eventType: string;
    eventDate: Date;
    venueName?: string | null;
    venueAddress?: string | null;
    totalCents: number;
    depositCents: number;
  } | null;
  quote?: {
    number: string;
    eventType?: string | null;
    eventDate?: Date | null;
    totalCents: number;
  } | null;
  contractNumber?: string;
  paidCents?: number;
  settings: {
    djName: string;
    businessName: string;
    phone?: string;
    businessEmail?: string;
  };
};

export function buildReminderVariables(source: ReminderVariableSource): Record<string, string> {
  const b = source.booking;
  const q = source.quote;
  const remaining = b ? Math.max(b.totalCents - (source.paidCents ?? 0), 0) : 0;

  return {
    "Client Name": source.client.name || "",
    "Client Email": source.client.email || "",
    "Client Phone": source.client.phone || "",
    "Event Type": b?.eventType || q?.eventType || "",
    "Event Date": b ? formatDate(b.eventDate) : q?.eventDate ? formatDate(q.eventDate) : "",
    Venue: b?.venueName || "",
    "Venue Address": b?.venueAddress || "",
    "Contract Number": source.contractNumber || "",
    "Quote Number": q?.number || "",
    "Quote Total": q ? formatMoney(q.totalCents) : "",
    "Booking Total": b ? formatMoney(b.totalCents) : "",
    Deposit: b ? formatMoney(b.depositCents) : "",
    "Amount Paid": formatMoney(source.paidCents ?? 0),
    "Remaining Balance": formatMoney(remaining),
    "DJ Name": source.settings.djName,
    "Business Name": source.settings.businessName,
    "Business Phone": source.settings.phone || "",
    "Business Email": source.settings.businessEmail || "",
    Today: formatDate(new Date()),
  };
}

export const REMINDER_VARIABLES = [
  "Client Name",
  "Client Email",
  "Client Phone",
  "Event Type",
  "Event Date",
  "Venue",
  "Venue Address",
  "Contract Number",
  "Quote Number",
  "Quote Total",
  "Booking Total",
  "Deposit",
  "Amount Paid",
  "Remaining Balance",
  "DJ Name",
  "Business Name",
  "Business Phone",
  "Business Email",
  "Today",
];

export { resolveVariables };
