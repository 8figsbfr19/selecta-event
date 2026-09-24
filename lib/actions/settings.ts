"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";

export async function updateSettings(formData: FormData) {
  const logoFile = formData.get("logo") as File | null;
  let logoUrl: string | undefined;
  if (logoFile && logoFile.size > 0) {
    logoUrl = await saveUploadedFile(logoFile, "logo");
  }

  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {
      businessName: String(formData.get("businessName") || "Selecta Event"),
      djName: String(formData.get("djName") || "Selecta"),
      phone: String(formData.get("phone") || ""),
      businessEmail: String(formData.get("businessEmail") || ""),
      instagramUrl: String(formData.get("instagramUrl") || ""),
      tiktokUrl: String(formData.get("tiktokUrl") || ""),
      facebookUrl: String(formData.get("facebookUrl") || ""),
      heroHeading: String(formData.get("heroHeading") || ""),
      heroSubheading: String(formData.get("heroSubheading") || ""),
      heroDescription: String(formData.get("heroDescription") || ""),
      bio: String(formData.get("bio") || ""),
      address: String(formData.get("address") || ""),
      showEvents: formData.get("showEvents") === "on",
      requireSignedContract: formData.get("requireSignedContract") === "on",
      senderName: String(formData.get("senderName") || "Selecta Event"),
      replyToEmail: String(formData.get("replyToEmail") || ""),
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
