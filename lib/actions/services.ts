"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dollarsToCents } from "@/lib/money";
import { saveUploadedFile } from "@/lib/upload";

export async function saveService(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "");
  const startingPriceRaw = String(formData.get("startingPrice") || "");
  const file = formData.get("image") as File | null;

  if (!name) redirect("/admin/services?error=name");

  let imageUrl: string | undefined;
  if (file && file.size > 0) {
    imageUrl = await saveUploadedFile(file, "services");
  }

  const data = {
    name,
    description,
    startingPriceCents: startingPriceRaw ? dollarsToCents(startingPriceRaw) : null,
    ...(imageUrl ? { imageUrl } : {}),
  };

  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    const count = await prisma.service.count();
    await prisma.service.create({ data: { ...data, sortOrder: count } });
  }

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  redirect("/admin/services");
}

export async function toggleServiceVisibility(formData: FormData) {
  const id = String(formData.get("id"));
  const visible = String(formData.get("visible")) === "true";
  await prisma.service.update({ where: { id }, data: { visible } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function deleteService(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function setServiceArchived(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.service.update({ where: { id }, data: { archived } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}
