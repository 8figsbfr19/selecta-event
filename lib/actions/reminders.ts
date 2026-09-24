"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { sendEmail, renderEmailHtml } from "@/lib/email";
import { getEmailTemplate } from "@/lib/email-templates";
import { buildReminderVariables, resolveVariables } from "@/lib/reminder-variables";
import { PAYMENT_REMINDER_TEMPLATE, PAYMENT_REMINDER_EMAIL_TYPE, type EmailTypeT } from "@/lib/constants";

export async function sendPaymentReminder(formData: FormData) {
  const bookingId = String(formData.get("bookingId"));
  const kind = String(formData.get("kind") || "PARTIAL"); // DEPOSIT | PARTIAL | FINAL

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { client: true, payments: true },
  });
  if (!booking) return;

  const paidCents = booking.payments.reduce((s, p) => s + p.amountCents, 0);
  const settings = await getSettings();
  const templateKey = PAYMENT_REMINDER_TEMPLATE[kind] || "BALANCE_REMINDER";
  const emailType = PAYMENT_REMINDER_EMAIL_TYPE[kind] || "BALANCE_REMINDER";
  const template = await getEmailTemplate(templateKey);

  const variables = buildReminderVariables({
    client: booking.client,
    booking,
    paidCents,
    settings,
  });

  const subject = resolveVariables(template.subject, variables);
  const message = resolveVariables(template.body, variables);

  if (booking.client.email) {
    const html = renderEmailHtml({
      heading: subject,
      bodyHtml: message.replace(/\n/g, "<br/>"),
      businessName: settings.businessName,
      logoUrl: settings.logoUrl,
      phone: settings.phone,
      businessEmail: settings.businessEmail,
    });

    await sendEmail({
      to: booking.client.email,
      subject,
      html,
      type: emailType as EmailTypeT,
      clientId: booking.clientId,
      bookingId: booking.id,
    });
  }

  revalidatePath(`/admin/bookings/${bookingId}`);
  redirect(`/admin/bookings/${bookingId}?reminder=${kind.toLowerCase()}`);
}

export async function sendQuoteFollowUp(formData: FormData) {
  const quoteId = String(formData.get("id"));

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { client: true, lineItems: true },
  });
  if (!quote) return;

  const settings = await getSettings();
  const subtotal = quote.lineItems.reduce((s, li) => s + li.priceCents * li.quantity, 0) - quote.discountCents;
  const totalCents = Math.round(subtotal * (1 + quote.taxPercent / 100));

  const template = await getEmailTemplate("QUOTE_FOLLOWUP");
  const variables = buildReminderVariables({
    client: quote.client,
    quote: { number: quote.number, eventType: quote.eventType, eventDate: quote.eventDate, totalCents },
    settings,
  });

  const subject = resolveVariables(template.subject, variables);
  const message = resolveVariables(template.body, variables);

  if (quote.client.email) {
    const html = renderEmailHtml({
      heading: subject,
      bodyHtml: message.replace(/\n/g, "<br/>"),
      businessName: settings.businessName,
      logoUrl: settings.logoUrl,
      phone: settings.phone,
      businessEmail: settings.businessEmail,
    });

    await sendEmail({
      to: quote.client.email,
      subject,
      html,
      type: "QUOTE_FOLLOWUP",
      clientId: quote.clientId,
      quoteId: quote.id,
    });
  }

  revalidatePath(`/admin/quotes/${quoteId}`);
}
