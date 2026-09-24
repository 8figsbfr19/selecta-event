"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseDateOnly } from "@/lib/dates";

export async function blockDate(formData: FormData) {
  const dateRaw = String(formData.get("date") || "");
  const reason = String(formData.get("reason") || "Unavailable");
  if (!dateRaw) return;

  await prisma.calendarBlock.create({ data: { date: parseDateOnly(dateRaw), reason } });
  revalidatePath("/admin/calendar");
}

export async function unblockDate(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.calendarBlock.delete({ where: { id } });
  revalidatePath("/admin/calendar");
}
