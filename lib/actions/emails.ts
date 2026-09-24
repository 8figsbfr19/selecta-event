"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendEmail, renderEmailHtml, retrySendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

export async function sendCustomEmail(formData: FormData) {
  const clientId = String(formData.get("clientId") || "");
  const subject = String(formData.get("subject") || "");
  const message = String(formData.get("message") || "");

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || !client.email) redirect(`/admin/clients/${clientId}?error=noemail`);

  const settings = await getSettings();
  const html = renderEmailHtml({
    heading: subject,
    bodyHtml: message.replace(/\n/g, "<br/>"),
    businessName: settings.businessName,
    logoUrl: settings.logoUrl,
    phone: settings.phone,
    businessEmail: settings.businessEmail,
  });

  await sendEmail({
    to: client!.email!,
    subject,
    type: "CUSTOM",
    clientId,
    html,
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/emails");
  redirect(`/admin/clients/${clientId}?emailed=1`);
}

export async function retryEmailAction(formData: FormData) {
  const id = String(formData.get("id"));
  await retrySendEmail(id);
  revalidatePath("/admin/emails");
  redirect("/admin/emails?retried=1");
}
