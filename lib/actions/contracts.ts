"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { nextNumber } from "@/lib/numbering";
import { dollarsToCents } from "@/lib/money";
import { buildVariableMap, resolveVariables } from "@/lib/contract-variables";
import { getSettings } from "@/lib/settings";
import { sendEmail, renderEmailHtml } from "@/lib/email";
import { parseDateOnly } from "@/lib/dates";
import { getEmailTemplate } from "@/lib/email-templates";
import { buildReminderVariables } from "@/lib/reminder-variables";

const LOCKED_STATUSES = ["SIGNED", "VOIDED"];

export async function createContract(formData: FormData) {
  const clientId = String(formData.get("clientId") || "");
  const templateId = String(formData.get("templateId") || "") || null;
  const bookingId = String(formData.get("bookingId") || "") || null;
  const title = String(formData.get("title") || "Service Agreement");

  if (!clientId) redirect("/admin/contracts/new?error=client");

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) redirect("/admin/contracts/new?error=client");

  const settings = await getSettings();
  const number = await nextNumber("contract");

  let bookingData: {
    eventType: string;
    eventDate: Date;
    startTime?: string | null;
    endTime?: string | null;
    venueName?: string | null;
    venueAddress?: string | null;
    guestCount?: number | null;
    totalCents: number;
    depositCents: number;
  } | null = null;
  let paidCents = 0;

  if (bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });
    if (booking) {
      bookingData = booking;
      paidCents = booking.payments.reduce((s, p) => s + p.amountCents, 0);
    }
  } else {
    const eventDateRaw = String(formData.get("eventDate") || "");
    bookingData = {
      eventType: String(formData.get("eventType") || ""),
      eventDate: eventDateRaw ? parseDateOnly(eventDateRaw) : new Date(),
      startTime: String(formData.get("startTime") || ""),
      endTime: String(formData.get("endTime") || ""),
      venueName: String(formData.get("venueName") || ""),
      venueAddress: String(formData.get("venueAddress") || ""),
      guestCount: formData.get("guestCount") ? parseInt(String(formData.get("guestCount")), 10) : null,
      totalCents: dollarsToCents(String(formData.get("total") || "0")),
      depositCents: dollarsToCents(String(formData.get("deposit") || "0")),
    };
  }

  let body = String(formData.get("body") || "");
  if (templateId && !body) {
    const template = await prisma.contractTemplate.findUnique({ where: { id: templateId } });
    body = template?.body || "";
  }

  const variables = buildVariableMap({
    client,
    booking: bookingData,
    paidCents,
    djName: settings.djName,
    businessName: settings.businessName,
    contractDate: new Date(),
    contractNumber: number,
  });
  const resolvedBody = resolveVariables(body, variables);

  const contract = await prisma.contract.create({
    data: {
      number,
      title,
      clientId,
      bookingId,
      templateId,
      body: resolvedBody,
      status: "DRAFT",
      totalCents: bookingData?.totalCents || 0,
      depositCents: bookingData?.depositCents || 0,
      paidCents,
    },
  });

  revalidatePath("/admin/contracts");
  redirect(`/admin/contracts/${contract.id}`);
}

export async function updateContractBody(formData: FormData) {
  const id = String(formData.get("id"));
  const title = String(formData.get("title") || "");
  const body = String(formData.get("body") || "");

  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract || LOCKED_STATUSES.includes(contract.status)) {
    redirect(`/admin/contracts/${id}?error=locked`);
  }

  await prisma.contract.update({ where: { id }, data: { title, body } });
  revalidatePath(`/admin/contracts/${id}`);
  redirect(`/admin/contracts/${id}`);
}

