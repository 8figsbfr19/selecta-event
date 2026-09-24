import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { visible: true, archived: false },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">Services</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-cream sm:text-5xl">
            Every Kind Of Night
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-cream/60 sm:text-base">
            From intimate ceremonies to sold-out club nights, choose a service or ask for a custom package.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="glass-card flex flex-col overflow-hidden rounded-2xl">
              <div className="relative aspect-video">
                {s.imageUrl ? (
                  <Image src={s.imageUrl} alt={s.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-ink-900 text-cream/20">
                    {s.name}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg font-semibold text-cream">{s.name}</h3>
                <p className="mt-2 flex-1 text-sm text-cream/60">{s.description}</p>
                {s.startingPriceCents ? (
                  <p className="mt-4 text-xs uppercase tracking-wider text-gold-300">
                    Starting at {formatMoney(s.startingPriceCents)}
                  </p>
                ) : null}
                <Link
                  href={`/quote?service=${encodeURIComponent(s.name)}`}
                  className="mt-4 inline-block rounded-full border border-gold-400/40 px-5 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gold-200 transition-colors hover:bg-gold-400/10"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
