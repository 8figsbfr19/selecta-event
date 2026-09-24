"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dollarsToCents, formatMoney } from "@/lib/money";
import { nextNumber } from "@/lib/numbering";
import { sendEmail, renderEmailHtml } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { formatDate, parseDateOnly } from "@/lib/dates";

export async function recordPayment(formData: FormData) {
  const clientId = String(formData.get("clientId") || "");
  const bookingId = String(formData.get("bookingId") || "") || null;
  const amount = dollarsToCents(String(formData.get("amount") || "0"));
  const dateRaw = String(formData.get("date") || "");
  const method = String(formData.get("method") || "ETRANSFER");
  const type = String(formData.get("type") || "DEPOSIT");
  const notes = String(formData.get("notes") || "");

  if (!clientId || amount <= 0) redirect("/admin/payments/new?error=invalid");

  const payment = await prisma.payment.create({
    data: {
      clientId,
      bookingId,
      amountCents: amount,
      date: dateRaw ? parseDateOnly(dateRaw) : new Date(),
      method,
      type,
      notes,
    },
  });

  revalidatePath("/admin/payments");
  if (bookingId) revalidatePath(`/admin/bookings/${bookingId}`);
  redirect(`/admin/payments/${payment.id}/receipt`);
}

export async function setPaymentArchived(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.payment.update({ where: { id }, data: { archived } });
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

export async function deletePayment(formData: FormData) {
  const id = String(formData.get("id"));
  // A receipt can't exist without its payment, so it cascades here - this is
  // disclosed in the delete confirmation before it ever runs. The booking
  // itself is untouched; only the payment record and its receipt go away.
  const payment = await prisma.payment.findUnique({ where: { id } });
  await prisma.payment.delete({ where: { id } });
  if (payment?.bookingId) revalidatePath(`/admin/bookings/${payment.bookingId}`);
  revalidatePath("/admin/payments");
  revalidatePath("/admin/receipts");
  revalidatePath("/admin");
  redirect("/admin/payments?deleted=1");
}

export async function setReceiptArchived(formData: FormData) {
  const id = String(formData.get("id"));
  const archived = String(formData.get("archived")) === "true";
  await prisma.receipt.update({ where: { id }, data: { archived } });
  revalidatePath("/admin/receipts");
  revalidatePath("/admin");
}

export async function deleteReceipt(formData: FormData) {
  const id = String(formData.get("id"));
  // The underlying payment is untouched - only the receipt document is removed.
  await prisma.receipt.delete({ where: { id } });
  revalidatePath("/admin/receipts");
  revalidatePath("/admin");
  redirect("/admin/receipts?deleted=1");
}

export async function generateReceipt(formData: FormData) {
  const paymentId = String(formData.get("paymentId"));

  const existing = await prisma.receipt.findUnique({ where: { paymentId } });
  if (existing) redirect(`/admin/receipts/${existing.id}`);

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) redirect("/admin/payments");

  const number = await nextNumber("receipt");
  const receipt = await prisma.receipt.create({
    data: {
      number,
      clientId: payment!.clientId,
      bookingId: payment!.bookingId,
      paymentId: payment!.id,
    },
  });

  revalidatePath("/admin/receipts");
  redirect(`/admin/receipts/${receipt.id}`);
}

export async function emailReceipt(formData: FormData) {
  const id = String(formData.get("id"));
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: { client: true, payment: true, booking: true },
  });
  if (!receipt) return;

  const settings = await getSettings();

  if (receipt.client.email) {
    const html = renderEmailHtml({
      heading: `Receipt ${receipt.number}`,
      bodyHtml: `<p>Hi ${receipt.client.name},</p><p>Thank you for your payment. Here are your receipt details:</p><p><strong>Receipt:</strong> ${receipt.number}<br/><strong>Amount Paid:</strong> ${formatMoney(receipt.payment.amountCents)}<br/><strong>Date:</strong> ${formatDate(receipt.payment.date)}</p>`,
      businessName: settings.businessName,
      logoUrl: settings.logoUrl,
      phone: settings.phone,
      businessEmail: settings.businessEmail,
    });

    await sendEmail({
      to: receipt.client.email,
      subject: `Receipt ${receipt.number} from ${settings.businessName}`,
      type: "RECEIPT",
      clientId: receipt.clientId,
      receiptId: receipt.id,
      bookingId: receipt.bookingId ?? undefined,
      html,
    });
  }

  revalidatePath(`/admin/receipts/${id}`);
  redirect(`/admin/receipts/${id}?emailed=1`);
}