export async function sendContractAction(formData: FormData) {
  const id = String(formData.get("id"));
  const contract = await prisma.contract.findUnique({ where: { id }, include: { client: true } });
  if (!contract) return;

  const settings = await getSettings();
  const link = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/contract/${contract.publicToken}`;

  await prisma.contract.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date() },
  });

  if (contract.client.email) {
    const html = renderEmailHtml({
      heading: `Contract ${contract.number} Ready to Review`,
      bodyHtml: `<p>Hi ${contract.client.name},</p><p>Your contract <strong>${contract.number}</strong> from ${settings.businessName} is ready for review and signature.</p>`,
      ctaLabel: "Review & Sign Contract",
      ctaUrl: link,
      businessName: settings.businessName,
      logoUrl: settings.logoUrl,
      phone: settings.phone,
      businessEmail: settings.businessEmail,
    });

    await sendEmail({
      to: contract.client.email,
      subject: `${settings.businessName} — Contract ${contract.number} Ready to Review`,
      type: "CONTRACT",
      clientId: contract.clientId,
      contractId: contract.id,
      html,
    });
  }

  revalidatePath(`/admin/contracts/${id}`);
  revalidatePath("/admin/contracts");
}

export async function sendContractReminder(formData: FormData) {
  const id = String(formData.get("id"));
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { client: true, booking: true },
  });
  if (!contract) return;

  const settings = await getSettings();
  const link = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/contract/${contract.publicToken}`;

  const template = await getEmailTemplate("CONTRACT_REMINDER");
  const variables = buildReminderVariables({
    client: contract.client,
    booking: contract.booking,
    contractNumber: contract.number,
    paidCents: contract.paidCents,
    settings,
  });

  const subject = resolveVariables(template.subject, variables);
  const message = resolveVariables(template.body, variables);

  if (contract.client.email) {
    const html = renderEmailHtml({
      heading: subject,
      bodyHtml: message.replace(/\n/g, "<br/>"),
      ctaLabel: "Review & Sign Contract",
      ctaUrl: link,
      businessName: settings.businessName,
      logoUrl: settings.logoUrl,
      phone: settings.phone,
      businessEmail: settings.businessEmail,
    });

    await sendEmail({
      to: contract.client.email,
      subject,
      type: "CONTRACT_REMINDER",
      clientId: contract.clientId,
      contractId: contract.id,
      html,
    });
  }

  revalidatePath(`/admin/contracts/${id}`);
}

export async function voidContract(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.contract.update({ where: { id }, data: { status: "VOIDED" } });
  revalidatePath(`/admin/contracts/${id}`);
  revalidatePath("/admin/contracts");
}

export async function markContractDeclined(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.contract.update({ where: { id }, data: { status: "DECLINED" } });
  revalidatePath(`/admin/contracts/${id}`);
  revalidatePath("/admin/contracts");
}

export async function setContractArchived(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.contract.update({ where: { id }, data: { archived } });
  revalidatePath("/admin/contracts");
  revalidatePath(`/admin/contracts/${id}`);
  revalidatePath("/admin");
}

export async function deleteContract(formData: FormData) {
  const id = String(formData.get("id"));
  // The confirmation dialog is the only gate here - a signed contract's
  // signature/body is never touched or detached before the admin confirms.
  await prisma.contract.delete({ where: { id } });
  revalidatePath("/admin/contracts");
  revalidatePath("/admin");
  redirect("/admin/contracts?deleted=1");
}

export async function duplicateContract(formData: FormData) {
  const id = String(formData.get("id"));
  const original = await prisma.contract.findUnique({ where: { id } });
  if (!original) return;

  const number = await nextNumber("contract");
  const created = await prisma.contract.create({
    data: {
      number,
      title: original.title,
      clientId: original.clientId,
      bookingId: original.bookingId,
      templateId: original.templateId,
      body: original.body,
      status: "DRAFT",
      totalCents: original.totalCents,
      depositCents: original.depositCents,
      paidCents: original.paidCents,
    },
  });

  revalidatePath("/admin/contracts");
  redirect(`/admin/contracts/${created.id}`);
}
