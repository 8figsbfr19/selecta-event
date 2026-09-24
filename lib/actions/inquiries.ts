"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function updateInquiryStatus(id: string, status: string) {
  await prisma.inquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
}

export async function updateInquiryStatusForm(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await updateInquiryStatus(id, status);
}

export async function setInquiryArchived(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.inquiry.update({ where: { id }, data: { archived } });
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin");
}

export async function deleteInquiry(formData: FormData) {
  const id = String(formData.get("id"));
  // Any quote that came from this inquiry is detached automatically (its
  // inquiryId is set null at the database level) - it survives on its own.
  await prisma.inquiry.delete({ where: { id } });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
  redirect("/admin/inquiries?deleted=1");
}

export async function createClientManually(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) redirect("/admin/clients?error=missing");

  const client = await prisma.client.create({ data: { name, email, phone, notes } });
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${client.id}`);
}
