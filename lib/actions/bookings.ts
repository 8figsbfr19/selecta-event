"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dollarsToCents, formatMoney } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { parseDateOnly, formatDate } from "@/lib/dates";
import { sendEmail, renderEmailHtml } from "@/lib/email";

async function findOrCreateClientByName(name: string, email: string, phone: string) {
  if (email) {
    const found = await prisma.client.findFirst({ where: { email } });
    if (found) return found;
  }
  return prisma.client.create({ data: { name, email, phone } });
}

export async function saveBooking(formData: FormData) {
  const id = String(formData.get("id") || "");
  let clientId = String(formData.get("clientId") || "");
  const newClientName = String(formData.get("newClientName") || "").trim();
  const newClientEmail = String(formData.get("newClientEmail") || "").trim();
  const newClientPhone = String(formData.get("newClientPhone") || "").trim();

  if (!clientId && newClientName) {
    const client = await findOrCreateClientByName(newClientName, newClientEmail, newClientPhone);
    clientId = client.id;
  }
  if (!clientId) redirect("/admin/bookings/new?error=client");

  const data = {
    clientId,
    eventType: String(formData.get("eventType") || "Event"),
    eventDate: parseDateOnly(String(formData.get("eventDate"))),
    startTime: String(formData.get("startTime") || ""),
    endTime: String(formData.get("endTime") || ""),
    venueName: String(formData.get("venueName") || ""),
    venueAddress: String(formData.get("venueAddress") || ""),
    guestCount: formData.get("guestCount") ? parseInt(String(formData.get("guestCount")), 10) : null,
    services: JSON.stringify(
      String(formData.get("services") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
    totalCents: dollarsToCents(String(formData.get("total") || "0")),
    depositCents: dollarsToCents(String(formData.get("deposit") || "0")),
    notes: String(formData.get("notes") || ""),
    source: String(formData.get("source") || "WEBSITE"),
  };

  let bookingId = id;
  if (id) {
    await prisma.booking.update({ where: { id }, data });
  } else {
    const booking = await prisma.booking.create({ data: { ...data, status: "PENDING" } });
    bookingId = booking.id;
  }

  revalidatePath("/admin/bookings");
  redirect(`/admin/bookings/${bookingId}`);
}

async function sendBookingConfirmationEmail(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { client: true },
  });
  if (!booking || !booking.client.email) return;

  const settings = await getSettings();
  const html = renderEmailHtml({
    heading: "Your Booking Is Confirmed",
    bodyHtml: `<p>Hi ${booking.client.name},</p><p>Your <strong>${booking.eventType}</strong> booking on <strong>${formatDate(booking.eventDate)}</strong> is confirmed with ${settings.businessName}.</p><p><strong>Total:</strong> ${formatMoney(booking.totalCents)}<br/><strong>Deposit:</strong> ${formatMoney(booking.depositCents)}</p><p>We can't wait to celebrate with you!</p>`,
    businessName: settings.businessName,
    logoUrl: settings.logoUrl,
    phone: settings.phone,
    businessEmail: settings.businessEmail,
  });

  await sendEmail({
    to: booking.client.email,
    subject: `Booking Confirmed — ${settings.businessName}`,
    type: "BOOKING_CONFIRMATION",
    clientId: booking.clientId,
    bookingId: booking.id,
    html,
  });
}

export async function updateBookingStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));

  const existing = await prisma.booking.findUnique({ where: { id }, select: { status: true } });

  if (status === "CONFIRMED") {
    const settings = await getSettings();
    if (settings.requireSignedContract) {
      const signedContract = await prisma.contract.findFirst({
        where: { bookingId: id, status: "SIGNED" },
      });
      if (!signedContract) {
        redirect(`/admin/bookings/${id}?warn=contract`);
      }
    }
  }

  await prisma.booking.update({ where: { id }, data: { status } });

  if (status === "CONFIRMED" && existing?.status !== "CONFIRMED") {
    await sendBookingConfirmationEmail(id);
  }

  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
}

export async function setBookingArchived(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.booking.update({ where: { id }, data: { archived } });
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin");
}

export async function deleteBooking(formData: FormData) {
  const id = String(formData.get("id"));
  // Contracts, payments, and receipts tied to this booking are detached (not
  // deleted) at the database level - that financial and legal history survives
  // even after the booking record itself is removed.
  await prisma.booking.delete({ where: { id } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  redirect("/admin/bookings?deleted=1");
}

export async function forceConfirmBooking(formData: FormData) {
  const id = String(formData.get("id"));
  const existing = await prisma.booking.findUnique({ where: { id }, select: { status: true } });
  await prisma.booking.update({ where: { id }, data: { status: "CONFIRMED" } });

  if (existing?.status !== "CONFIRMED") {
    await sendBookingConfirmationEmail(id);
  }

  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
}
