"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseDateOnly, formatDate } from "@/lib/dates";
import { sendEmail, renderEmailHtml } from "@/lib/email";
import { getSettings } from "@/lib/settings";

async function findOrCreateClient(name: string, email: string, phone: string) {
  let client = null;
  if (email) {
    client = await prisma.client.findFirst({ where: { email } });
  }
  if (!client && phone) {
    client = await prisma.client.findFirst({ where: { phone } });
  }
  if (client) {
    return prisma.client.update({
      where: { id: client.id },
      data: {
        name: name || client.name,
        email: email || client.email,
        phone: phone || client.phone,
      },
    });
  }
  return prisma.client.create({ data: { name, email, phone } });
}

export async function submitQuoteRequest(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const eventType = String(formData.get("eventType") || "").trim();
  const eventDateRaw = String(formData.get("eventDate") || "");
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const venueName = String(formData.get("venueName") || "");
  const venueAddress = String(formData.get("venueAddress") || "");
  const guestCountRaw = String(formData.get("guestCount") || "");
  const services = formData.getAll("services").map(String);
  const budget = String(formData.get("budget") || "");
  const musicPrefs = String(formData.get("musicPrefs") || "");
  const notes = String(formData.get("notes") || "");

  if (!name || !email || !phone || !eventType) {
    redirect("/quote?error=missing");
  }

  const client = await findOrCreateClient(name, email, phone);

  await prisma.inquiry.create({
    data: {
      clientId: client.id,
      eventType,
      eventDate: eventDateRaw ? parseDateOnly(eventDateRaw) : null,
      startTime,
      endTime,
      venueName,
      venueAddress,
      guestCount: guestCountRaw ? parseInt(guestCountRaw, 10) : null,
      servicesNeeded: JSON.stringify(services),
      budget,
      musicPrefs,
      notes,
      status: "NEW",
    },
  });

  const settings = await getSettings();
  if (settings.businessEmail) {
    const html = renderEmailHtml({
      heading: "New Quote Request",
      bodyHtml: `<p>${name} just requested a quote.</p><p><strong>Event Type:</strong> ${eventType}<br/><strong>Event Date:</strong> ${eventDateRaw ? formatDate(parseDateOnly(eventDateRaw)) : "Not specified"}<br/><strong>Email:</strong> ${email}<br/><strong>Phone:</strong> ${phone}</p>`,
      businessName: settings.businessName,
      logoUrl: settings.logoUrl,
    });
    await sendEmail({
      to: settings.businessEmail,
      subject: `New Inquiry: ${name} — ${eventType}`,
      type: "INQUIRY_NOTIFICATION",
      clientId: client.id,
      html,
    });
  }

  redirect("/quote/thank-you");
}

export async function submitContactMessage(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !message) {
    redirect("/contact?error=missing");
  }

  const client = await findOrCreateClient(name, email, phone);

  const settings = await getSettings();
  if (settings.businessEmail) {
    const html = renderEmailHtml({
      heading: subject || "New Contact Message",
      bodyHtml: `<p><strong>From:</strong> ${name} (${email}${phone ? `, ${phone}` : ""})</p><p>${message.replace(/\n/g, "<br/>")}</p>`,
      businessName: settings.businessName,
      logoUrl: settings.logoUrl,
    });
    await sendEmail({
      to: settings.businessEmail,
      subject: `Contact form: ${subject || "New message"}`,
      type: "CONTACT_MESSAGE",
      clientId: client.id,
      html,
    });
  }

  redirect("/contact/thank-you");
}

export async function submitRsvp(eventId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const guestsRaw = String(formData.get("guests") || "1");
  const guests = Math.max(1, parseInt(guestsRaw, 10) || 1);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { rsvps: true },
  });
  if (!event || event.archived) redirect("/events?error=notfound");

  const totalGuests = event!.rsvps.reduce((sum, r) => sum + r.guests, 0);
  if (event!.capacity && totalGuests + guests > event!.capacity) {
    redirect(`/events/${event!.slug}?error=soldout`);
  }
  if (!name || !email) {
    redirect(`/events/${event!.slug}?error=missing`);
  }

  await prisma.rsvp.create({
    data: { eventId, name, email, phone, guests },
  });

  const newTotal = totalGuests + guests;
  if (event!.capacity && newTotal >= event!.capacity) {
    await prisma.event.update({ where: { id: eventId }, data: { status: "SOLD_OUT" } });
  }

  const settings = await getSettings();
  const html = renderEmailHtml({
    heading: "You're On The List!",
    bodyHtml: `<p>Hi ${name},</p><p>Your RSVP for <strong>${event!.title}</strong> is confirmed.</p><p><strong>Date:</strong> ${formatDate(event!.eventDate)}${event!.startTime ? ` · ${event!.startTime}` : ""}<br/>${event!.venueName ? `<strong>Venue:</strong> ${event!.venueName}<br/>` : ""}<strong>Guests:</strong> ${guests}</p>`,
    businessName: settings.businessName,
    logoUrl: settings.logoUrl,
    phone: settings.phone,
    businessEmail: settings.businessEmail,
  });
  await sendEmail({
    to: email,
    subject: `You're On The List — ${event!.title}`,
    type: "RSVP_CONFIRMATION",
    html,
  });

  redirect(`/events/${event!.slug}?rsvp=success`);
}
