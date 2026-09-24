import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import ContractDocument from "@/components/site/ContractDocument";
import { signContract } from "@/lib/actions/contracts-public";
import SubmitButton from "@/components/ui/SubmitButton";
import SignaturePad from "@/components/site/SignaturePad";

export default async function PublicContractPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { error?: string; signed?: string };
}) {
  const contract = await prisma.contract.findUnique({
    where: { publicToken: params.token },
    include: { client: true, booking: true },
  });
  if (!contract) notFound();

  if (contract.status === "SENT") {
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "VIEWED", viewedAt: new Date() },
    });
    contract.status = "VIEWED";
  }

  const settings = await getSettings();
  const signAction = signContract.bind(null, params.token);
  const canSign = !["SIGNED", "VOIDED", "DECLINED", "EXPIRED"].includes(contract.status);

  return (
    <div className="min-h-screen bg-radial-glow px-4 py-10 sm:px-8">
      <ContractDocument contract={contract} settings={settings} />

      <div className="mx-auto mt-6 max-w-3xl">
        {contract.status === "SIGNED" || searchParams.signed ? (
          <div className="glass-card rounded-2xl p-6 text-center">
            <p className="font-display text-lg text-emerald-300">This contract has been signed.</p>
            <p className="mt-1 text-sm text-cream/60">A confirmation has been sent to your email.</p>
          </div>
        ) : contract.status === "VOIDED" ? (
          <div className="glass-card rounded-2xl p-6 text-center text-cream/60">This contract has been voided.</div>
        ) : contract.status === "DECLINED" ? (
          <div className="glass-card rounded-2xl p-6 text-center text-cream/60">This contract was declined.</div>
        ) : canSign ? (
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <h2 className="font-display text-xl text-cream">Review &amp; Sign</h2>
            {searchParams.error === "missing" && (
              <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                Please complete your legal name and the agreement checkbox.
              </p>
            )}
            {searchParams.error === "signature" && (
              <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                Please provide your signature.
              </p>
            )}
            <form action={signAction} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">Full Legal Name</label>
                <input
                  name="legalName"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream focus:border-gold-400/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                  Signature
                </label>
                <SignaturePad />
              </div>
              <label className="flex items-start gap-2 text-sm text-cream/70">
                <input type="checkbox" name="agree" required className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-gold-500 focus:ring-gold-400" />
                I have read and agree to the terms of this agreement.
              </label>
              <SubmitButton pendingText="Signing..." className="w-full rounded-full bg-gradient-to-b from-gold-200 to-gold-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink-950 shadow-gold">
                Sign Contract
              </SubmitButton>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
