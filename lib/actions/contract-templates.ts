"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function saveTemplate(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const body = String(formData.get("body") || "");

  if (!name) redirect("/admin/contracts/templates?error=name");

  if (id) {
    await prisma.contractTemplate.update({ where: { id }, data: { name, body } });
  } else {
    await prisma.contractTemplate.create({ data: { name, body } });
  }

  revalidatePath("/admin/contracts/templates");
  redirect("/admin/contracts/templates");
}

export async function archiveTemplate(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.contractTemplate.update({ where: { id }, data: { archived } });
  revalidatePath("/admin/contracts/templates");
}

export async function deleteTemplate(formData: FormData) {
  const id = String(formData.get("id"));
  // Contracts created from this template are detached (templateId set null),
  // not deleted or modified - their already-resolved body text is unaffected.
  await prisma.contractTemplate.delete({ where: { id } });
  revalidatePath("/admin/contracts/templates");
  redirect("/admin/contracts/templates?deleted=1");
}

export async function duplicateTemplate(formData: FormData) {
  const id = String(formData.get("id"));
  const original = await prisma.contractTemplate.findUnique({ where: { id } });
  if (!original) return;

  await prisma.contractTemplate.create({
    data: { name: `${original.name} (Copy)`, body: original.body },
  });

  revalidatePath("/admin/contracts/templates");
}
