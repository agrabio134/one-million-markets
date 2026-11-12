export function decimalsFor(price: number): number {
  if (!isFinite(price) || price === 0) return 2;
  if (price >= 1000) return 2;
  if (price >= 1) return price >= 100 ? 2 : 3;
  if (price >= 0.01) return 4;
  return 6;
}

export function fmt(n: number | null | undefined, d = 2): string {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function fmtPrice(n: number | null | undefined): string {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return fmt(n, decimalsFor(n));
}

export function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  const s = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${s}${Math.abs(n).toFixed(2)}%`;
}

export function fmtCompact(n: number | null | undefined): string {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 });
}

export function shortAddr(a?: string | null): string {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function parseNum(v: string): number {
  const n = parseFloat(v.replace(/,/g, ""));
  return isFinite(n) ? n : 0;
}
