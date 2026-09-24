"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { nextNumber } from "@/lib/numbering";
import { dollarsToCents } from "@/lib/money";
import { parseDateOnly } from "@/lib/dates";
import { sendEmail, renderEmailHtml } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { formatMoney as fmtMoney } from "@/lib/money";

type LineItemInput = { description: string; quantity: number; price: string };

export async function saveQuote(formData: FormData) {
  const id = String(formData.get("id") || "");
  const clientId = String(formData.get("clientId") || "");
  const inquiryId = String(formData.get("inquiryId") || "") || null;
  const eventType = String(formData.get("eventType") || "");
  const eventDateRaw = String(formData.get("eventDate") || "");
  const discount = dollarsToCents(String(formData.get("discount") || "0"));
  const taxPercent = parseFloat(String(formData.get("taxPercent") || "0")) || 0;
  const deposit = dollarsToCents(String(formData.get("deposit") || "0"));
  const expiresAtRaw = String(formData.get("expiresAt") || "");
  const notes = String(formData.get("notes") || "");
  const lineItemsJson = String(formData.get("lineItemsJson") || "[]");

  if (!clientId) redirect("/admin/quotes?error=client");

  let lineItems: LineItemInput[] = [];
  try {
    lineItems = JSON.parse(lineItemsJson);
  } catch {
    lineItems = [];
  }

  const data = {
    clientId,
    inquiryId,
    eventType,
    eventDate: eventDateRaw ? parseDateOnly(eventDateRaw) : null,
    discountCents: discount,
    taxPercent,
    depositCents: deposit,
    expiresAt: expiresAtRaw ? parseDateOnly(expiresAtRaw) : null,
    notes,
  };

  let quoteId = id;

  if (id) {
    await prisma.lineItem.deleteMany({ where: { quoteId: id } });
    await prisma.quote.update({ where: { id }, data });
  } else {
    const number = await nextNumber("quote");
    const quote = await prisma.quote.create({ data: { ...data, number, status: "DRAFT" } });
    quoteId = quote.id;
  }

  if (lineItems.length > 0) {
    await prisma.lineItem.createMany({
      data: lineItems.map((li, idx) => ({
        quoteId,
        description: li.description,
        quantity: Number(li.quantity) || 1,
        priceCents: dollarsToCents(li.price),
        sortOrder: idx,
      })),
    });
  }

  if (inquiryId) {
    await prisma.inquiry.update({ where: { id: inquiryId }, data: { status: "QUOTE_SENT" } }).catch(() => {});
  }

  revalidatePath("/admin/quotes");
  redirect(`/admin/quotes/${quoteId}`);
}

export async function sendQuoteAction(formData: FormData) {
  const id = String(formData.get("id"));
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, lineItems: true },
  });
  if (!quote) return;

  const settings = await getSettings();
  const total = quote.lineItems.reduce((s, li) => s + li.priceCents * li.quantity, 0) - quote.discountCents;
  const totalWithTax = Math.round(total * (1 + quote.taxPercent / 100));

  await prisma.quote.update({ where: { id }, data: { status: "SENT", sentAt: new Date() } });

  if (quote.client.email) {
    const html = renderEmailHtml({
      heading: `Your Quote — ${quote.number}`,
      bodyHtml: `<p>Hi ${quote.client.name},</p><p>Thank you for the opportunity to quote your event. Here's your quote summary:</p><p><strong>Total:</strong> ${fmtMoney(totalWithTax)}<br/><strong>Deposit Required:</strong> ${fmtMoney(quote.depositCents)}</p><p>Reply to this email with any questions.</p>`,
      businessName: settings.businessName,
      logoUrl: settings.logoUrl,
      phone: settings.phone,
      businessEmail: settings.businessEmail,
    });

    await sendEmail({
      to: quote.client.email,
      subject: `Your Quote from ${settings.businessName} — ${quote.number}`,
      type: "QUOTE",
      clientId: quote.clientId,
      quoteId: quote.id,
      html,
    });
  }

  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin/quotes");
}

export async function markQuoteStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await prisma.quote.update({ where: { id }, data: { status, respondedAt: new Date() } });

  if (status === "ACCEPTED") {
    const quote = await prisma.quote.findUnique({ where: { id }, include: { inquiry: true } });
    if (quote?.inquiryId) {
      await prisma.inquiry.update({ where: { id: quote.inquiryId }, data: { status: "ACCEPTED" } });
    }
  }

  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin/quotes");
}

export async function setQuoteArchived(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.quote.update({ where: { id }, data: { archived } });
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin");
}

export async function deleteQuote(formData: FormData) {
  const id = String(formData.get("id"));
  // A booking converted from this quote is detached automatically (its
  // quoteId is set null at the database level) - the booking itself survives.
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  redirect("/admin/quotes?deleted=1");
}

export async function convertQuoteToBooking(formData: FormData) {
  const id = String(formData.get("id"));
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { lineItems: true, inquiry: true },
  });
  if (!quote) return;

  const subtotal = quote.lineItems.reduce((s, li) => s + li.priceCents * li.quantity, 0) - quote.discountCents;
  const total = Math.round(subtotal * (1 + quote.taxPercent / 100));

  const services = quote.lineItems.map((li) => li.description);

  const booking = await prisma.booking.create({
    data: {
      clientId: quote.clientId,
      quoteId: quote.id,
      eventType: quote.eventType || quote.inquiry?.eventType || "Event",
      eventDate: quote.eventDate || quote.inquiry?.eventDate || new Date(),
      startTime: quote.inquiry?.startTime,
      endTime: quote.inquiry?.endTime,
      venueName: quote.inquiry?.venueName,
      venueAddress: quote.inquiry?.venueAddress,
      guestCount: quote.inquiry?.guestCount,
      services: JSON.stringify(services),
      totalCents: total,
      depositCents: quote.depositCents,
      status: "PENDING",
      source: "WEBSITE",
    },
  });

  revalidatePath("/admin/bookings");
  redirect(`/admin/bookings/${booking.id}`);
}
