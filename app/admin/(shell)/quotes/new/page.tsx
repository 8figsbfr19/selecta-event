import Link from "next/link";
import { prisma } from "@/lib/prisma";
import QuoteForm from "@/components/admin/QuoteForm";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: { inquiryId?: string; clientId?: string };
}) {
  const [clients, inquiry] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    searchParams.inquiryId
      ? prisma.inquiry.findUnique({ where: { id: searchParams.inquiryId } })
      : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/quotes" className="text-xs uppercase tracking-wider text-gold-300 hover:text-gold-200">
          ← All Quotes
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-cream">New Quote</h1>
      </div>

      <div className="max-w-3xl rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <QuoteForm
          clients={clients}
          defaultClientId={searchParams.clientId}
          defaultInquiryId={searchParams.inquiryId}
          defaultEventType={inquiry?.eventType}
          defaultEventDate={inquiry?.eventDate}
        />
      </div>
    </div>
  );
}
