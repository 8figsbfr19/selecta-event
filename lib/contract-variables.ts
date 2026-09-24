import { formatMoney } from "./money";
import { formatDate } from "./dates";

export type ContractVariableSource = {
  client: { name: string; email?: string | null; phone?: string | null };
  booking?: {
    eventType: string;
    eventDate: Date;
    startTime?: string | null;
    endTime?: string | null;
    venueName?: string | null;
    venueAddress?: string | null;
    guestCount?: number | null;
    totalCents: number;
    depositCents: number;
  } | null;
  paidCents?: number;
  djName: string;
  businessName: string;
  contractDate: Date;
  contractNumber: string;
};

export function buildVariableMap(source: ContractVariableSource): Record<string, string> {
  const b = source.booking;
  const remaining = b ? Math.max(b.totalCents - (source.paidCents ?? 0), 0) : 0;

  return {
    "Client Name": source.client.name || "",
    "Client Email": source.client.email || "",
    "Client Phone": source.client.phone || "",
    "Event Type": b?.eventType || "",
    "Event Date": b ? formatDate(b.eventDate) : "",
    "Start Time": b?.startTime || "",
    "End Time": b?.endTime || "",
    Venue: b?.venueName || "",
    "Venue Address": b?.venueAddress || "",
    "Guest Count": b?.guestCount ? String(b.guestCount) : "",
    "Booking Total": b ? formatMoney(b.totalCents) : "",
    Deposit: b ? formatMoney(b.depositCents) : "",
    "Amount Paid": formatMoney(source.paidCents ?? 0),
    "Remaining Balance": formatMoney(remaining),
    "DJ Name": source.djName,
    "Business Name": source.businessName,
    "Contract Date": formatDate(source.contractDate),
    "Contract Number": source.contractNumber,
  };
}

export function resolveVariables(body: string, variables: Record<string, string>): string {
  return body.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, key: string) => {
    const value = variables[key.trim()];
    return value !== undefined ? value : match;
  });
}

export const AVAILABLE_VARIABLES = [
  "Client Name",
  "Client Email",
  "Client Phone",
  "Event Type",
  "Event Date",
  "Start Time",
  "End Time",
  "Venue",
  "Venue Address",
  "Guest Count",
  "Booking Total",
  "Deposit",
  "Amount Paid",
  "Remaining Balance",
  "DJ Name",
  "Business Name",
  "Contract Date",
  "Contract Number",
];
