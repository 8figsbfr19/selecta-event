"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EMAIL_TEMPLATE_KEYS } from "@/lib/constants";
import { defaultTemplateFor } from "@/lib/email-templates";
import type { EmailTemplateKey } from "@/lib/constants";

export async function saveEmailTemplate(formData: FormData) {
  const key = String(formData.get("key") || "");
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "");

  if (!EMAIL_TEMPLATE_KEYS.includes(key as (typeof EMAIL_TEMPLATE_KEYS)[number])) {
    redirect("/admin/settings?error=template");
  }
  if (!subject) {
    redirect("/admin/settings?error=template");
  }

  await prisma.emailTemplate.upsert({
    where: { key },
    update: { subject, body },
    create: { key, subject, body },
  });

  revalidatePath("/admin/settings");
  redirect("/admin/settings?templatesaved=1#email-templates");
}

export async function resetEmailTemplate(formData: FormData) {
  const key = String(formData.get("key") || "");
  if (!EMAIL_TEMPLATE_KEYS.includes(key as (typeof EMAIL_TEMPLATE_KEYS)[number])) {
    redirect("/admin/settings?error=template");
  }

  // Email templates are a fixed set of 5 keyed slots, not free-standing
  // records - "deleting" one just resets its wording back to the built-in
  // default rather than removing the row (the key always needs a value).
  const fallback = defaultTemplateFor(key as EmailTemplateKey);
  await prisma.emailTemplate.upsert({
    where: { key },
    update: { subject: fallback.subject, body: fallback.body },
    create: { key, subject: fallback.subject, body: fallback.body },
  });

  revalidatePath("/admin/settings");
  redirect("/admin/settings?templatereset=1#email-templates");
}
