import { prisma } from "./prisma";

type Prefix = "quote" | "contract" | "receipt";

const PREFIX_LABEL: Record<Prefix, string> = {
  quote: "Q",
  contract: "C",
  receipt: "R",
};

export async function nextNumber(prefix: Prefix): Promise<string> {
  const year = new Date().getFullYear();
  const key = `${prefix}-${year}`;

  const counter = await prisma.counter.upsert({
    where: { key },
    update: { value: { increment: 1 } },
    create: { key, value: 1 },
  });

  const seq = String(counter.value).padStart(4, "0");
  return `${PREFIX_LABEL[prefix]}-${year}-${seq}`;
}
