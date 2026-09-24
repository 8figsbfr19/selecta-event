"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";
import { parseDateOnly } from "@/lib/dates";
import { slugify } from "@/lib/slug";

export async function saveEvent(formData: FormData) {
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "");
  const venueName = String(formData.get("venueName") || "");
  const venueAddress = String(formData.get("venueAddress") || "");
  const eventDateRaw = String(formData.get("eventDate") || "");
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const ageRestriction = String(formData.get("ageRestriction") || "All Ages");
  const capacityRaw = String(formData.get("capacity") || "");
  const rsvpDeadlineRaw = String(formData.get("rsvpDeadline") || "");
  const posterFile = formData.get("poster") as File | null;

  if (!title || !eventDateRaw) redirect("/admin/events/new?error=missing");

  let posterUrl: string | undefined;
  if (posterFile && posterFile.size > 0) {
    posterUrl = await saveUploadedFile(posterFile, "events");
  }

  const data = {
    title,
    description,
    venueName,
    venueAddress,
    eventDate: parseDateOnly(eventDateRaw),
    startTime,
    endTime,
    ageRestriction,
    capacity: capacityRaw ? parseInt(capacityRaw, 10) : null,
    rsvpDeadline: rsvpDeadlineRaw ? parseDateOnly(rsvpDeadlineRaw) : null,
    ...(posterUrl ? { posterUrl } : {}),
  };

  let eventId = id;
  if (id) {
    await prisma.event.update({ where: { id }, data });
  } else {
    let slug = slugify(title);
    const exists = await prisma.event.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    const event = await prisma.event.create({ data: { ...data, slug, status: "DRAFT" } });
    eventId = event.id;
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect(`/admin/events/${eventId}`);
}

export async function setEventStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await prisma.event.update({ where: { id }, data: { status } });
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/events");
}

export async function setEventArchived(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.event.update({ where: { id }, data: { archived } });
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/events");
  revalidatePath("/admin");
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id"));
  // RSVPs are meaningless without their event, so they cascade at the
  // database level - the delete confirmation always discloses the guest count.
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/admin");
  redirect("/admin/events?deleted=1");
}

export async function deleteRsvp(formData: FormData) {
  const id = String(formData.get("id"));
  const eventId = String(formData.get("eventId"));
  await prisma.rsvp.delete({ where: { id } });

  const event = await prisma.event.findUnique({ where: { id: eventId }, include: { rsvps: true } });
  if (event && event.status === "SOLD_OUT" && event.capacity) {
    const total = event.rsvps.reduce((s, r) => s + r.guests, 0);
    if (total < event.capacity) {
      await prisma.event.update({ where: { id: eventId }, data: { status: "PUBLISHED" } });
    }
  }

  revalidatePath(`/admin/events/${eventId}`);
}
