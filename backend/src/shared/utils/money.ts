export function parseBRLToCents(input: string): number {
  const raw = input.trim();

  if (!raw) {
    return 0;
  }

  let sign = 1;
  let normalized = raw;

  if (normalized.startsWith("-")) {
    sign = -1;
    normalized = normalized.slice(1);
  }

  normalized = normalized.replace(/[^0-9.,]/g, "");

  if (!normalized) {
    return 0;
  }

  let intPart = normalized;
  let decimalPart = "00";

  if (normalized.includes(",")) {
    const [intRaw, decRaw] = normalized.split(",");
    intPart = (intRaw ?? "").replace(/\./g, "");
    decimalPart = (decRaw ?? "").slice(0, 2).padEnd(2, "0");
  } else if (normalized.includes(".")) {
    const parts = normalized.split(".");

    if (parts.length === 2 && parts[1].length <= 2) {
      intPart = (parts[0] ?? "").replace(/\./g, "");
      decimalPart = (parts[1] ?? "").padEnd(2, "0");
    } else {
      intPart = normalized.replace(/\./g, "");
      decimalPart = "00";
    }
  }

  const reais = parseInt(intPart || "0", 10);
  const cents = parseInt(decimalPart || "0", 10);

  return sign * (reais * 100 + cents);
}

export function formatCentsToBRL(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const reais = Math.floor(abs / 100);
  const centPart = abs % 100;

  const reaisStr = reais
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const centsStr = centPart.toString().padStart(2, "0");

  return `${sign}R$ ${reaisStr},${centsStr}`;
}

export function splitInstallmentsExact(
  totalCents: number,
  count: number
): number[] {
  if (count <= 0) {
    return [];
  }

  const sign = totalCents < 0 ? -1 : 1;
  const absTotal = Math.abs(totalCents);
  const base = Math.floor(absTotal / count);
  const remainder = absTotal % count;

  const installments = Array.from({ length: count }, (_value, index) => {
    const extra = index < remainder ? 1 : 0;
    return (base + extra) * sign;
  });

  return installments;
}
