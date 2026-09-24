import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import ContractDocument from "@/components/site/ContractDocument";

export default async function ContractPrintPage({ params }: { params: { id: string } }) {
  const [contract, settings] = await Promise.all([
    prisma.contract.findUnique({ where: { id: params.id }, include: { client: true, booking: true } }),
    getSettings(),
  ]);
  if (!contract) notFound();

  return (
    <div className="min-h-screen bg-black/5 py-10">
      <div className="no-print mx-auto mb-4 max-w-3xl px-4">
        <button
          className="rounded-full bg-ink-950 px-5 py-2 text-sm font-semibold text-cream"
          data-print-trigger
        >
          Print / Save PDF
        </button>
      </div>
      <ContractDocument contract={contract} settings={settings} />
      <script
        dangerouslySetInnerHTML={{
          __html: `document.querySelector('[data-print-trigger]')?.addEventListener('click', () => window.print());`,
        }}
      />
    </div>
  );
}
