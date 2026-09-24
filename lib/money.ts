export function formatMoney(cents: number | null | undefined): string {
  const value = (cents ?? 0) / 100;
  return value.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  });
}

export function dollarsToCents(input: string | number | null | undefined): number {
  if (input === null || input === undefined || input === "") return 0;
  const num = typeof input === "number" ? input : parseFloat(input);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function centsToDollarsInput(cents: number | null | undefined): string {
  return ((cents ?? 0) / 100).toFixed(2);
}
