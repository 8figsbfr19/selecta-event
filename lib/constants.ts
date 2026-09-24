export const INQUIRY_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUOTE_SENT",
  "ACCEPTED",
  "DECLINED",
  "ARCHIVED",
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const QUOTE_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_SOURCES = [
  "WEBSITE",
  "INSTAGRAM",
  "WHATSAPP",
  "PHONE",
  "IN_PERSON",
  "OTHER",
] as const;
export type BookingSource = (typeof BOOKING_SOURCES)[number];

export const CONTRACT_STATUSES = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "SIGNED",
  "DECLINED",
  "EXPIRED",
  "VOIDED",
] as const;
export type ContractStatusT = (typeof CONTRACT_STATUSES)[number];

export const PAYMENT_METHODS = ["ETRANSFER", "CASH", "CREDIT", "DEBIT", "OTHER"] as const;
export type PaymentMethodT = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_TYPES = ["DEPOSIT", "PARTIAL", "FINAL", "OTHER"] as const;
export type PaymentTypeT = (typeof PAYMENT_TYPES)[number];

export const EVENT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "SOLD_OUT",
  "COMPLETED",
  "CANCELLED",
] as const;
export type EventStatusT = (typeof EVENT_STATUSES)[number];

export const EMAIL_TYPES = [
  "QUOTE",
  "QUOTE_FOLLOWUP",
  "CONTRACT",
  "CONTRACT_REMINDER",
  "BOOKING_CONFIRMATION",
  "RECEIPT",
  "RSVP_CONFIRMATION",
  "DEPOSIT_REMINDER",
  "BALANCE_REMINDER",
  "FINAL_PAYMENT_REMINDER",
  "INQUIRY_NOTIFICATION",
  "CONTACT_MESSAGE",
  "PAYMENT_REMINDER",
  "CUSTOM",
] as const;
export type EmailTypeT = (typeof EMAIL_TYPES)[number];

export const EMAIL_STATUSES = ["SENT", "FAILED", "NOT_CONFIGURED"] as const;
export type EmailStatusT = (typeof EMAIL_STATUSES)[number];

// Editable reminder/notification templates (Admin -> Settings -> Email Templates)
export const EMAIL_TEMPLATE_KEYS = [
  "CONTRACT_REMINDER",
  "DEPOSIT_REMINDER",
  "BALANCE_REMINDER",
  "FINAL_PAYMENT_REMINDER",
  "QUOTE_FOLLOWUP",
] as const;
export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  CONTRACT_REMINDER: "Unsigned Contract Reminder",
  DEPOSIT_REMINDER: "Deposit Reminder",
  BALANCE_REMINDER: "Outstanding Balance Reminder",
  FINAL_PAYMENT_REMINDER: "Final Payment Reminder",
  QUOTE_FOLLOWUP: "Quote Follow-Up",
};

// Maps a payment reminder "kind" (reuses PAYMENT_TYPES) to the template used to send it.
export const PAYMENT_REMINDER_TEMPLATE: Record<string, EmailTemplateKey> = {
  DEPOSIT: "DEPOSIT_REMINDER",
  PARTIAL: "BALANCE_REMINDER",
  FINAL: "FINAL_PAYMENT_REMINDER",
};

// Maps a payment reminder "kind" to the EmailLog type used to log/display it.
export const PAYMENT_REMINDER_EMAIL_TYPE: Record<string, string> = {
  DEPOSIT: "DEPOSIT_REMINDER",
  PARTIAL: "BALANCE_REMINDER",
  FINAL: "FINAL_PAYMENT_REMINDER",
};

export const GALLERY_TYPES = ["PHOTO", "VIDEO"] as const;
export type GalleryTypeT = (typeof GALLERY_TYPES)[number];

export const EVENT_TYPE_OPTIONS = [
  "Wedding",
  "Nightclub",
  "Birthday Party",
  "Private Party",
  "Corporate Event",
  "Cultural Event",
  "Special Event",
  "DJ + MC Event",
  "Other",
];

export const LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTE_SENT: "Quote Sent",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  ARCHIVED: "Archived",
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  SIGNED: "Signed",
  EXPIRED: "Expired",
  VOIDED: "Voided",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  SOLD_OUT: "Sold Out",
  PUBLISHED: "Published",
  WEBSITE: "Website",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  PHONE: "Phone",
  IN_PERSON: "In Person",
  OTHER: "Other",
  ETRANSFER: "E-Transfer",
  CASH: "Cash",
  CREDIT: "Credit",
  DEBIT: "Debit",
  DEPOSIT: "Deposit",
  PARTIAL: "Partial Payment",
  FINAL: "Final Payment",
  QUOTE: "Quote",
  QUOTE_FOLLOWUP: "Quote Follow-Up",
  CONTRACT: "Contract",
  CONTRACT_REMINDER: "Contract Reminder",
  BOOKING_CONFIRMATION: "Booking Confirmation",
  RECEIPT: "Receipt",
  RSVP_CONFIRMATION: "RSVP Confirmation",
  DEPOSIT_REMINDER: "Deposit Reminder",
  BALANCE_REMINDER: "Balance Reminder",
  FINAL_PAYMENT_REMINDER: "Final Payment Reminder",
  INQUIRY_NOTIFICATION: "Inquiry Notification",
  CONTACT_MESSAGE: "Contact Message",
  PAYMENT_REMINDER: "Payment Reminder",
  CUSTOM: "Custom Message",
  NOT_CONFIGURED: "Not Configured",
  FAILED: "Failed",
  UNSIGNED: "Unsigned",
  PHOTO: "Photo",
  VIDEO: "Video",
};

export function label(value: string): string {
  return LABELS[value] ?? value;
}
