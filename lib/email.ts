import { Resend } from "resend";
import { prisma } from "./prisma";
import { getSettings } from "./settings";
import type { EmailTypeT } from "./constants";

let resendClient: Resend | null | undefined;

function getResendClient() {
  if (resendClient !== undefined) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  resendClient = apiKey ? new Resend(apiKey) : null;
  return resendClient;
}

function absoluteUrl(path: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Wraps inner content in the shared Selecta Event branded email shell:
 * dark header with logo, clean white content card, optional gold CTA button.
 */
export function renderEmailHtml(options: {
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  businessName: string;
  logoUrl: string;
  phone?: string;
  businessEmail?: string;
}) {
  const logo = absoluteUrl(options.logoUrl);
  const cta =
    options.ctaLabel && options.ctaUrl
      ? `<div style="text-align:center;margin:32px 0 8px;">
           <a href="${options.ctaUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(180deg,#f6dd8a,#b8892f);color:#050408;text-decoration:none;border-radius:999px;font-weight:700;font-size:14px;letter-spacing:0.02em;">
             ${options.ctaLabel}
           </a>
         </div>
         <p style="text-align:center;font-size:11px;color:#9a9a9a;word-break:break-all;">${options.ctaUrl}</p>`
      : "";

  const contactLine = [options.phone, options.businessEmail].filter(Boolean).join(" · ");

  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
  <body style="margin:0;padding:0;background:#0d0b12;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0b12;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#050408;border-radius:20px;overflow:hidden;border:1px solid rgba(230,193,92,0.25);">
            <tr>
              <td align="center" style="padding:32px 24px 20px;">
                ${logo ? `<img src="${logo}" alt="${options.businessName}" width="56" height="56" style="border-radius:999px;display:block;margin:0 auto 12px;object-fit:cover;" />` : ""}
                <p style="margin:0;color:#f7efdd;font-size:18px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${options.businessName}</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f7efdd;padding:32px 28px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:#0d0b12;font-family:Georgia,serif;">${options.heading}</h1>
                <div style="font-size:14px;line-height:1.7;color:#2a2a2a;">${options.bodyHtml}</div>
                ${cta}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 24px 28px;background:#f7efdd;">
                <p style="margin:0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8a8a8a;">
                  ${options.businessName}${contactLine ? ` · ${contactLine}` : ""}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  type: EmailTypeT;
  clientId?: string;
  contractId?: string;
  receiptId?: string;
  bookingId?: string;
  quoteId?: string;
}) {
  const settings = await getSettings();
  const client = getResendClient();

  let status: "SENT" | "FAILED" = "FAILED";
  let error: string | null = null;

  if (!client) {
    error = "RESEND_API_KEY is not configured.";
  } else if (!options.to) {
    error = "No recipient email address.";
  } else {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "no-reply@selectaevent.com";
      const { error: sendError } = await client.emails.send({
        from: `${settings.senderName || settings.businessName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: settings.replyToEmail || undefined,
      });
      if (sendError) {
        error = sendError.message || "Resend rejected the email.";
      } else {
        status = "SENT";
      }
    } catch (err) {
      console.error("Email send failed:", err);
      error = err instanceof Error ? err.message : "Unknown send error.";
    }
  }

  await prisma.emailLog.create({
    data: {
      to: options.to,
      subject: options.subject,
      type: options.type,
      status,
      body: options.html,
      error,
      clientId: options.clientId,
      contractId: options.contractId,
      receiptId: options.receiptId,
      bookingId: options.bookingId,
      quoteId: options.quoteId,
    },
  });

  return status;
}

/** Re-sends the exact content of a previous (typically failed) EmailLog entry. */
export async function retrySendEmail(logId: string) {
  const original = await prisma.emailLog.findUnique({ where: { id: logId } });
  if (!original) return null;

  return sendEmail({
    to: original.to,
    subject: original.subject,
    html: original.body,
    type: original.type as EmailTypeT,
    clientId: original.clientId ?? undefined,
    contractId: original.contractId ?? undefined,
    receiptId: original.receiptId ?? undefined,
    bookingId: original.bookingId ?? undefined,
    quoteId: original.quoteId ?? undefined,
  });
}
