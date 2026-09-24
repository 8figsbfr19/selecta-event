import { prisma } from "./prisma";
import type { EmailTemplateKey } from "./constants";

const DEFAULTS: Record<EmailTemplateKey, { subject: string; body: string }> = {
  CONTRACT_REMINDER: {
    subject: "Reminder: Please Sign Your {{Business Name}} Contract",
    body:
      "Hi {{Client Name}},\n\nYour {{Business Name}} contract for your {{Event Type}} on {{Event Date}} is still waiting for your signature.\n\nContract Number: {{Contract Number}}\n\nPlease review and sign at your earliest convenience so we can lock in your date.",
  },
  DEPOSIT_REMINDER: {
    subject: "Deposit Reminder — {{Business Name}}",
    body:
      "Hi {{Client Name}},\n\nJust a friendly reminder that a deposit is still needed to secure {{Business Name}} for your {{Event Type}} on {{Event Date}}.\n\nBooking Total: {{Booking Total}}\nAmount Paid: {{Amount Paid}}\nRemaining Balance: {{Remaining Balance}}\n\nLet us know if you have any questions.",
  },
  BALANCE_REMINDER: {
    subject: "Outstanding Balance Reminder — {{Business Name}}",
    body:
      "Hi {{Client Name}},\n\nThis is a friendly reminder that there's an outstanding balance on your {{Event Type}} booking for {{Event Date}}.\n\nBooking Total: {{Booking Total}}\nAmount Paid: {{Amount Paid}}\nRemaining Balance: {{Remaining Balance}}\n\nThanks so much — looking forward to your event!",
  },
  FINAL_PAYMENT_REMINDER: {
    subject: "Final Payment Reminder — {{Business Name}}",
    body:
      "Hi {{Client Name}},\n\nYour event is coming up soon! This is a reminder that final payment is due for your {{Event Type}} on {{Event Date}}.\n\nBooking Total: {{Booking Total}}\nAmount Paid: {{Amount Paid}}\nRemaining Balance: {{Remaining Balance}}\n\nPlease arrange final payment before the event date. Thank you!",
  },
  QUOTE_FOLLOWUP: {
    subject: "Following Up On Your Quote — {{Business Name}}",
    body:
      "Hi {{Client Name}},\n\nJust checking in — your quote {{Quote Number}} for {{Event Date}} is still available for review.\n\nQuote Total: {{Quote Total}}\n\nLet us know if you have any questions or if you're ready to move forward!",
  },
};

export async function getEmailTemplate(key: EmailTemplateKey) {
  const existing = await prisma.emailTemplate.findUnique({ where: { key } });
  if (existing) return existing;

  const fallback = DEFAULTS[key];
  try {
    return await prisma.emailTemplate.create({
      data: { key, subject: fallback.subject, body: fallback.body },
    });
  } catch {
    // Another concurrent request created it first - just read it back.
    return prisma.emailTemplate.findUniqueOrThrow({ where: { key } });
  }
}

export async function getAllEmailTemplates() {
  const { EMAIL_TEMPLATE_KEYS } = await import("./constants");
  // Sequential, not Promise.all: avoids concurrent create races on first run
  // (SQLite + several missing rows created at once).
  const templates = [];
  for (const key of EMAIL_TEMPLATE_KEYS) {
    templates.push(await getEmailTemplate(key));
  }
  return templates;
}

export function defaultTemplateFor(key: EmailTemplateKey) {
  return DEFAULTS[key];
}
