"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { sendEmail, renderEmailHtml } from "@/lib/email";
import { saveDataUrlImage } from "@/lib/upload";

export async function markContractViewed(token: string) {
  const contract = await prisma.contract.findUnique({ where: { publicToken: token } });
  if (contract && contract.status === "SENT") {
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "VIEWED", viewedAt: new Date() },
    });
  }
}

export async function signContract(token: string, formData: FormData) {
  const legalName = String(formData.get("legalName") || "").trim();
  const signatureDataUrl = String(formData.get("signatureDataUrl") || "").trim();
  const agree = formData.get("agree");

  const contract = await prisma.contract.findUnique({ where: { publicToken: token }, include: { client: true } });
  if (!contract) redirect("/");

  if (!legalName || !agree) {
    redirect(`/contract/${token}?error=missing`);
  }
  if (!signatureDataUrl) {
    redirect(`/contract/${token}?error=signature`);
  }
  if (contract!.status === "SIGNED" || contract!.status === "VOIDED") {
    redirect(`/contract/${token}`);
  }

  const signatureUrl = await saveDataUrlImage(signatureDataUrl, "signatures");

  await prisma.contract.update({
    where: { id: contract!.id },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
      signerName: legalName,
      signatureUrl,
    },
  });

  const settings = await getSettings();

  // Notify the DJ
  if (settings.businessEmail) {
    await sendEmail({
      to: settings.businessEmail,
      subject: `Contract ${contract!.number} Signed by ${legalName}`,
      type: "CONTRACT",
      clientId: contract!.clientId,
      contractId: contract!.id,
      html: renderEmailHtml({
        heading: "Contract Signed",
        bodyHtml: `<p>${legalName} has signed contract <strong>${contract!.number}</strong>.</p>`,
        businessName: settings.businessName,
        logoUrl: settings.logoUrl,
      }),
    });
  }

  // Confirm to the customer
  if (contract!.client.email) {
    await sendEmail({
      to: contract!.client.email,
      subject: `Signed: ${settings.businessName} Contract ${contract!.number}`,
      type: "CONTRACT",
      clientId: contract!.clientId,
      contractId: contract!.id,
      html: renderEmailHtml({
        heading: "Your Contract Is Signed",
        bodyHtml: `<p>Hi ${contract!.client.name},</p><p>This confirms your signature on contract <strong>${contract!.number}</strong> with ${settings.businessName}. A copy is available any time using your original link.</p>`,
        businessName: settings.businessName,
        logoUrl: settings.logoUrl,
        phone: settings.phone,
        businessEmail: settings.businessEmail,
      }),
    });
  }

  redirect(`/contract/${token}?signed=1`);
}
