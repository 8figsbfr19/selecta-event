"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createClient(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) redirect("/admin/clients?error=missing");

  const client = await prisma.client.create({ data: { name, email, phone, notes } });
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${client.id}`);
}

export async function updateClient(formData: FormData) {
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const notes = String(formData.get("notes") || "");

  await prisma.client.update({ where: { id }, data: { name, email, phone, notes } });
  revalidatePath(`/admin/clients/${id}`);
  revalidatePath("/admin/clients");
}

export async function setClientArchived(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.client.update({ where: { id }, data: { archived } });
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  revalidatePath("/admin");
}

export async function deleteClient(formData: FormData) {
  const id = String(formData.get("id"));
  // The one true cascade in the app: inquiries/quotes/bookings/contracts/
  // payments/receipts all belong to this client and are meaningless without
  // them, so they're deleted at the database level. Email logs are a
  // communications record rather than "the client's data", so they detach
  // (SetNull) instead of disappearing. This is fully disclosed to the admin
  // in the delete confirmation dialog before this ever runs.
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  redirect("/admin/clients?deleted=1");
}
